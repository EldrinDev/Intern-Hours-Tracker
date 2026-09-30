"use client";

import { useRecords } from "./use-records";
import { useSettings } from "./use-settings";
import { summarize, type ProgressSummary } from "@/lib/calculations/progress";
import type { DailyRecord } from "@/types/record";

/** Combined progress summary derived from live records + settings. */
export function useSummary(): { summary: ProgressSummary; records: DailyRecord[]; loading: boolean } {
  const { records, loading: rLoading } = useRecords();
  const { settings, loading: sLoading } = useSettings();
  const summary = summarize(records, settings.requiredMinutes);
  return { summary, records, loading: rLoading || sLoading };
}
