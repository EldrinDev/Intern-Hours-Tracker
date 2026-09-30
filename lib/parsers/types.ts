import type { DraftRecord } from "@/types/record";

export interface ParsedRecord extends DraftRecord {
  /** Non-fatal issues (e.g. missing time-out, guessed values). */
  warnings: string[];
}

export interface ParseResult {
  records: ParsedRecord[];
  /** Fatal, per-block errors that prevented a record from being built. */
  errors: string[];
  /** Source label, e.g. "TXT", "XLSX", "CSV", "JSON". */
  source: string;
}
