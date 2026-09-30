"use client";

import { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, FileText, FileType, FileJson, FileDown, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { useToast } from "@/components/ui/toast";
import { useRecords } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { useCompany } from "@/hooks/use-company";
import { exportCSV } from "@/lib/exporters/csv";
import { exportTXT } from "@/lib/exporters/txt";
import { downloadBackup } from "@/lib/exporters/backup";

export default function ExportPage() {
  const { toast } = useToast();
  const { records } = useRecords();
  const { settings } = useSettings();
  const { company } = useCompany();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => void | Promise<void>, label: string) => {
    setBusy(key);
    try {
      await fn();
      toast(`${label} exported.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const doExcel = () =>
    run(
      "xlsx",
      async () => {
        const { exportExcel } = await import("@/lib/exporters/excel");
        await exportExcel(records, company ?? null, settings);
      },
      "Excel workbook"
    );

  const doDocx = () =>
    run(
      "docx",
      async () => {
        const { exportDOCX } = await import("@/lib/exporters/docx");
        await exportDOCX(records, company ?? null, settings);
      },
      "DOCX DTR"
    );

  const doPdf = () =>
    run(
      "pdf",
      async () => {
        const { exportPDF } = await import("@/lib/exporters/pdf");
        await exportPDF(records, company ?? null, settings);
      },
      "PDF DTR"
    );

  const OPTIONS = [
    {
      key: "csv",
      icon: FileText,
      title: "CSV",
      desc: "All records with rendered, cumulative & remaining hours.",
      action: () => run("csv", () => exportCSV(records), "CSV"),
    },
    {
      key: "xlsx",
      icon: FileSpreadsheet,
      title: "Excel (XLSX)",
      desc: "Workbook with DTR, Summary, and EOD Notes sheets.",
      action: doExcel,
    },
    {
      key: "docx",
      icon: FileType,
      title: "DOCX",
      desc: "Formatted Daily Time Record document.",
      action: doDocx,
    },
    {
      key: "pdf",
      icon: FileDown,
      title: "PDF",
      desc: "Direct PDF of the DTR (or use Print for full control).",
      action: doPdf,
    },
    {
      key: "txt",
      icon: FileText,
      title: "EOD Text",
      desc: "Plain-text EOD export that re-imports cleanly.",
      action: () => run("txt", () => exportTXT(records), "EOD text"),
    },
    {
      key: "json",
      icon: FileJson,
      title: "JSON Backup",
      desc: "Full backup of settings, company, and records.",
      action: () => run("json", () => downloadBackup(), "Backup"),
    },
  ];

  return (
    <>
      <PageHeader
        title="Export"
        description="Download your records or generate a DTR."
        actions={
          <Link href="/dtr">
            <Button variant="outline">
              <Printer className="h-4 w-4" /> Print DTR
            </Button>
          </Link>
        }
      />

      {records.length === 0 ? (
        <EmptyState
          title="Nothing to export yet"
          description="Add or import records first, then export them here."
        >
          <Link href="/records/new">
            <Button>Add a record</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPTIONS.map((o, i) => {
            const Icon = o.icon;
            return (
              <Card key={o.key} className="rise group" style={{ animationDelay: `${i * 60}ms` }}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-accent transition-transform duration-200 group-hover:scale-110" />
                  <CardTitle className="mt-2">{o.title}</CardTitle>
                  <CardDescription>{o.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={o.action}
                    disabled={busy === o.key}
                  >
                    {busy === o.key ? "Preparing..." : `Download ${o.title}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
