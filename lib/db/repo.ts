import { getDb, ensureSettings } from "./dexie";
import { recalcSeries, sortByDayDate } from "@/lib/calculations/hours";
import { nowIso } from "@/lib/formatters/date";
import { uid } from "@/lib/utils";
import type { DailyRecord, DraftRecord } from "@/types/record";
import type { Company } from "@/types/company";
import { type OJTSettings, SETTINGS_ID } from "@/types/settings";

/* ----------------------------- Settings ----------------------------- */

export async function getSettings(): Promise<OJTSettings> {
  return ensureSettings();
}

export async function saveSettings(patch: Partial<OJTSettings>): Promise<OJTSettings> {
  const db = getDb();
  const current = await ensureSettings();
  const next = { ...current, ...patch, id: SETTINGS_ID };
  await db.settings.put(next);
  // If required hours changed, recalc all records.
  if (patch.requiredMinutes !== undefined && patch.requiredMinutes !== current.requiredMinutes) {
    await recalcAll();
  }
  return next;
}

/* ----------------------------- Company ------------------------------ */

export async function getCompany(): Promise<Company | undefined> {
  const db = getDb();
  const settings = await ensureSettings();
  if (settings.companyId) {
    const c = await db.companies.get(settings.companyId);
    if (c) return c;
  }
  return db.companies.toCollection().first();
}

export async function saveCompany(input: Omit<Company, "id"> & { id?: string }): Promise<Company> {
  const db = getDb();
  const id = input.id ?? uid();
  const company: Company = { ...input, id };
  await db.companies.put(company);
  const settings = await ensureSettings();
  if (settings.companyId !== id) {
    await db.settings.put({ ...settings, companyId: id });
  }
  return company;
}

/* ----------------------------- Records ------------------------------ */

export async function getRecords(): Promise<DailyRecord[]> {
  const db = getDb();
  const all = await db.records.toArray();
  return all.sort(sortByDayDate);
}

export async function getRecord(id: string): Promise<DailyRecord | undefined> {
  return getDb().records.get(id);
}

/** Persist all records after recalculating the whole chronological series. */
async function persistSeries(records: DailyRecord[]): Promise<void> {
  const db = getDb();
  const settings = await ensureSettings();
  const recalced = recalcSeries(records, settings.requiredMinutes);
  await db.transaction("rw", db.records, async () => {
    await db.records.clear();
    await db.records.bulkPut(recalced);
  });
}

/** Recalculate cumulative/remaining across every stored record. */
export async function recalcAll(): Promise<void> {
  const records = await getRecords();
  if (records.length === 0) return;
  await persistSeries(records);
}

export async function addRecord(draft: DraftRecord): Promise<DailyRecord> {
  const now = nowIso();
  const id = draft.id ?? uid();
  const base: DailyRecord = {
    id,
    day: draft.day,
    date: draft.date,
    timeIn: draft.timeIn,
    timeOut: draft.timeOut,
    breakMinutes: draft.breakMinutes,
    renderedMinutes: 0,
    cumulativeMinutes: 0,
    remainingMinutes: 0,
    notes: draft.notes,
    createdAt: now,
    updatedAt: now,
  };
  const existing = await getRecords();
  await persistSeries([...existing, base]);
  const saved = await getRecord(id);
  return saved!;
}

export async function updateRecord(id: string, draft: DraftRecord): Promise<void> {
  const existing = await getRecords();
  const now = nowIso();
  const next = existing.map((r) =>
    r.id === id
      ? {
          ...r,
          day: draft.day,
          date: draft.date,
          timeIn: draft.timeIn,
          timeOut: draft.timeOut,
          breakMinutes: draft.breakMinutes,
          notes: draft.notes,
          updatedAt: now,
        }
      : r
  );
  await persistSeries(next);
}

export async function deleteRecord(id: string): Promise<void> {
  const existing = await getRecords();
  await persistSeries(existing.filter((r) => r.id !== id));
}

export async function duplicateRecord(id: string): Promise<DailyRecord | undefined> {
  const existing = await getRecords();
  const src = existing.find((r) => r.id === id);
  if (!src) return undefined;
  const maxDay = existing.reduce((m, r) => Math.max(m, r.day), 0);
  const now = nowIso();
  const copy: DailyRecord = {
    ...src,
    id: uid(),
    day: maxDay + 1,
    createdAt: now,
    updatedAt: now,
  };
  await persistSeries([...existing, copy]);
  return copy;
}

/** Bulk add drafts (used by importer). Returns count added. */
export async function bulkAddRecords(drafts: DraftRecord[]): Promise<number> {
  if (drafts.length === 0) return 0;
  const now = nowIso();
  const existing = await getRecords();
  const additions: DailyRecord[] = drafts.map((d) => ({
    id: d.id ?? uid(),
    day: d.day,
    date: d.date,
    timeIn: d.timeIn,
    timeOut: d.timeOut,
    breakMinutes: d.breakMinutes,
    renderedMinutes: 0,
    cumulativeMinutes: 0,
    remainingMinutes: 0,
    notes: d.notes,
    createdAt: now,
    updatedAt: now,
  }));
  await persistSeries([...existing, ...additions]);
  return additions.length;
}

/* --------------------------- Data mgmt ------------------------------ */

export interface BackupPayload {
  version: number;
  exportedAt: string;
  settings: OJTSettings;
  company: Company | null;
  companies: Company[];
  records: DailyRecord[];
}

export async function exportBackup(): Promise<BackupPayload> {
  const db = getDb();
  const [settings, companies, records] = await Promise.all([
    ensureSettings(),
    db.companies.toArray(),
    getRecords(),
  ]);
  const company = await getCompany();
  return {
    version: 1,
    exportedAt: nowIso(),
    settings,
    company: company ?? null,
    companies,
    records,
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.companies, db.records, db.settings, async () => {
    await Promise.all([db.companies.clear(), db.records.clear(), db.settings.clear()]);
    if (payload.settings) await db.settings.put({ ...payload.settings, id: SETTINGS_ID });
    if (payload.companies?.length) await db.companies.bulkPut(payload.companies);
    else if (payload.company) await db.companies.put(payload.company);
    if (payload.records?.length) await db.records.bulkPut(payload.records);
  });
  await recalcAll();
}

export async function clearAllData(): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.companies, db.records, db.settings, async () => {
    await Promise.all([db.companies.clear(), db.records.clear(), db.settings.clear()]);
  });
  await ensureSettings();
}
