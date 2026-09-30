"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { NoteEditor } from "./note-editor";
import { useToast } from "@/components/ui/toast";
import { calculateRenderedMinutes } from "@/lib/calculations/hours";
import { formatDuration } from "@/lib/formatters/duration";
import { recordSchema } from "@/lib/validation";
import type { DailyRecord, DraftRecord } from "@/types/record";
import { todayIso } from "@/lib/formatters/date";

interface RecordFormProps {
  initial?: DailyRecord;
  suggestedDay?: number;
  defaultBreakMinutes?: number;
  onSubmit: (draft: DraftRecord) => Promise<void>;
  submitLabel?: string;
}

export function RecordForm({
  initial,
  suggestedDay,
  defaultBreakMinutes = 0,
  onSubmit,
  submitLabel = "Save Record",
}: RecordFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [day, setDay] = useState<string>(String(initial?.day ?? suggestedDay ?? 1));
  const [date, setDate] = useState<string>(initial?.date ?? todayIso());
  const [timeIn, setTimeIn] = useState<string>(initial?.timeIn ?? "08:00");
  const [timeOut, setTimeOut] = useState<string>(initial?.timeOut ?? "17:00");
  const [breakMinutes, setBreakMinutes] = useState<string>(
    String(initial?.breakMinutes ?? defaultBreakMinutes)
  );
  const [notes, setNotes] = useState<string[]>(initial?.notes ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const rendered = useMemo(
    () => calculateRenderedMinutes(timeIn, timeOut, Number.parseInt(breakMinutes, 10) || 0),
    [timeIn, timeOut, breakMinutes]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft: DraftRecord = {
      id: initial?.id,
      day: Number.parseInt(day, 10),
      date,
      timeIn,
      timeOut,
      breakMinutes: Number.parseInt(breakMinutes, 10) || 0,
      notes: notes.map((n) => n.trim()).filter(Boolean),
    };

    const parsed = recordSchema.safeParse(draft);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit(draft);
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? <p className="mt-1 text-xs text-destructive">{errors[name]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-5 pt-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="day">Day</Label>
            <Input
              id="day"
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="mt-1.5"
            />
            {fieldError("day")}
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
            {fieldError("date")}
          </div>
          <div>
            <Label htmlFor="timeIn">Time In</Label>
            <Input
              id="timeIn"
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              className="mt-1.5"
            />
            {fieldError("timeIn")}
          </div>
          <div>
            <Label htmlFor="timeOut">Time Out</Label>
            <Input
              id="timeOut"
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              className="mt-1.5"
            />
            {fieldError("timeOut")}
          </div>
          <div>
            <Label htmlFor="break">Break (minutes)</Label>
            <Input
              id="break"
              type="number"
              min={0}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="mt-1.5"
            />
            {fieldError("breakMinutes")}
          </div>
          <div className="flex flex-col justify-end">
            <Label>Rendered (auto)</Label>
            <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted px-3 text-sm font-semibold tabular-nums">
              <Clock className="h-4 w-4 text-accent" />
              {formatDuration(rendered)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label className="mb-2 block">Today&apos;s Accomplishments (EOD)</Label>
        <NoteEditor notes={notes} onChange={setNotes} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
