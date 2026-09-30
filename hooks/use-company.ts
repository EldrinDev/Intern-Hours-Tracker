"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/lib/db/dexie";
import { useMounted } from "./use-live";
import type { Company } from "@/types/company";

/** Live current company (by settings.companyId, else first). */
export function useCompany(): { company: Company | undefined; loading: boolean } {
  const mounted = useMounted();
  const company = useLiveQuery(async () => {
    const db = getDb();
    const settings = await db.settings.get("settings");
    if (settings?.companyId) {
      const c = await db.companies.get(settings.companyId);
      if (c) return c;
    }
    return db.companies.toCollection().first();
  }, []);
  return { company, loading: !mounted || company === undefined };
}
