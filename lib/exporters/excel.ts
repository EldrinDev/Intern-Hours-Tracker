import type { DailyRecord } from "@/types/record";
import type { Company } from "@/types/company";
import type { OJTSettings } from "@/types/settings";
import { formatDuration } from "@/lib/formatters/duration";
import { summarize } from "@/lib/calculations/progress";

/**
 * Export a multi-sheet workbook (DTR / Summary / EOD Notes).
 * SheetJS is lazy-loaded.
 */
export async function exportExcel(
  records: DailyRecord[],
  company: Company | null,
  settings: OJTSettings,
  filename = "ojt-tracker.xlsx"
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Sheet 1: DTR
  const dtrRows = records.map((r) => ({
    Day: r.day,
    Date: r.date,
    "Time In": r.timeIn,
    "Time Out": r.timeOut,
    "Break (min)": r.breakMinutes,
    Rendered: formatDuration(r.renderedMinutes),
    Cumulative: formatDuration(r.cumulativeMinutes),
    Remaining: formatDuration(r.remainingMinutes),
  }));
  const dtrSheet = XLSX.utils.json_to_sheet(dtrRows);
  XLSX.utils.book_append_sheet(wb, dtrSheet, "DTR");

  // Sheet 2: Summary
  const s = summarize(records, settings.requiredMinutes);
  const summaryRows = [
    { Field: "Company", Value: company?.name ?? "" },
    { Field: "Position", Value: company?.position ?? "" },
    { Field: "Student", Value: settings.studentName ?? "" },
    { Field: "Required Hours", Value: formatDuration(s.requiredMinutes) },
    { Field: "Rendered Hours", Value: formatDuration(s.renderedMinutes) },
    { Field: "Remaining Hours", Value: formatDuration(s.remainingMinutes) },
    { Field: "Completion %", Value: `${s.completionPercent.toFixed(1)}%` },
    { Field: "Days Completed", Value: s.daysCompleted },
    { Field: "Start Date", Value: settings.startDate ?? company?.startDate ?? "" },
    { Field: "End Date", Value: settings.expectedEndDate ?? company?.expectedEndDate ?? "" },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Sheet 3: EOD Notes
  const noteRows = records.flatMap((r) =>
    r.notes.length
      ? r.notes.map((n) => ({ Day: r.day, Date: r.date, Note: n }))
      : [{ Day: r.day, Date: r.date, Note: "" }]
  );
  const notesSheet = XLSX.utils.json_to_sheet(noteRows);
  XLSX.utils.book_append_sheet(wb, notesSheet, "EOD Notes");

  XLSX.writeFile(wb, filename);
}
