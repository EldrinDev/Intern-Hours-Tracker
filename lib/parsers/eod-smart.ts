import { parseTime } from "@/lib/calculations/hours";
import { parseFlexibleDate } from "./eod-parser";
import type { ParsedRecord, ParseResult } from "./types";

/**
 * Smart, layout-agnostic EOD parser.
 *
 * It does NOT require a fixed single-line header. Instead it splits the text
 * into day blocks (a block starts at any line that begins with "Day N") and
 * then scans every line in the block to extract:
 *   - day number
 *   - date (in the Day line or on its own line)
 *   - time in / time out (labelled "Time In:", separated by "|", on one or
 *     two lines, 12h or 24h)
 * Remaining bullet/paragraph lines become notes, while section headers like
 * "Morning" / "Afternoon" are skipped.
 *
 * Handles formats such as:
 *   Day 40
 *   September 30, 2026
 *   Time In: 10:04 AM
 *   Time Out: 8:00 PM
 *
 *   Day 39 – September 30, 2026
 *   Time In: 10:25 AM | Time Out: 7:00 PM
 *
 *   Day 1: 10:20AM - 7:19PM August 3 2026
 */

const DAY_START_RE = /^\s*day\s+(\d+)\b/i;
const TIME_RE = /\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?/;
const TIME_IN_LABEL_RE = /time\s*in\s*[:\-]?\s*(.+?)(?:\s*[|,/]\s*time\s*out.*)?$/i;
const TIME_OUT_LABEL_RE = /time\s*out\s*[:\-]?\s*(.+?)\s*$/i;
const SECTION_RE = /^(morning|afternoon|evening|a\.?m\.?|p\.?m\.?|notes?|accomplishments?|tasks?|summary)\s*[:：]?\s*$/i;

/** Pull the first date-looking substring out of a line and return ISO. */
function findDateInLine(line: string): string | null {
  // Month name + day + year, e.g. "September 30, 2026"
  const monthName = line.match(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/);
  if (monthName) {
    const iso = parseFlexibleDate(monthName[0]);
    if (iso) return iso;
  }
  // Numeric dates: 2026-09-30, 09/30/2026, 9-30-26
  const numeric = line.match(/\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
  if (numeric) {
    const iso = parseFlexibleDate(numeric[0]);
    if (iso) return iso;
  }
  return null;
}

/** Extract both times from a single line that contains in AND out. */
function findTimesInLine(line: string): { timeIn?: string; timeOut?: string } {
  const result: { timeIn?: string; timeOut?: string } = {};
  const lower = line.toLowerCase();

  if (lower.includes("time in") || lower.includes("time out")) {
    const inMatch = line.match(/time\s*in\s*[:\-]?\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i);
    const outMatch = line.match(/time\s*out\s*[:\-]?\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i);
    if (inMatch) result.timeIn = parseTime(inMatch[1]) ?? undefined;
    if (outMatch) result.timeOut = parseTime(outMatch[1]) ?? undefined;
    return result;
  }

  // Fallback: "10:20AM - 7:19PM" style (two times split by a dash / "to")
  const range = line.match(
    /(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)\s*(?:[-–—]|to)\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i
  );
  if (range) {
    result.timeIn = parseTime(range[1]) ?? undefined;
    result.timeOut = parseTime(range[2]) ?? undefined;
  }
  return result;
}

function cleanNote(line: string): string {
  return line
    .replace(/^[\s]*[-*•·]\s?/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tidyNote(note: string): string {
  return note ? note.charAt(0).toUpperCase() + note.slice(1) : note;
}

/** Does this line carry time/date metadata (so it shouldn't be a note)? */
function isMetaLine(line: string): boolean {
  const lower = line.toLowerCase();
  if (lower.includes("time in") || lower.includes("time out")) return true;
  if (findDateInLine(line)) {
    // a date-only line (or mostly date) is meta, not a note
    const stripped = line.replace(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/, "").replace(/[^\w]/g, "");
    if (stripped.length <= 4) return true;
  }
  return false;
}

interface Block {
  dayLine: string;
  lines: string[];
}

/** Split raw text into day blocks. */
function splitBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (DAY_START_RE.test(line)) {
      if (current) blocks.push(current);
      current = { dayLine: line, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

/** Parse one block into a record. */
function parseBlock(block: Block, autoDay: number, defaultBreakMinutes: number): ParsedRecord {
  const dayMatch = block.dayLine.match(DAY_START_RE);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : autoDay;
  const label = `Day ${day}`;

  let date = findDateInLine(block.dayLine) ?? "";
  let timeIn = "";
  let timeOut = "";
  const notes: string[] = [];

  // Day line may also contain times (e.g. "Day 1: 10:20AM - 7:19PM Aug 3 2026")
  const dayLineTimes = findTimesInLine(block.dayLine);
  if (dayLineTimes.timeIn) timeIn = dayLineTimes.timeIn;
  if (dayLineTimes.timeOut) timeOut = dayLineTimes.timeOut;

  for (const line of block.lines) {
    if (!line) continue;
    if (SECTION_RE.test(line)) continue; // skip "Morning" / "Afternoon" headers

    if (!date) {
      const d = findDateInLine(line);
      if (d && isMetaLine(line)) {
        date = d;
        continue;
      }
      if (d && line.replace(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/, "").replace(/[^\w]/g, "").length <= 4) {
        date = d;
        continue;
      }
    }

    if (!timeIn || !timeOut) {
      const t = findTimesInLine(line);
      let matchedTime = false;
      if (t.timeIn && !timeIn) {
        timeIn = t.timeIn;
        matchedTime = true;
      }
      if (t.timeOut && !timeOut) {
        timeOut = t.timeOut;
        matchedTime = true;
      }
      if (matchedTime || isMetaLine(line)) continue;
    }

    const note = tidyNote(cleanNote(line));
    if (note) notes.push(note);
  }

  const warnings: string[] = [];
  if (!date) warnings.push(`${label}: date could not be detected`);
  if (!timeIn) warnings.push(`${label}: time in could not be detected`);
  if (!timeOut) warnings.push(`${label}: time out could not be detected`);

  return {
    day,
    date,
    timeIn,
    timeOut,
    breakMinutes: defaultBreakMinutes,
    notes,
    warnings,
  };
}

/** Auto-detecting EOD parser. */
export function parseEODSmart(text: string, defaultBreakMinutes = 0): ParseResult {
  const blocks = splitBlocks(text);
  const records: ParsedRecord[] = [];
  const errors: string[] = [];

  blocks.forEach((block, i) => {
    records.push(parseBlock(block, i + 1, defaultBreakMinutes));
  });

  if (records.length === 0) {
    errors.push(
      'No EOD records detected. Each day should start with a line like "Day 40". The date and times can be on the same or following lines.'
    );
  }

  return { records, errors, source: "TXT" };
}
