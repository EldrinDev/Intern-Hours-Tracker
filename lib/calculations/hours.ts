import type { DailyRecord, DraftRecord } from "@/types/record";

/**
 * Parse a flexible time string into 24h "HH:mm".
 * Accepts: "10:20AM", "10:20 AM", "10:20am", "7:19 PM", "19:19", "8", "8 AM".
 * Returns null if unparseable.
 */
export function parseTime(input: string): string | null {
  if (!input) return null;
  const raw = input.trim().toLowerCase();

  const m = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3];

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (minute > 59) return null;

  if (meridiem === "am") {
    if (hour === 12) hour = 0;
  } else if (meridiem === "pm") {
    if (hour !== 12) hour += 12;
  }

  if (hour > 23) return null;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Convert 24h "HH:mm" to minutes since midnight. */
export function timeToMinutes(time24: string): number | null {
  const parsed = parseTime(time24);
  if (!parsed) return null;
  const [h, m] = parsed.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Calculate rendered minutes for a shift.
 * Supports overnight shifts (timeOut earlier than timeIn -> next day).
 * Subtracts break minutes. Never returns negative.
 */
export function calculateRenderedMinutes(
  timeIn: string,
  timeOut: string,
  breakMinutes: number
): number {
  const inM = timeToMinutes(timeIn);
  const outM = timeToMinutes(timeOut);
  if (inM === null || outM === null) return 0;

  let duration = outM - inM;
  if (duration < 0) {
    // overnight shift
    duration += 24 * 60;
  }
  duration -= Math.max(0, breakMinutes || 0);
  return Math.max(0, duration);
}

/**
 * Recalculate cumulative and remaining minutes across a set of records.
 * Records are sorted by (day, date) ascending. Returns new sorted array.
 */
export function recalcSeries<T extends DailyRecord>(
  records: T[],
  requiredMinutes: number
): T[] {
  const sorted = [...records].sort(sortByDayDate);
  let running = 0;
  return sorted.map((r) => {
    const rendered = calculateRenderedMinutes(r.timeIn, r.timeOut, r.breakMinutes);
    running += rendered;
    const remaining = Math.max(0, requiredMinutes - running);
    return { ...r, renderedMinutes: rendered, cumulativeMinutes: running, remainingMinutes: remaining };
  });
}

/** Comparison for chronological ordering. */
export function sortByDayDate(a: { day: number; date: string }, b: { day: number; date: string }): number {
  if (a.date && b.date && a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.day - b.day;
}

/** Build a full DailyRecord series from drafts. */
export function buildSeries(
  drafts: DraftRecord[],
  requiredMinutes: number,
  now: string
): DailyRecord[] {
  const sorted = [...drafts].sort(sortByDayDate);
  let running = 0;
  return sorted.map((d) => {
    const rendered = calculateRenderedMinutes(d.timeIn, d.timeOut, d.breakMinutes);
    running += rendered;
    const remaining = Math.max(0, requiredMinutes - running);
    return {
      id: d.id ?? "",
      day: d.day,
      date: d.date,
      timeIn: d.timeIn,
      timeOut: d.timeOut,
      breakMinutes: d.breakMinutes,
      renderedMinutes: rendered,
      cumulativeMinutes: running,
      remainingMinutes: remaining,
      notes: d.notes,
      createdAt: now,
      updatedAt: now,
    };
  });
}
