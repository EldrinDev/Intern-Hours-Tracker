"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Save, Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useSettings } from "@/hooks/use-settings";
import { useCompany } from "@/hooks/use-company";
import { saveCompany, saveSettings, clearAllData } from "@/lib/db/repo";
import { downloadBackup, restoreBackup } from "@/lib/exporters/backup";
import type { DateFormat, PaperSize, TimeFormat, BreakMode } from "@/types/settings";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { settings, loading } = useSettings();
  const { company } = useCompany();

  // Company
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [supervisor, setSupervisor] = useState("");

  // Student + OJT
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [school, setSchool] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [requiredHours, setRequiredHours] = useState("486");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [defaultBreak, setDefaultBreak] = useState("0");
  const [breakMode, setBreakMode] = useState<BreakMode>("manual");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [dateFormat, setDateFormat] = useState<DateFormat>("long");
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");

  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    setStudentName(settings.studentName ?? "");
    setStudentId(settings.studentId ?? "");
    setSchool(settings.school ?? "");
    setCourse(settings.course ?? "");
    setYearLevel(settings.yearLevel ?? "");
    setRequiredHours(String(Math.round(settings.requiredMinutes / 60)));
    setStartDate(settings.startDate ?? "");
    setExpectedEndDate(settings.expectedEndDate ?? "");
    setDefaultBreak(String(settings.defaultBreakMinutes));
    setBreakMode(settings.breakMode);
    setTimeFormat(settings.timeFormat);
    setDateFormat(settings.dateFormat);
    setPaperSize(settings.paperSize);
  }, [loading, settings]);

  useEffect(() => {
    if (!company) return;
    setName(company.name);
    setAddress(company.address ?? "");
    setDepartment(company.department ?? "");
    setPosition(company.position ?? "");
    setSupervisor(company.supervisor ?? "");
  }, [company]);

  const handleSave = async () => {
    const hours = Number.parseFloat(requiredHours) || 0;
    if (hours <= 0) {
      toast("Required hours must be greater than 0.", "error");
      return;
    }
    setSaving(true);
    try {
      await saveCompany({
        id: company?.id,
        name: name || "My Company",
        address: address || undefined,
        department: department || undefined,
        position: position || undefined,
        supervisor: supervisor || undefined,
        startDate: startDate || undefined,
        expectedEndDate: expectedEndDate || undefined,
        requiredHours: hours,
      });
      await saveSettings({
        studentName: studentName || undefined,
        studentId: studentId || undefined,
        school: school || undefined,
        course: course || undefined,
        yearLevel: yearLevel || undefined,
        requiredMinutes: Math.round(hours * 60),
        startDate: startDate || undefined,
        expectedEndDate: expectedEndDate || undefined,
        defaultBreakMinutes: Number.parseInt(defaultBreak, 10) || 0,
        breakMode,
        timeFormat,
        dateFormat,
        paperSize,
        setupComplete: true,
      });
      toast("Settings saved.", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (file: File) => {
    try {
      await restoreBackup(file);
      toast("Backup restored.", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Restore failed.", "error");
    }
  };

  const handleClear = async () => {
    await clearAllData();
    toast("All data cleared.", "success");
    router.push("/");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading settings...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Configure your internship, student info, and preferences."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Company */}
        <Card id="company">
          <CardHeader>
            <CardTitle>Company</CardTitle>
            <CardDescription>Appears on your exported DTR.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name" value={name} onChange={setName} />
            <Field label="Address" value={address} onChange={setAddress} />
            <Field label="Department" value={department} onChange={setDepartment} />
            <Field label="Position / Role" value={position} onChange={setPosition} />
            <Field label="Supervisor" value={supervisor} onChange={setSupervisor} />
          </CardContent>
        </Card>

        {/* Student */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Optional; shown on DTR exports.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={studentName} onChange={setStudentName} />
            <Field label="Student ID" value={studentId} onChange={setStudentId} />
            <Field label="Course / Program" value={course} onChange={setCourse} />
            <Field label="Year Level" value={yearLevel} onChange={setYearLevel} />
            <Field label="School" value={school} onChange={setSchool} />
          </CardContent>
        </Card>

        {/* OJT config */}
        <Card>
          <CardHeader>
            <CardTitle>OJT & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="req">Required Hours</Label>
              <Input id="req" type="number" min={1} value={requiredHours} onChange={(e) => setRequiredHours(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="brk">Default Break (minutes)</Label>
              <Input id="brk" type="number" min={0} value={defaultBreak} onChange={(e) => setDefaultBreak(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="start">OJT Start Date</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="end">Expected End Date</Label>
              <Input id="end" type="date" value={expectedEndDate} onChange={(e) => setExpectedEndDate(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="bmode">Break Mode</Label>
              <Select id="bmode" value={breakMode} onChange={(e) => setBreakMode(e.target.value as BreakMode)} className="mt-1.5">
                <option value="none">No Break</option>
                <option value="manual">Manual Break</option>
                <option value="auto">Automatic Break</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="tf">Time Format</Label>
              <Select id="tf" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value as TimeFormat)} className="mt-1.5">
                <option value="12h">12-hour (1:30 PM)</option>
                <option value="24h">24-hour (13:30)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="df">Date Format</Label>
              <Select id="df" value={dateFormat} onChange={(e) => setDateFormat(e.target.value as DateFormat)} className="mt-1.5">
                <option value="long">Long (August 3, 2026)</option>
                <option value="short">Short (Aug 3, 2026)</option>
                <option value="iso">ISO (2026-08-03)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="paper">DTR Paper Size</Label>
              <Select id="paper" value={paperSize} onChange={(e) => setPaperSize(e.target.value as PaperSize)} className="mt-1.5">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="long">Long Bond</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select id="theme" value={theme ?? "system"} onChange={(e) => setTheme(e.target.value)} className="mt-1.5">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data management */}
        <Card id="data" className="border-border">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Your records are stored in this browser. Clearing browser data or changing devices
              may remove them — keep a backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => downloadBackup().then(() => toast("Backup created.", "success"))}>
              <Download className="h-4 w-4" /> Export Backup
            </Button>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted">
              <Upload className="h-4 w-4" /> Import Backup
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleRestore(f);
                  e.target.value = "";
                }}
              />
            </label>
            <Button variant="destructive" onClick={() => setClearOpen(true)}>
              <Trash2 className="h-4 w-4" /> Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
        title="Delete all OJT data?"
        description="This cannot be undone. Make sure you have exported a backup first."
        confirmLabel="Delete Everything"
        destructive
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}
