import { mapRows, type RawRow } from "./row-mapper";
import type { ParseResult } from "./types";

/**
 * Parse an .xlsx/.xls file into draft records.
 * SheetJS is lazy-loaded to keep it out of the main bundle.
 */
export async function parseExcel(file: File): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { records: [], errors: ["Workbook has no sheets"], source: "XLSX" };
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: false });
  const { records, errors } = mapRows(rows, "XLSX");
  return { records, errors, source: "XLSX" };
}
