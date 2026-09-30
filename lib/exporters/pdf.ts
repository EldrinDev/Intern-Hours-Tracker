import type { DailyRecord } from "@/types/record";
import type { Company } from "@/types/company";
import type { OJTSettings } from "@/types/settings";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration, formatDurationLong } from "@/lib/formatters/duration";
import { summarize } from "@/lib/calculations/progress";

/**
 * Generate a DTR PDF using jsPDF + autotable (both lazy-loaded).
 * Note: the primary print path is browser print (see /dtr). This is the
 * direct-download alternative.
 */
export async function exportPDF(
  records: DailyRecord[],
  company: Company | null,
  settings: OJTSettings,
  filename = "ojt-dtr.pdf"
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "pt", format: settings.paperSize === "letter" ? "letter" : "a4" });
  const s = summarize(records, settings.requiredMinutes);
  const marginX = 40;
  let y = 48;

  doc.setFontSize(16);
  doc.text("DAILY TIME RECORD", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 24;

  doc.setFontSize(10);
  const info: Array<[string, string]> = [
    ["Company", company?.name ?? "—"],
    ["Intern", settings.studentName ?? "—"],
    ["Position", company?.position ?? "—"],
    [
      "OJT Period",
      `${formatDate(settings.startDate ?? company?.startDate ?? "", "long") || "—"} – ${
        formatDate(settings.expectedEndDate ?? company?.expectedEndDate ?? "", "long") || "__________"
      }`,
    ],
    ["Required Hours", formatDurationLong(s.requiredMinutes)],
  ];
  for (const [label, value] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, marginX + 90, y);
    y += 16;
  }
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Day", "Date", "Time In", "Time Out", "Rendered"]],
    body: records.map((r) => [
      String(r.day),
      formatDate(r.date, "short"),
      formatTime(r.timeIn),
      formatTime(r.timeOut),
      formatDuration(r.renderedMinutes),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59] },
    margin: { left: marginX, right: marginX },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  let fy = finalY + 24;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Hours Rendered: ${formatDurationLong(s.renderedMinutes)}`, marginX, fy);
  fy += 16;
  doc.text(`Remaining: ${formatDurationLong(s.remainingMinutes)}`, marginX, fy);
  fy += 40;
  doc.setFont("helvetica", "normal");
  doc.text("Student Signature: ______________________", marginX, fy);
  fy += 24;
  doc.text("Supervisor Signature: ___________________", marginX, fy);
  fy += 24;
  doc.text("Date: _________________________________", marginX, fy);

  doc.save(filename);
}
