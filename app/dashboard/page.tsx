"use client";

import Link from "next/link";
import {
  Target,
  Clock,
  Hourglass,
  CalendarDays,
  PlusCircle,
  Upload,
  FileText,
  Download,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { useSummary } from "@/hooks/use-summary";
import { useSettings } from "@/hooks/use-settings";
import { useCompany } from "@/hooks/use-company";
import { formatDuration } from "@/lib/formatters/duration";
import { formatDate, formatTime, todayIso } from "@/lib/formatters/date";

const QUICK_ACTIONS = [
  { href: "/records/new", label: "Add Today's Record", icon: PlusCircle },
  { href: "/import", label: "Import EOD / Excel", icon: Upload },
  { href: "/dtr", label: "Print DTR", icon: FileText },
  { href: "/export", label: "Export", icon: Download },
];

export default function DashboardPage() {
  const { summary, records, loading } = useSummary();
  const { settings } = useSettings();
  const { company } = useCompany();

  const today = todayIso();
  const todayRecord = records.find((r) => r.date === today);
  const recent = [...records].reverse().slice(0, 6);
  const startDate = settings.startDate ?? company?.startDate;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  if (records.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description={company?.name ?? "OJT Hours Tracker"} />
        <EmptyState
          icon={<Clock className="h-10 w-10" />}
          title="No OJT records yet"
          description="Start tracking your internship hours. Add your first record or import an existing EOD."
        >
          <Link href="/records/new">
            <Button>
              <PlusCircle className="h-4 w-4" /> Add First Record
            </Button>
          </Link>
          <Link href="/import">
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Import EOD
            </Button>
          </Link>
        </EmptyState>
      </>
    );
  }

  const isComplete = summary.status === "completed";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={company?.name ?? "OJT Hours Tracker"}
        actions={<StatusBadge status={summary.status} />}
      />

      {isComplete && (
        <Card className="mb-6 border-success/40 bg-success/5">
          <CardContent className="flex items-center gap-3 pt-5">
            <Trophy className="h-8 w-8 text-success" />
            <div>
              <div className="font-semibold">OJT Hours Completed</div>
              <div className="text-sm text-muted-foreground">
                You have rendered {formatDuration(summary.renderedMinutes)} of your required{" "}
                {formatDuration(summary.requiredMinutes)}.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Required"
          value={formatDuration(summary.requiredMinutes)}
          icon={<Target className="h-4 w-4" />}
          delay={0}
        />
        <StatCard
          label="Rendered"
          value={formatDuration(summary.renderedMinutes)}
          icon={<Clock className="h-4 w-4" />}
          accent
          delay={60}
        />
        <StatCard
          label="Remaining"
          value={formatDuration(summary.remainingMinutes)}
          icon={<Hourglass className="h-4 w-4" />}
          delay={120}
        />
        <StatCard
          label="Days Completed"
          value={String(summary.daysCompleted)}
          hint={startDate ? `Started ${formatDate(startDate, "short")}` : undefined}
          icon={<CalendarDays className="h-4 w-4" />}
          delay={180}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="pt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-semibold tabular-nums">
              {summary.completionPercent.toFixed(1)}% complete
            </span>
          </div>
          <Progress value={summary.completionPercent} />
          <div className="mt-2 text-xs text-muted-foreground">
            {formatDuration(summary.renderedMinutes)} rendered ·{" "}
            {formatDuration(summary.remainingMinutes)} remaining
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today */}
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Record added for today
                </div>
                <div className="font-mono text-sm">
                  {formatTime(todayRecord.timeIn, settings.timeFormat)} →{" "}
                  {formatTime(todayRecord.timeOut, settings.timeFormat)}
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {formatDuration(todayRecord.renderedMinutes)} rendered
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Today&apos;s record hasn&apos;t been added yet.
                </p>
                <Link href="/records/new">
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4" /> Add Today&apos;s Record
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent records */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Records</CardTitle>
            <Link href="/records" className="text-sm text-accent underline-offset-4 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/records/${r.id}`}
                      className="font-medium transition-colors hover:text-accent"
                    >
                      Day {r.day}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(r.date, settings.dateFormat)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatDuration(r.renderedMinutes)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatDuration(r.cumulativeMinutes)} total
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href} className="rise" style={{ animationDelay: `${i * 50}ms` }}>
              <Button variant="outline" className="w-full justify-start hover:border-accent/50 hover:text-accent">
                <Icon className="h-4 w-4" /> {a.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </>
  );
}
