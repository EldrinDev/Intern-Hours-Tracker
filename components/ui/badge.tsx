import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "success" | "muted" | "destructive";

const tones: Record<Tone, string> = {
  default: "bg-primary text-primary-foreground",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

export function Badge({
  tone = "muted",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
