import { parse, isValid, format } from "date-fns";
import { parseTime } from "@/lib/calculations/hours";
import type { ParsedRecord, ParseResult } from "./types";
import {
  compilePattern,
  DEFAULT_EOD_PATTERN,
  type EodPattern,
} from "./eod-pattern";
import { parseEODSmart } from "./eod-smart";

const DATE_FORMATS = [
  "MMMM d yyyy",
  "MMMM d, yyyy",
  "MMM d yyyy",
  "MMM d, yyyy",
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "MM-dd-yyyy",
  "dd/MM/yyyy",
];

/** Try to parse a free-form date tail into ISO yyyy-MM-dd. */
export function parseFlexibleDate(input: string): string | null {
  const cleaned = input.trim().replace(/\s+/g, " ").replace(",", "");
  for (const fmt of DATE_FORMATS) {
    const normalized = fmt.includes(",") ? input.trim() : cleaned;
    const d = parse(normalized, fmt, new Date());
    if (isValid(d)) return format(d, "yyyy-MM-dd");
  }
  // last resort: native Date
  const native = new Date(input);
  if (isValid(native) && !Number.isNaN(native.getTime())) {
    return format(native, "yyyy-MM-dd");
  }
  return null;
}

function cleanNote(line: string): string {
  return line
    .replace(/^[\s]*[-*•·]\s?/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Capitalize first letter of a note for consistency. */
function tidyNote(note: string): string {
  if (!note) return note;
  return note.charAt(0).toUpperCase() + note.slice(1);
}

export interface EodParseOptions {
  defaultBreakMinutes?: number;
  pattern?: EodPattern;
}

/**
 * Parse EOD-style plain text into draft records using a configurable header
 * pattern (defaults to the built-in "Day N: ..." pattern).
 *
 * Back-compat: a number may be passed as the 2nd arg (defaultBreakMinutes).
 */
export function parseEODText(
  text: string,
  options: EodParseOptions | number = {}
): ParseResult {
  const opts: EodParseOptions =
    typeof options === "number" ? { defaultBreakMinutes: options } : options;
  const defaultBreakMinutes = opts.defaultBreakMinutes ?? 0;
  const pattern = opts.pattern ?? DEFAULT_EOD_PATTERN;

  // Auto-detect mode: use the layout-agnostic smart parser.
  if (pattern.mode === "auto") {
    return parseEODSmart(text, defaultBreakMinutes);
  }

  const { regex, order } = compilePattern(pattern);
  const collectNotes = pattern.collectNotes ?? true;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const records: ParsedRecord[] = [];
  const errors: string[] = [];

  let current: ParsedRecord | null = null;
  let autoDay = 0;

  const commit = () => {
    if (current) {
      records.push(current);
      current = null;
    }
  };

  const grab = (m: RegExpMatchArray, idx?: number) =>
    idx !== undefined ? (m[idx] ?? "").trim() : "";

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const header = line.match(regex);
    if (header) {
      commit();
      autoDay += 1;
      const dayRaw = grab(header, order.day);
      const day = dayRaw ? parseInt(dayRaw, 10) : autoDay;
      const label = `Day ${day}`;

      const timeIn = order.timeIn !== undefined ? parseTime(grab(header, order.timeIn)) : null;
      const timeOut = order.timeOut !== undefined ? parseTime(grab(header, order.timeOut)) : null;
      const isoDate = order.date !== undefined ? parseFlexibleDate(grab(header, order.date)) : null;

      const warnings: string[] = [];
      if (order.timeIn !== undefined && !timeIn) warnings.push(`${label}: time in could not be detected`);
      if (order.timeOut !== undefined && !timeOut) warnings.push(`${label}: time out could not be detected`);
      if (order.date !== undefined && !isoDate) warnings.push(`${label}: date could not be detected`);

      current = {
        day,
        date: isoDate ?? "",
        timeIn: timeIn ?? "",
        timeOut: timeOut ?? "",
        breakMinutes: defaultBreakMinutes,
        notes: [],
        warnings,
      };
      continue;
    }

    // Bullet / note line belonging to the current record.
    if (current && collectNotes) {
      const note = tidyNote(cleanNote(line));
      if (note) current.notes.push(note);
    }
  }
  commit();

  if (records.length === 0) {
    errors.push(
      "No EOD records detected. Check your EOD pattern in Settings, or that each day starts with a matching heading."
    );
  }

  return { records, errors, source: "TXT" };
}
