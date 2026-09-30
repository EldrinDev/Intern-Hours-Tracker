import type { DailyRecord } from "@/types/record";
import type { Company } from "@/types/company";
import type { OJTSettings } from "@/types/settings";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration, formatDurationLong } from "@/lib/formatters/duration";
import { summarize } from "@/lib/calculations/progress";
import { downloadBlob } from "./download";

/**
 * Generate a formatted DTR .docx document. The `docx` library is lazy-loaded.
 */
export async function exportDOCX(
  records: DailyRecord[],
  company: Company | null,
  settings: OJTSettings,
  filename = "ojt-dtr.docx"
): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = await import("docx");

  const s = summarize(records, settings.requiredMinutes);

  const infoLine = (label: string, value?: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value ?? "—" }),
      ],
    });

  const headerCells = ["Day", "Date", "Time In", "Time Out", "Rendered"].map(
    (t) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
      })
  );

  const bodyRows = records.map(
    (r) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(r.day))] }),
          new TableCell({ children: [new Paragraph(formatDate(r.date, "short"))] }),
          new TableCell({ children: [new Paragraph(formatTime(r.timeIn))] }),
          new TableCell({ children: [new Paragraph(formatTime(r.timeOut))] }),
          new TableCell({ children: [new Paragraph(formatDuration(r.renderedMinutes))] }),
        ],
      })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    },
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "DAILY TIME RECORD",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          infoLine("Company", company?.name),
          infoLine("Intern", settings.studentName),
          infoLine("Position", company?.position),
          infoLine(
            "OJT Period",
            `${formatDate(settings.startDate ?? company?.startDate ?? "", "long") || "—"} – ${
              formatDate(settings.expectedEndDate ?? company?.expectedEndDate ?? "", "long") || "__________"
            }`
          ),
          infoLine("Required Hours", formatDurationLong(s.requiredMinutes)),
          new Paragraph({ text: "" }),
          table,
          new Paragraph({ text: "" }),
          infoLine("Total Hours Rendered", formatDurationLong(s.renderedMinutes)),
          infoLine("Remaining", formatDurationLong(s.remainingMinutes)),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph("Student Signature: ______________________"),
          new Paragraph({ text: "" }),
          new Paragraph("Supervisor Signature: ___________________"),
          new Paragraph({ text: "" }),
          new Paragraph("Date: _________________________________"),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}
