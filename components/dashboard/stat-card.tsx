import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
  delay?: number;
}

export function StatCard({ label, value, hint, icon, accent, delay = 0 }: StatCardProps) {
  return (
    <div
      className="hover-lift rise rounded-lg border border-border bg-card p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "transition-transform duration-200",
              accent ? "text-accent" : "text-muted-foreground"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={cn("mt-2 text-2xl font-bold tabular-nums", accent && "text-accent")}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
