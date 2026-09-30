"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/lib/db/dexie";
import { useMounted } from "./use-live";
import { type OJTSettings, SETTINGS_ID, defaultSettings } from "@/types/settings";

/** Live settings row (falls back to defaults until loaded). */
export function useSettings(): { settings: OJTSettings; loading: boolean } {
  const mounted = useMounted();
  const settings = useLiveQuery(async () => {
    return getDb().settings.get(SETTINGS_ID);
  }, []);
  return {
    settings: settings ?? defaultSettings,
    loading: !mounted || settings === undefined,
  };
}
