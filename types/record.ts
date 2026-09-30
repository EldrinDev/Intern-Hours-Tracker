export interface DailyRecord {
  id: string;
  day: number;
  date: string; // ISO date (yyyy-MM-dd)

  timeIn: string; // 24h "HH:mm"
  timeOut: string; // 24h "HH:mm"

  breakMinutes: number;

  renderedMinutes: number;
  cumulativeMinutes: number;
  remainingMinutes: number;

  notes: string[];

  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/** A record shape used before persistence (no calc fields yet). */
export interface DraftRecord {
  id?: string;
  day: number;
  date: string;
  timeIn: string;
  timeOut: string;
  breakMinutes: number;
  notes: string[];
}
