import type { DailyRecord } from "@/types/record";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration } from "@/lib/formatters/duration";
import { downloadBlob } from "./download";

/** Render records back into EOD-style text (round-trips with the parser). */
export function recordsToEODText(records: DailyRecord[]): string {
  return records
    .map((r) => {
      const header = `Day ${r.day}: ${formatTime(r.timeIn)} - ${formatTime(r.timeOut)} ${formatDate(
        r.date,
        "long"
      )}`;
      const rendered = `(${formatDuration(r.renderedMinutes)} rendered)`;
      const notes = r.notes.map((n) => `- ${n}`).join("\n");
      return `${header} ${rendered}\n${notes}`.trim();
    })
    .join("\n\n");
}

export function exportTXT(records: DailyRecord[], filename = "ojt-eod.txt"): void {
  downloadBlob(recordsToEODText(records), filename, "text/plain;charset=utf-8");
}
