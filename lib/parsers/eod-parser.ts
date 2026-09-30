import { parse, isValid, format } from "date-fns";
import { parseTime } from "@/lib/calculations/hours";
import type { ParsedRecord, ParseResult } from "./types";

/**
 * Header pattern:
 *   Day 1: 10:20AM - 7:19PM August 3 2026
 *   DAY 1: 10:20 AM – 7:19 PM August 3, 2026
 * Captures: day, timeIn, timeOut, date-tail.
 */
const HEADER_RE =
  /^day\s+(\d+)\s*[:.\-]?\s*(.+?)\s*[-–—to]+\s*(.+?)\s+([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*$/i;

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

/**
 * Parse EOD-style plain text into draft records.
 * Blocks begin at a "Day N:" header and collect subsequent bullet lines.
 */
export function parseEODText(text: string, defaultBreakMinutes = 0): ParseResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const records: ParsedRecord[] = [];
  const errors: string[] = [];

  let current: ParsedRecord | null = null;
  let currentDayLabel = "";

  const commit = () => {
    if (current) {
      // merge continuation notes that lacked bullets already handled
      records.push(current);
      current = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const header = line.match(HEADER_RE);
    if (header) {
      commit();
      const day = parseInt(header[1], 10);
      currentDayLabel = `Day ${day}`;
      const timeIn = parseTime(header[2]);
      const timeOut = parseTime(header[3]);
      const isoDate = parseFlexibleDate(header[4]);

      const warnings: string[] = [];
      if (!timeIn) warnings.push(`${currentDayLabel}: time in could not be detected`);
      if (!timeOut) warnings.push(`${currentDayLabel}: time out could not be detected`);
      if (!isoDate) warnings.push(`${currentDayLabel}: date could not be detected`);

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

    // Bullet or note line belonging to current record
    if (current) {
      const note = tidyNote(cleanNote(line));
      if (note) current.notes.push(note);
    }
    // lines before any header are ignored
  }
  commit();

  if (records.length === 0) {
    errors.push(
      "No EOD records detected. Expected headings like: \"Day 1: 10:20AM - 7:19PM August 3 2026\"."
    );
  }

  return { records, errors, source: "TXT" };
}
