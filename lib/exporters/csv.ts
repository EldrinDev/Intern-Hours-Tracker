import type { DailyRecord } from "@/types/record";
import { formatDuration } from "@/lib/formatters/duration";
import { downloadBlob } from "./download";

const HEADERS = [
  "Day",
  "Date",
  "Time In",
  "Time Out",
  "Break (min)",
  "Rendered",
  "Cumulative",
  "Remaining",
  "Notes",
];

function esc(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build CSV text from records. */
export function recordsToCSV(records: DailyRecord[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of records) {
    lines.push(
      [
        r.day,
        r.date,
        r.timeIn,
        r.timeOut,
        r.breakMinutes,
        formatDuration(r.renderedMinutes),
        formatDuration(r.cumulativeMinutes),
        formatDuration(r.remainingMinutes),
        r.notes.join(" | "),
      ]
        .map((v) => esc(String(v)))
        .join(",")
    );
  }
  return lines.join("\n");
}

export function exportCSV(records: DailyRecord[], filename = "ojt-records.csv"): void {
  downloadBlob(recordsToCSV(records), filename, "text/csv;charset=utf-8");
}
