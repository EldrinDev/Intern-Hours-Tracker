"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { RecordForm } from "@/components/records/record-form";
import { useToast } from "@/components/ui/toast";
import { useRecords } from "@/hooks/use-records";
import { useSettings } from "@/hooks/use-settings";
import { addRecord } from "@/lib/db/repo";
import type { DraftRecord } from "@/types/record";

export default function NewRecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { records } = useRecords();
  const { settings } = useSettings();

  const nextDay = records.reduce((max, r) => Math.max(max, r.day), 0) + 1;

  const handleSubmit = async (draft: DraftRecord) => {
    await addRecord(draft);
    toast("Record added successfully.", "success");
    router.push("/records");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Daily Record" description="Time in and out calculate rendered hours automatically." />
      <RecordForm
        suggestedDay={nextDay}
        defaultBreakMinutes={settings.defaultBreakMinutes}
        onSubmit={handleSubmit}
        submitLabel="Save Record"
      />
    </div>
  );
}
