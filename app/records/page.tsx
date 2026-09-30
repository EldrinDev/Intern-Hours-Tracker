"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, ArrowUpDown, Table2, GanttChartSquare, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { RecordActions } from "@/components/records/record-actions";
import { Timeline } from "@/components/records/timeline";
import { useRecords } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration } from "@/lib/formatters/duration";
import { sortByDayDate } from "@/lib/calculations/hours";

type View = "table" | "timeline";
type SortDir = "asc" | "desc";

export default function RecordsPage() {
  const { records, loading } = useRecords();
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [dir, setDir] = useState<SortDir>("asc");
  const [view, setView] = useState<View>("table");

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) if (r.date) set.add(r.date.slice(0, 7));
    return Array.from(set).sort();
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = records.filter((r) => {
      if (month !== "all" && !r.date.startsWith(month)) return false;
      if (!q) return true;
      return (
        String(r.day).includes(q) ||
        r.date.includes(q) ||
        formatDate(r.date, "long").toLowerCase().includes(q) ||
        r.notes.some((n) => n.toLowerCase().includes(q))
      );
    });
    list = [...list].sort(sortByDayDate);
    if (dir === "desc") list.reverse();
    return list;
  }, [records, query, month, dir]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading records...</div>;

  return (
    <>
      <PageHeader
        title="Records"
        description={`${records.length} record${records.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/records/new">
            <Button>
              <PlusCircle className="h-4 w-4" /> Add Record
            </Button>
          </Link>
        }
      />

      {records.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-10 w-10" />}
          title="No records yet"
          description="Add your first daily record or import an EOD file."
        >
          <Link href="/records/new">
            <Button>
              <PlusCircle className="h-4 w-4" /> Add First Record
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search day, date, or notes..."
                className="pl-9"
                aria-label="Search records"
              />
            </div>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="sm:w-44" aria-label="Filter by month">
              <option value="all">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatDate(`${m}-01`, "long").replace(/\d+,\s/, "")}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
              aria-label="Toggle sort direction"
            >
              <ArrowUpDown className="h-4 w-4" />
              {dir === "asc" ? "Oldest" : "Newest"}
            </Button>
            <div className="flex rounded-md border border-border">
              <Button
                variant={view === "table" ? "subtle" : "ghost"}
                size="icon"
                className="rounded-r-none"
                aria-label="Table view"
                onClick={() => setView("table")}
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "timeline" ? "subtle" : "ghost"}
                size="icon"
                className="rounded-l-none"
                aria-label="Timeline view"
                onClick={() => setView("timeline")}
              >
                <GanttChartSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No matching records" description="Try a different search or filter." />
          ) : view === "timeline" ? (
            <Card className="p-6">
              <Timeline records={filtered} />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Day</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Time In</th>
                      <th className="px-4 py-3 font-medium">Time Out</th>
                      <th className="px-4 py-3 font-medium">Rendered</th>
                      <th className="px-4 py-3 font-medium">Cumulative</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border transition-colors last:border-0 hover:bg-accent/5"
                      >
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/records/${r.id}`} className="hover:text-accent">
                            {r.day}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{formatDate(r.date, settings.dateFormat)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono">{formatTime(r.timeIn, settings.timeFormat)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono">{formatTime(r.timeOut, settings.timeFormat)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">{formatDuration(r.renderedMinutes)}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">{formatDuration(r.cumulativeMinutes)}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{r.notes[0] ?? "—"}</td>
                        <td className="px-4 py-3">
                          <RecordActions id={r.id} day={r.day} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
