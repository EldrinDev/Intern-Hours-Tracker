import Dexie, { type Table } from "dexie";
import type { Company } from "@/types/company";
import type { DailyRecord } from "@/types/record";
import { type OJTSettings, SETTINGS_ID, defaultSettings } from "@/types/settings";

export class OJTDatabase extends Dexie {
  companies!: Table<Company, string>;
  records!: Table<DailyRecord, string>;
  settings!: Table<OJTSettings, string>;

  constructor() {
    super("ojt-hours-tracker");
    this.version(1).stores({
      companies: "id, name",
      records: "id, day, date",
      settings: "id",
    });
  }
}

let _db: OJTDatabase | null = null;

/** Lazily get the Dexie instance (client-only). */
export function getDb(): OJTDatabase {
  if (typeof window === "undefined") {
    throw new Error("Dexie is only available in the browser");
  }
  if (!_db) {
    _db = new OJTDatabase();
  }
  return _db;
}

/** Ensure a settings row exists; returns it. */
export async function ensureSettings(): Promise<OJTSettings> {
  const db = getDb();
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) return existing;
  await db.settings.put(defaultSettings);
  return defaultSettings;
}
