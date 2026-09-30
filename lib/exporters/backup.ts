import { exportBackup, importBackup, type BackupPayload } from "@/lib/db/repo";
import { downloadBlob } from "./download";

/** Export the full application state as a JSON backup file. */
export async function downloadBackup(filename = "ojt-tracker-backup.json"): Promise<void> {
  const payload = await exportBackup();
  downloadBlob(JSON.stringify(payload, null, 2), filename, "application/json");
}

/** Read + validate a backup file, then restore it. */
export async function restoreBackup(file: File): Promise<void> {
  const text = await file.text();
  let payload: BackupPayload;
  try {
    payload = JSON.parse(text) as BackupPayload;
  } catch {
    throw new Error("Invalid backup file: not valid JSON.");
  }
  if (!payload || typeof payload !== "object" || !("version" in payload)) {
    throw new Error("Invalid backup file: missing version field.");
  }
  if (!Array.isArray(payload.records)) {
    throw new Error("Invalid backup file: records missing.");
  }
  await importBackup(payload);
}
