import { format, parse, isValid } from "date-fns";
import type { DateFormat, TimeFormat } from "@/types/settings";

/** Parse an ISO date (yyyy-MM-dd) to a Date at local midnight. */
export function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : null;
}

/** Format an ISO date string per the user's date format preference. */
export function formatDate(iso: string, fmt: DateFormat = "long"): string {
  const d = isoToDate(iso);
  if (!d) return iso ?? "";
  switch (fmt) {
    case "iso":
      return format(d, "yyyy-MM-dd");
    case "short":
      return format(d, "MMM d, yyyy");
    case "long":
    default:
      return format(d, "MMMM d, yyyy");
  }
}

/** Short date like "Aug 3" for compact tables. */
export function formatDateCompact(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return iso ?? "";
  return format(d, "MMM d");
}

/** Format a 24h "HH:mm" time per the user's time preference. */
export function formatTime(time24: string, fmt: TimeFormat = "12h"): string {
  if (!time24) return "";
  const d = parse(time24, "HH:mm", new Date());
  if (!isValid(d)) return time24;
  return fmt === "24h" ? format(d, "HH:mm") : format(d, "h:mm a");
}

/** Today as ISO yyyy-MM-dd (local). */
export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Full ISO datetime now. */
export function nowIso(): string {
  return new Date().toISOString();
}
