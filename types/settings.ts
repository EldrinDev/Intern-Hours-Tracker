import type { EodPattern } from "@/lib/parsers/eod-pattern";

export type TimeFormat = "12h" | "24h";
export type DateFormat = "long" | "short" | "iso";
export type BreakMode = "none" | "manual" | "auto";
export type PaperSize = "a4" | "letter" | "long";

export interface OJTSettings {
  id: string; // fixed "settings"
  requiredMinutes: number;

  studentName?: string;
  studentId?: string;
  school?: string;
  course?: string;
  yearLevel?: string;

  companyId?: string;

  startDate?: string;
  expectedEndDate?: string;

  defaultBreakMinutes: number;
  breakMode: BreakMode;

  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  paperSize: PaperSize;

  /** Configurable EOD import header pattern (undefined = built-in default). */
  eodPattern?: EodPattern;

  setupComplete: boolean;
  hasBackedUp: boolean;
}

export const SETTINGS_ID = "settings";

export const defaultSettings: OJTSettings = {
  id: SETTINGS_ID,
  requiredMinutes: 486 * 60,
  defaultBreakMinutes: 60,
  breakMode: "manual",
  timeFormat: "12h",
  dateFormat: "long",
  paperSize: "a4",
  setupComplete: false,
  hasBackedUp: false,
};
