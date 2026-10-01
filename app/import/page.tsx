"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, FileText, AlertTriangle, CheckCircle2, X, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useRecords } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { parseEODText } from "@/lib/parsers/eod-parser";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseExcel } from "@/lib/parsers/excel-parser";
import {
  validateParsed,
  resolveImport,
  type ValidationOutcome,
  type DuplicateStrategy,
} from "@/lib/parsers/validate-import";
import { restoreBackup } from "@/lib/exporters/backup";
import { bulkAddRecords, deleteRecord } from "@/lib/db/repo";
import { formatDate, formatTime } from "@/lib/formatters/date";
import type { ParseResult } from "@/lib/parsers/types";

const SAMPLE = `Day 1: 10:20AM - 7:19PM August 3 2026
- Reviewed Stafify Training Guide about App Drawer and Admin & HR
- Learned and absorbed ideas from their website for our capstone
- Attended Git session mentored by our Senior

Day 2: 8:00AM - 5:00PM August 4 2026
- Implemented API authentication
- Tested endpoints using Postman`;

export default function ImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { records: existing } = useRecords();
  const { settings } = useSettings();

  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [outcome, setOutcome] = useState<ValidationOutcome | null>(null);
  const [strategy, setStrategy] = useState<DuplicateStrategy>("skip");
  const [importing, setImporting] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("");

  const runPreview = (parsed: ParseResult) => {
    setResult(parsed);
    setSourceLabel(parsed.source);
    setOutcome(validateParsed(parsed.records, existing));
  };

  const handleParseText = () => {
    if (!text.trim()) {
      toast("Paste some EOD text first.", "error");
      return;
    }
    runPreview(
      parseEODText(text, {
        defaultBreakMinutes: settings.defaultBreakMinutes,
        pattern: settings.eodPattern,
      })
    );
  };

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".json")) {
        await restoreBackup(file);
        toast("Backup restored successfully.", "success");
        router.push("/dashboard");
        return;
      }
      if (name.endsWith(".csv")) {
        runPreview(await parseCSV(file));
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        runPreview(await parseExcel(file));
      } else {
        runPreview(
          parseEODText(await file.text(), {
            defaultBreakMinutes: settings.defaultBreakMinutes,
            pattern: settings.eodPattern,
          })
        );
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to read file.", "error");
    }
  };

  const reset = () => {
    setResult(null);
    setOutcome(null);
    setText("");
  };

  const confirmImport = async () => {
    if (!outcome) return;
    setImporting(true);
    try {
      const { toAdd, idsToRemove } = resolveImport(outcome.rows, strategy);
      for (const id of idsToRemove) await deleteRecord(id);
      const count = await bulkAddRecords(toAdd);
      toast(`${count} record${count === 1 ? "" : "s"} imported.`, "success");
      router.push("/records");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Import"
        description="Paste EOD text, or upload a TXT, CSV, XLSX, or JSON backup file."
        actions={
          <Link href="/settings#eod-pattern">
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4" /> Configure EOD Pattern
            </Button>
          </Link>
        }
      />

      {!result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paste EOD Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={SAMPLE}
                className="min-h-[220px] font-mono text-xs"
                aria-label="EOD text"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button onClick={handleParseText}>
                    <FileText className="h-4 w-4" /> Preview Import
                  </Button>
                  <Button variant="ghost" onClick={() => setText(SAMPLE)}>
                    Use sample
                  </Button>
                </div>
                <Link href="/settings#eod-pattern">
                  <Button variant="subtle" size="sm">
                    <Settings2 className="h-4 w-4" />
                    {settings.eodPattern?.mode === "template"
                      ? "Custom pattern"
                      : "Auto-detect"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload a File</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:bg-muted/60">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Click to choose a file</div>
                  <div className="text-xs text-muted-foreground">
                    .txt · .csv · .xlsx · .json backup
                  </div>
                </div>
                <input
                  type="file"
                  accept=".txt,.csv,.xlsx,.xls,.json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Import Preview{" "}
              <span className="text-sm font-normal text-muted-foreground">({sourceLabel})</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Cancel preview">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge tone="accent">{result.records.length} detected</Badge>
              {outcome && <Badge tone="success">{outcome.validCount} new &amp; valid</Badge>}
              {outcome && outcome.duplicateCount > 0 && (
                <Badge tone="muted">{outcome.duplicateCount} duplicate</Badge>
              )}
              {outcome && outcome.invalidCount > 0 && (
                <Badge tone="destructive">{outcome.invalidCount} with errors</Badge>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {e}
                  </div>
                ))}
                <div className="mt-3">
                  <Link href="/settings#eod-pattern">
                    <Button variant="outline" size="sm">
                      <Settings2 className="h-4 w-4" /> Configure EOD Pattern
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {outcome && outcome.duplicateCount > 0 && (
              <div className="flex items-center gap-3">
                <Label htmlFor="strategy">On duplicates:</Label>
                <Select
                  id="strategy"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as DuplicateStrategy)}
                  className="w-40"
                >
                  <option value="skip">Skip</option>
                  <option value="replace">Replace</option>
                  <option value="copy">Create copy</option>
                </Select>
              </div>
            )}

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In → Out</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outcome?.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium">{row.day}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {row.date ? formatDate(row.date, "short") : <span className="text-destructive">missing</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                        {row.timeIn ? formatTime(row.timeIn) : "—"} →{" "}
                        {row.timeOut ? formatTime(row.timeOut) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {!row.valid ? (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" /> {row.errors[0]}
                          </span>
                        ) : row.isDuplicate ? (
                          <span className="text-xs text-muted-foreground">Duplicate (will {strategy})</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={confirmImport} disabled={importing || (outcome?.validCount ?? 0) + (strategy !== "skip" ? outcome?.duplicateCount ?? 0 : 0) === 0}>
                {importing ? "Importing..." : "Import Records"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
