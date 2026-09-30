import { parseTime } from "@/lib/calculations/hours";
import { parseFlexibleDate } from "./eod-parser";
import type { ParsedRecord } from "./types";

export type RawRow = Record<string, unknown>;

/** Normalize a header key: lowercase, strip non-alphanumerics. */
function normKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const FIELD_ALIASES: Record<string, string[]> = {
  day: ["day", "dayno", "daynumber", "no", "num"],
  date: ["date"],
  timeIn: ["timein", "in", "starttime", "start", "clockin"],
  timeOut: ["timeout", "out", "endtime", "end", "clockout"],
  break: ["break", "breakminutes", "breakmins", "breakmin", "lunch"],
  notes: ["notes", "note", "accomplishments", "accomplishment", "description", "eod", "remarks"],
};

/** Build a lookup from normalized header -> canonical field. */
function resolveColumns(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    const nk = normKey(h);
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(nk)) {
        map[field] = h;
        break;
      }
    }
  }
  return map;
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

/** Split notes cell into an array (supports newlines, bullets, semicolons). */
function splitNotes(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n|;|•|\u2022/)
    .map((s) => s.replace(/^[\s\-*]+/, "").trim())
    .filter(Boolean);
}

/** Excel serial or JS date -> ISO. */
function excelDateToIso(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = toStr(v);
  if (!s) return null;
  return parseFlexibleDate(s);
}

/**
 * Map raw tabular rows to ParsedRecords. Column headers are matched flexibly.
 */
export function mapRows(rows: RawRow[], source: string): { records: ParsedRecord[]; errors: string[] } {
  const records: ParsedRecord[] = [];
  const errors: string[] = [];
  if (rows.length === 0) {
    return { records, errors: [`${source}: no rows found`] };
  }

  const headers = Object.keys(rows[0]);
  const cols = resolveColumns(headers);

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // account for header row
    const warnings: string[] = [];

    const dayStr = cols.day ? toStr(row[cols.day]) : "";
    const day = dayStr ? parseInt(dayStr, 10) : idx + 1;
    if (!dayStr) warnings.push(`Row ${rowNum}: day missing, assigned ${day}`);

    const isoDate = cols.date ? excelDateToIso(row[cols.date]) : null;
    if (!isoDate) warnings.push(`Row ${rowNum}: date could not be detected`);

    const timeIn = cols.timeIn ? parseTime(toStr(row[cols.timeIn])) : null;
    if (!timeIn) warnings.push(`Row ${rowNum}: time in could not be detected`);

    const timeOut = cols.timeOut ? parseTime(toStr(row[cols.timeOut])) : null;
    if (!timeOut) warnings.push(`Row ${rowNum}: time out could not be detected`);

    const breakRaw = cols.break ? toStr(row[cols.break]) : "0";
    const breakMinutes = Number.parseInt(breakRaw, 10) || 0;

    const notes = cols.notes ? splitNotes(toStr(row[cols.notes])) : [];

    records.push({
      day: Number.isNaN(day) ? idx + 1 : day,
      date: isoDate ?? "",
      timeIn: timeIn ?? "",
      timeOut: timeOut ?? "",
      breakMinutes,
      notes,
      warnings,
    });
  });

  return { records, errors };
}
