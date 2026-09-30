"use client";

import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration } from "@/lib/formatters/duration";
import type { DailyRecord } from "@/types/record";

export function Timeline({ records }: { records: DailyRecord[] }) {
  const { settings } = useSettings();

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {records.map((r) => (
        <li key={r.id} className="relative">
          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href={`/records/${r.id}`} className="text-base font-semibold hover:text-accent">
              Day {r.day}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDate(r.date, settings.dateFormat)}
            </span>
          </div>
          <div className="mt-0.5 font-mono text-sm text-muted-foreground">
            {formatTime(r.timeIn, settings.timeFormat)} → {formatTime(r.timeOut, settings.timeFormat)} ·{" "}
            <span className="font-semibold text-foreground">{formatDuration(r.renderedMinutes)}</span>
          </div>
          {r.notes.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {r.notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
