export interface Company {
  id: string;
  name: string;
  address?: string;
  department?: string;
  position?: string;
  supervisor?: string;
  startDate?: string; // ISO date (yyyy-MM-dd)
  expectedEndDate?: string; // ISO date
  requiredHours: number;
}
