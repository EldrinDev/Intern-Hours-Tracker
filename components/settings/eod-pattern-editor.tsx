"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, RotateCcw, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useSettings } from "@/hooks/use-settings";
import { saveSettings } from "@/lib/db/repo";
import { parseEODText } from "@/lib/parsers/eod-parser";
import {
  AUTO_EOD_PATTERN,
  CLASSIC_EOD_PATTERN,
  DEFAULT_EOD_PATTERN,
  EOD_PRESETS,
  validatePattern,
  type EodPattern,
} from "@/lib/parsers/eod-pattern";
import { formatDate, formatTime } from "@/lib/formatters/date";

const SAMPLE_PLACEHOLDER = `Day 40
September 30, 2026
Time In: 10:04 AM
Time Out: 8:00 PM

Morning
- Converted raw components to shared global components.

Afternoon
- Worked overtime on the same refactor.`;

const TOKENS = [
  { token: "{day}", desc: "day number (e.g. 1)" },
  { token: "{timeIn}", desc: "clock-in time" },
  { token: "{timeOut}", desc: "clock-out time" },
  { token: "{date}", desc: "the date" },
  { token: "{skip}", desc: "any text to ignore" },
];

export function EodPatternEditor() {
  const { toast } = useToast();
  const { settings, loading } = useSettings();

  const [mode, setMode] = useState<EodPattern["mode"]>("auto");
  const [template, setTemplate] = useState(CLASSIC_EOD_PATTERN.template);
  const [collectNotes, setCollectNotes] = useState(true);
  const [sample, setSample] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const p = settings.eodPattern ?? DEFAULT_EOD_PATTERN;
    setMode(p.mode);
    if (p.template) setTemplate(p.template);
    setCollectNotes(p.collectNotes ?? true);
  }, [loading, settings.eodPattern]);

  const pattern: EodPattern = useMemo(() => {
    if (mode === "auto") return AUTO_EOD_PATTERN;
    return { mode: "template", label: "Custom", template, collectNotes };
  }, [mode, template, collectNotes]);

  const validationError = useMemo(() => validatePattern(pattern), [pattern]);

  const preview = useMemo(() => {
    if (validationError || !sample.trim()) return null;
    try {
      return parseEODText(sample, { pattern });
    } catch {
      return null;
    }
  }, [sample, pattern, validationError]);

  const insertToken = (token: string) => setTemplate((t) => `${t}${token}`);

  const handleSave = async () => {
    if (validationError) {
      toast(validationError, "error");
      return;
    }
    setSaving(true);
    try {
      await saveSettings({ eodPattern: pattern });
      toast("EOD pattern saved.", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setMode("auto");
    setCollectNotes(true);
    await saveSettings({ eodPattern: AUTO_EOD_PATTERN });
    toast("Reset to auto-detect.", "success");
  };

  return (
    <Card id="eod-pattern">
      <CardHeader>
        <CardTitle>EOD Import Format</CardTitle>
        <CardDescription>
          By default, imports auto-detect your EOD layout — day, date, time in/out, and notes
          can be on the same or separate lines. Switch to a custom template only if you need
          exact control.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="eod-mode">Detection mode</Label>
          <Select
            id="eod-mode"
            className="mt-1.5"
            value={mode === "auto" ? "auto" : "template"}
            onChange={(e) => setMode(e.target.value as EodPattern["mode"])}
          >
            <option value="auto">Auto-detect (recommended)</option>
            <option value="template">Custom template</option>
          </Select>
        </div>

        {mode === "auto" ? (
          <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/5 p-3 text-sm">
            <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="text-muted-foreground">
              Auto-detect understands common formats, e.g.
              <ul className="mt-2 space-y-1 font-mono text-xs">
                <li>Day 40 / September 30, 2026 / Time In: 10:04 AM / Time Out: 8:00 PM</li>
                <li>Day 39 – September 30, 2026 · Time In: 10:25 AM | Time Out: 7:00 PM</li>
                <li>Day 1: 10:20AM - 7:19PM August 3 2026</li>
              </ul>
              <p className="mt-2">
                Section headers like <span className="font-mono">Morning</span> /{" "}
                <span className="font-mono">Afternoon</span> are ignored; bullet lines become notes.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="eod-preset">Start from a preset</Label>
              <Select
                id="eod-preset"
                className="mt-1.5"
                defaultValue=""
                onChange={(e) => {
                  const preset = EOD_PRESETS.find((p) => p.label === e.target.value);
                  if (preset?.template) {
                    setTemplate(preset.template);
                    setCollectNotes(preset.collectNotes ?? true);
                  }
                }}
              >
                <option value="">Choose a preset…</option>
                {EOD_PRESETS.filter((p) => p.mode === "template").map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="eod-template">Heading pattern</Label>
              <Input
                id="eod-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="mt-1.5 font-mono"
                placeholder="Day {day}: {timeIn} - {timeOut} {date}"
              />
              {validationError ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> {validationError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Whitespace is flexible, matching is case-insensitive.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {TOKENS.map((t) => (
                <button
                  key={t.token}
                  type="button"
                  onClick={() => insertToken(t.token)}
                  title={t.desc}
                  className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {t.token}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collectNotes}
                onChange={(e) => setCollectNotes(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[hsl(var(--accent))]"
              />
              Treat bullet lines after each heading as that day&apos;s notes
            </label>
          </>
        )}

        {/* Live tester (works in both modes) */}
        <div>
          <Label htmlFor="eod-sample">Test it — paste a sample EOD</Label>
          <Textarea
            id="eod-sample"
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            placeholder={SAMPLE_PLACEHOLDER}
            className="mt-1.5 min-h-[130px] font-mono text-xs"
          />
          {sample.trim() && (
            <div className="mt-2 rounded-md border border-border p-3 text-sm">
              {preview && preview.records.length > 0 ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Detected {preview.records.length} record
                    {preview.records.length === 1 ? "" : "s"}
                  </div>
                  <ul className="space-y-1">
                    {preview.records.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge tone="accent">Day {r.day}</Badge>
                        <span>{r.date ? formatDate(r.date, "short") : "no date"}</span>
                        <span className="font-mono text-muted-foreground">
                          {r.timeIn ? formatTime(r.timeIn) : "—"} →{" "}
                          {r.timeOut ? formatTime(r.timeOut) : "—"}
                        </span>
                        {r.notes.length > 0 && (
                          <span className="text-muted-foreground">· {r.notes.length} note(s)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Nothing detected yet. Make sure each day starts with a line like &quot;Day 40&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={saving || !!validationError}>
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Format"}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset to Auto-detect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
