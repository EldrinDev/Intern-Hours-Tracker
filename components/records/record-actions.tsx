"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { deleteRecord, duplicateRecord } from "@/lib/db/repo";

export function RecordActions({ id, day }: { id: string; day: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDuplicate = async () => {
    await duplicateRecord(id);
    toast("Record duplicated.", "success");
  };

  const handleDelete = async () => {
    await deleteRecord(id);
    toast("Record deleted.", "success");
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="View"
        onClick={() => router.push(`/records/${id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="Edit"
        onClick={() => router.push(`/records/${id}?edit=1`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        aria-label="Duplicate"
        onClick={handleDuplicate}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-destructive"
        aria-label="Delete"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete Day ${day}?`}
        description="This will permanently remove the record from this browser."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
