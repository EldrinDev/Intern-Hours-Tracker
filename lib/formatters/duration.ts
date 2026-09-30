/** Format a minutes value as "8h 30m" (or "0m"). */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0 && m === 0) return "0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format minutes as long form "8 Hours 30 Minutes" for DTR. */
export function formatDurationLong(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  const hh = `${h} ${h === 1 ? "Hour" : "Hours"}`;
  const mm = `${m} ${m === 1 ? "Minute" : "Minutes"}`;
  return `${hh} ${mm}`;
}

/** Format minutes as "8:59" clock-style for compact tables. */
export function formatDurationClock(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}
