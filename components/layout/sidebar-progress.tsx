"use client";

import { useSummary } from "@/hooks/use-summary";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/formatters/duration";

/** Compact live progress widget shown at the bottom of the sidebar. */
export function SidebarProgress() {
  const { summary, records, loading } = useSummary();

  if (loading || records.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">Progress</span>
        <span className="text-xs font-semibold tabular-nums">
          {summary.completionPercent.toFixed(0)}%
        </span>
      </div>
      <Progress value={summary.completionPercent} className="h-1.5" />
      <div className="mt-2 text-[11px] leading-tight text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {formatDuration(summary.renderedMinutes)}
        </span>{" "}
        rendered ·{" "}
        <span className="tabular-nums">{formatDuration(summary.remainingMinutes)}</span> left
      </div>
    </div>
  );
}
