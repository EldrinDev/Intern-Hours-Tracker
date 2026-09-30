import type { DailyRecord } from "@/types/record";

export type OJTStatus = "not-started" | "in-progress" | "almost-complete" | "completed";

export interface ProgressSummary {
  requiredMinutes: number;
  renderedMinutes: number;
  remainingMinutes: number;
  completionPercent: number; // 0..100
  daysCompleted: number;
  status: OJTStatus;
}

/** Completion percentage capped at 100. */
export function calculateCompletionPercentage(
  renderedMinutes: number,
  requiredMinutes: number
): number {
  if (requiredMinutes <= 0) return 0;
  const pct = (renderedMinutes / requiredMinutes) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function deriveStatus(percent: number, hasRecords: boolean): OJTStatus {
  if (!hasRecords || percent <= 0) return "not-started";
  if (percent >= 100) return "completed";
  if (percent >= 90) return "almost-complete";
  return "in-progress";
}

export function statusLabel(status: OJTStatus): string {
  switch (status) {
    case "not-started":
      return "Not Started";
    case "in-progress":
      return "In Progress";
    case "almost-complete":
      return "Almost Complete";
    case "completed":
      return "Completed";
  }
}

/** Summarize progress from a set of records + required minutes. */
export function summarize(records: DailyRecord[], requiredMinutes: number): ProgressSummary {
  const renderedMinutes = records.reduce((sum, r) => sum + r.renderedMinutes, 0);
  const remainingMinutes = Math.max(0, requiredMinutes - renderedMinutes);
  const completionPercent = calculateCompletionPercentage(renderedMinutes, requiredMinutes);
  const daysCompleted = records.length;
  const status = deriveStatus(completionPercent, daysCompleted > 0);
  return {
    requiredMinutes,
    renderedMinutes,
    remainingMinutes,
    completionPercent,
    daysCompleted,
    status,
  };
}
