import { mapRows, type RawRow } from "./row-mapper";
import type { ParseResult } from "./types";

/**
 * Parse a CSV file into draft records using PapaParse (lazy-loaded).
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  const Papa = (await import("papaparse")).default;
  const text = await file.text();
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const errors = result.errors.map((e) => `CSV row ${e.row ?? "?"}: ${e.message}`);
  const { records, errors: mapErrors } = mapRows(result.data as RawRow[], "CSV");
  return { records, errors: [...errors, ...mapErrors], source: "CSV" };
}
