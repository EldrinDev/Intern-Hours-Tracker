"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PlusCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { saveCompany, saveSettings } from "@/lib/db/repo";
import { setupSchema } from "@/lib/validation";
import { todayIso } from "@/lib/formatters/date";

export function SetupFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  const [requiredHours, setRequiredHours] = useState("486");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const hours = Number.parseFloat(requiredHours);
    const parsed = setupSchema.safeParse({ requiredHours: hours, companyName, startDate });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[String(issue.path[0])] = issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const company = await saveCompany({
        name: companyName,
        position: position || undefined,
        startDate,
        requiredHours: hours,
      });
      await saveSettings({
        requiredMinutes: Math.round(hours * 60),
        companyId: company.id,
        startDate,
        setupComplete: true,
      });
      toast("Setup complete. You're ready to track.", "success");
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  if (step === 2) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-5 pt-6 text-center">
          <h2 className="text-2xl font-bold">You&apos;re ready.</h2>
          <p className="text-muted-foreground">
            Your internship profile is set up. Add your first record or import an existing EOD.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push("/records/new")}>
              <PlusCircle className="h-4 w-4" /> Add Your First Record
            </Button>
            <Button variant="outline" onClick={() => router.push("/import")}>
              <Upload className="h-4 w-4" /> Import Existing EOD
            </Button>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Go to dashboard
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="space-y-5 pt-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome to OJT Hours Tracker</h2>
          <p className="mt-1 text-muted-foreground">Let&apos;s set up your internship.</p>
        </div>

        <div>
          <Label htmlFor="required">Required OJT Hours</Label>
          <Input
            id="required"
            type="number"
            min={1}
            value={requiredHours}
            onChange={(e) => setRequiredHours(e.target.value)}
            className="mt-1.5"
          />
          {errors.requiredHours && (
            <p className="mt-1 text-xs text-destructive">{errors.requiredHours}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Stafify BPO & Digital Agency"
            className="mt-1.5"
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-destructive">{errors.companyName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="position">Position / Role (optional)</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Full-Stack Developer Intern"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="start">OJT Start Date</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <Button className="w-full" onClick={submit} disabled={saving}>
          {saving ? "Saving..." : "Continue"} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
