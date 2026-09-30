"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { useToast } from "@/components/ui/toast";
import { useRecords } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { useCompany } from "@/hooks/use-company";
import { summarize } from "@/lib/calculations/progress";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration, formatDurationLong } from "@/lib/formatters/duration";

export default function DTRPage() {
  const { toast } = useToast();
  const { records } = useRecords();
  const { settings } = useSettings();
  const { company } = useCompany();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    });
  }, [records, from, to]);

  const summary = summarize(filtered, settings.requiredMinutes);
  const start = settings.startDate ?? company?.startDate;
  const end = settings.expectedEndDate ?? company?.expectedEndDate;

  const doPdf = async () => {
    setBusy(true);
    try {
      const { exportPDF } = await import("@/lib/exporters/pdf");
      await exportPDF(filtered, company ?? null, settings);
      toast("PDF DTR exported.", "success");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Print with a clean document title. The browser uses document.title for the
   * header text (when "Headers and footers" is on), so we swap it to a short
   * DTR label during printing, then restore it.
   */
  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = company?.name ? `DTR - ${company.name}` : "Daily Time Record";
    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  if (records.length === 0) {
    return (
      <EmptyState title="No records for a DTR" description="Add or import records first.">
        <Link href="/records/new">
          <Button>Add a record</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <>
      {/* Controls (hidden on print) */}
      <div className="no-print mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Time Record</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a date range, then print or export to PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
            <Button variant="outline" onClick={doPdf} disabled={busy}>
              <FileDown className="h-4 w-4" /> {busy ? "Preparing..." : "Export PDF"}
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 pt-5">
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5" />
            </div>
            {(from || to) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
              >
                Clear range
              </Button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              {filtered.length} record{filtered.length === 1 ? "" : "s"} in range
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable area */}
      <div className="print-area mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 print:border-0 print:p-0">
        <h2 className="text-center text-xl font-bold tracking-wide">DAILY TIME RECORD</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <InfoRow label="Company" value={company?.name} />
          <InfoRow label="Intern" value={settings.studentName} />
          <InfoRow label="Position" value={company?.position} />
          <InfoRow label="Student ID" value={settings.studentId} />
          <InfoRow
            label="OJT Period"
            value={`${start ? formatDate(start, "long") : "—"} – ${end ? formatDate(end, "long") : "__________"}`}
          />
          <InfoRow label="Required Hours" value={formatDurationLong(summary.requiredMinutes)} />
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-border text-left">
              <th className="py-2 pr-3 font-semibold">Day</th>
              <th className="py-2 pr-3 font-semibold">Date</th>
              <th className="py-2 pr-3 font-semibold">Time In</th>
              <th className="py-2 pr-3 font-semibold">Time Out</th>
              <th className="py-2 font-semibold">Hours</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border">
                <td className="py-1.5 pr-3">{r.day}</td>
                <td className="py-1.5 pr-3">{formatDate(r.date, "short")}</td>
                <td className="py-1.5 pr-3 font-mono">{formatTime(r.timeIn, settings.timeFormat)}</td>
                <td className="py-1.5 pr-3 font-mono">{formatTime(r.timeOut, settings.timeFormat)}</td>
                <td className="py-1.5 tabular-nums">{formatDuration(r.renderedMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between border-t border-border pt-3">
            <span className="font-semibold">Total Hours Rendered</span>
            <span className="tabular-nums">{formatDurationLong(summary.renderedMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Remaining</span>
            <span className="tabular-nums">{formatDurationLong(summary.remainingMinutes)}</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
          <SignatureLine label="Student Signature" />
          <SignatureLine label="Supervisor Signature" />
        </div>
        <div className="mt-8 text-sm">
          <SignatureLine label="Date" />
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="font-semibold">{label}:</span>
      <span>{value || "—"}</span>
    </div>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <div className="h-8 border-b border-foreground" />
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
