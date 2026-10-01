/**
 * Configurable EOD header pattern.
 *
 * Users describe their daily heading with tokens instead of raw regex:
 *   {day}      -> the day number           (e.g. 1)
 *   {timeIn}   -> clock-in time            (e.g. 10:20AM)
 *   {timeOut}  -> clock-out time           (e.g. 7:19PM)
 *   {date}     -> the date                 (e.g. August 3 2026)
 *   {skip}     -> any text to ignore
 *
 * Everything between tokens is treated as literal text (whitespace is
 * flexible). Advanced users can instead provide a raw regex whose capture
 * groups are mapped by `groupOrder`.
 */

export type EodToken = "day" | "timeIn" | "timeOut" | "date" | "skip";

export interface EodPattern {
  /** How the pattern is defined. "auto" = smart layout-agnostic detection. */
  mode: "auto" | "template" | "regex";
  /** Human label for the saved pattern. */
  label: string;
  /** Token template, used when mode === "template". */
  template: string;
  /** Raw regex source, used when mode === "regex". */
  regex?: string;
  /** For regex mode: which capture group maps to which field (1-based). */
  groupOrder?: { day?: number; timeIn?: number; timeOut?: number; date?: number };
  /** Whether the bullet lines following a header are the day's notes. */
  collectNotes: boolean;
}

/** Auto-detect pattern — layout-agnostic, handles most EOD styles. */
export const AUTO_EOD_PATTERN: EodPattern = {
  mode: "auto",
  label: "Auto-detect (recommended)",
  template: "",
  collectNotes: true,
};

/** The default is auto-detection. */
export const DEFAULT_EOD_PATTERN: EodPattern = AUTO_EOD_PATTERN;

/** The classic single-line template (kept as a selectable preset). */
export const CLASSIC_EOD_PATTERN: EodPattern = {
  mode: "template",
  label: "Single line — Day N: TIME_IN - TIME_OUT DATE",
  template: "Day {day}: {timeIn} - {timeOut} {date}",
  collectNotes: true,
};

/** A few ready-made presets covering common EOD styles. */
export const EOD_PRESETS: EodPattern[] = [
  AUTO_EOD_PATTERN,
  CLASSIC_EOD_PATTERN,
  {
    mode: "template",
    label: "Day N (DATE): TIME_IN - TIME_OUT",
    template: "Day {day} ({date}): {timeIn} - {timeOut}",
    collectNotes: true,
  },
  {
    mode: "template",
    label: "DATE | Day N | TIME_IN to TIME_OUT",
    template: "{date} | Day {day} | {timeIn} to {timeOut}",
    collectNotes: true,
  },
  {
    mode: "template",
    label: "N. DATE TIME_IN-TIME_OUT",
    template: "{day}. {date} {timeIn}-{timeOut}",
    collectNotes: true,
  },
];

/** Sub-patterns captured for each token (kept permissive on purpose). */
const TOKEN_PATTERNS: Record<EodToken, string> = {
  day: "(\\d+)",
  timeIn: "(\\d{1,2}(?::\\d{2})?\\s*(?:[AaPp][Mm])?)",
  timeOut: "(\\d{1,2}(?::\\d{2})?\\s*(?:[AaPp][Mm])?)",
  date:
    "([A-Za-z]+\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
  skip: "(?:.+?)",
};

const TOKEN_RE = /\{(day|timeIn|timeOut|date|skip)\}/g;

function escapeLiteral(s: string): string {
  // Escape regex specials in literal text, and let runs of whitespace match flexibly.
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
}

export interface CompiledPattern {
  regex: RegExp;
  /** 1-based capture-group index for each field (undefined if absent). */
  order: { day?: number; timeIn?: number; timeOut?: number; date?: number };
}

/** Compile a token template into a regex plus the capture-group mapping. */
export function compileTemplate(template: string): CompiledPattern {
  const order: CompiledPattern["order"] = {};
  let group = 0;
  let out = "";
  let lastIndex = 0;

  for (const match of template.matchAll(TOKEN_RE)) {
    const token = match[1] as EodToken;
    const start = match.index ?? 0;
    out += escapeLiteral(template.slice(lastIndex, start));
    out += TOKEN_PATTERNS[token];
    group += 1;
    if (token !== "skip") order[token] = group;
    lastIndex = start + match[0].length;
  }
  out += escapeLiteral(template.slice(lastIndex));

  return { regex: new RegExp(`^\\s*${out}\\s*$`, "i"), order };
}

/** Compile any pattern (template or raw regex) into a usable matcher. */
export function compilePattern(pattern: EodPattern): CompiledPattern {
  if (pattern.mode === "regex" && pattern.regex) {
    return {
      regex: new RegExp(pattern.regex, "i"),
      order: pattern.groupOrder ?? { day: 1, timeIn: 2, timeOut: 3, date: 4 },
    };
  }
  return compileTemplate(pattern.template);
}

/** Validate a pattern; returns an error message or null if OK. */
export function validatePattern(pattern: EodPattern): string | null {
  if (pattern.mode === "auto") return null;
  try {
    const compiled = compilePattern(pattern);
    // require at least a day or date to anchor a record
    if (compiled.order.day === undefined && compiled.order.date === undefined) {
      return "Pattern must include at least {day} or {date}.";
    }
    return null;
  } catch (err) {
    return err instanceof Error ? `Invalid pattern: ${err.message}` : "Invalid pattern.";
  }
}
