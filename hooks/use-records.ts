"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/lib/db/dexie";
import { sortByDayDate } from "@/lib/calculations/hours";
import { useMounted } from "./use-live";
import type { DailyRecord } from "@/types/record";

/** Live list of all records, chronologically sorted. */
export function useRecords(): { records: DailyRecord[]; loading: boolean } {
  const mounted = useMounted();
  const records = useLiveQuery(async () => {
    const all = await getDb().records.toArray();
    return all.sort(sortByDayDate);
  }, []);
  return { records: records ?? [], loading: !mounted || records === undefined };
}

/** Live single record by id. */
export function useRecord(id: string | undefined): { record: DailyRecord | undefined; loading: boolean } {
  const mounted = useMounted();
  const record = useLiveQuery(async () => {
    if (!id) return undefined;
    return getDb().records.get(id);
  }, [id]);
  return { record, loading: !mounted || (id !== undefined && record === undefined) };
}
