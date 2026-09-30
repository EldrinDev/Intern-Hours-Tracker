"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Copy, Trash2, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RecordForm } from "@/components/records/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty";
import { useToast } from "@/components/ui/toast";
import { useRecord } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { updateRecord, deleteRecord, duplicateRecord } from "@/lib/db/repo";
import { formatDate, formatTime } from "@/lib/formatters/date";
import { formatDuration } from "@/lib/formatters/duration";
import type { DraftRecord } from "@/types/record";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { record, loading } = useRecord(params.id);
  const { settings } = useSettings();

  const [editing, setEditing] = useState(search.get("edit") === "1");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>;

  if (!record) {
    return (
      <EmptyState
        title="Record not found"
        description="This record may have been deleted."
      >
        <Link href="/records">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Back to Records
          </Button>
        </Link>
      </EmptyState>
    );
  }

  const handleUpdate = async (draft: DraftRecord) => {
    await updateRecord(record.id, draft);
    toast("Record updated.", "success");
    setEditing(false);
  };

  const handleDuplicate = async () => {
    await duplicateRecord(record.id);
    toast("Record duplicated.", "success");
    router.push("/records");
  };

  const handleDelete = async () => {
    await deleteRecord(record.id);
    toast("Record deleted.", "success");
    router.push("/records");
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={`Edit Day ${record.day}`} description="Update time or notes; hours recalculate automatically." />
        <RecordForm initial={record} onSubmit={handleUpdate} submitLabel="Save Changes" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`Day ${record.day}`}
        description={formatDate(record.date, settings.dateFormat)}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4" /> Duplicate
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs uppercase text-muted-foreground">Time In → Out</div>
            <div className="mt-1 font-mono text-sm">
              {formatTime(record.timeIn, settings.timeFormat)} → {formatTime(record.timeOut, settings.timeFormat)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs uppercase text-muted-foreground">Rendered</div>
            <div className="mt-1 flex items-center gap-1.5 text-lg font-bold tabular-nums text-accent">
              <Clock className="h-4 w-4" /> {formatDuration(record.renderedMinutes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs uppercase text-muted-foreground">Cumulative / Remaining</div>
            <div className="mt-1 text-sm tabular-nums">
              {formatDuration(record.cumulativeMinutes)}{" "}
              <span className="text-muted-foreground">/ {formatDuration(record.remainingMinutes)} left</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-5">
          <div className="mb-2 text-sm font-semibold">Accomplishments</div>
          {record.notes.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {record.notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No notes recorded for this day.</p>
          )}
          {record.breakMinutes > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Break deducted: {formatDuration(record.breakMinutes)}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href="/records">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to Records
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete Day ${record.day}?`}
        description="This will permanently remove the record from this browser."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
