import type { DailyRecord, DraftRecord } from "@/types/record";
import type { ParsedRecord } from "./types";

export type DuplicateStrategy = "skip" | "replace" | "copy";

export interface ValidatedRecord extends ParsedRecord {
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: string; // existing record id
}

export interface ValidationOutcome {
  rows: ValidatedRecord[];
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
}

/** Validate parsed rows against existing records; flag errors + duplicates. */
export function validateParsed(
  parsed: ParsedRecord[],
  existing: DailyRecord[]
): ValidationOutcome {
  const byDay = new Map<number, DailyRecord>();
  const byDate = new Map<string, DailyRecord>();
  for (const r of existing) {
    byDay.set(r.day, r);
    if (r.date) byDate.set(r.date, r);
  }

  const seenDays = new Set<number>();
  const seenDates = new Set<string>();

  const rows: ValidatedRecord[] = parsed.map((p) => {
    const errors: string[] = [];
    if (!p.date) errors.push("Missing or invalid date");
    if (!p.timeIn) errors.push("Missing or invalid time in");
    if (!p.timeOut) errors.push("Missing or invalid time out");
    if (!Number.isInteger(p.day) || p.day <= 0) errors.push("Invalid day number");

    // in-batch duplicates
    if (seenDays.has(p.day)) errors.push(`Duplicate day ${p.day} within import`);
    if (p.date && seenDates.has(p.date)) errors.push(`Duplicate date ${p.date} within import`);
    seenDays.add(p.day);
    if (p.date) seenDates.add(p.date);

    const dupExisting = byDay.get(p.day) ?? (p.date ? byDate.get(p.date) : undefined);
    const isDuplicate = Boolean(dupExisting);

    return {
      ...p,
      valid: errors.length === 0,
      errors,
      isDuplicate,
      duplicateOf: dupExisting?.id,
    };
  });

  return {
    rows,
    validCount: rows.filter((r) => r.valid && !r.isDuplicate).length,
    invalidCount: rows.filter((r) => !r.valid).length,
    duplicateCount: rows.filter((r) => r.isDuplicate).length,
  };
}

/**
 * Resolve which rows to import given a duplicate strategy.
 * Returns drafts to add and ids to delete (for "replace").
 */
export function resolveImport(
  rows: ValidatedRecord[],
  strategy: DuplicateStrategy
): { toAdd: DraftRecord[]; idsToRemove: string[] } {
  const toAdd: DraftRecord[] = [];
  const idsToRemove: string[] = [];

  for (const row of rows) {
    if (!row.valid) continue;
    const draft: DraftRecord = {
      day: row.day,
      date: row.date,
      timeIn: row.timeIn,
      timeOut: row.timeOut,
      breakMinutes: row.breakMinutes,
      notes: row.notes,
    };

    if (!row.isDuplicate) {
      toAdd.push(draft);
      continue;
    }

    switch (strategy) {
      case "skip":
        break;
      case "replace":
        if (row.duplicateOf) idsToRemove.push(row.duplicateOf);
        toAdd.push(draft);
        break;
      case "copy":
        toAdd.push(draft);
        break;
    }
  }

  return { toAdd, idsToRemove };
}
