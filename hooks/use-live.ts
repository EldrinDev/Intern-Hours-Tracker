"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

/** True once mounted on the client (avoids SSR/Dexie mismatch). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export { useLiveQuery };
