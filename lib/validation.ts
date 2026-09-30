import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const recordSchema = z.object({
  day: z.number().int().positive("Day must be a positive integer"),
  date: z.string().regex(dateRegex, "Date must be valid"),
  timeIn: z.string().regex(timeRegex, "Time in must be valid"),
  timeOut: z.string().regex(timeRegex, "Time out must be valid"),
  breakMinutes: z.number().int().min(0, "Break cannot be negative"),
  notes: z.array(z.string()),
});

export type RecordInput = z.infer<typeof recordSchema>;

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  supervisor: z.string().optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  requiredHours: z.number().positive("Required hours must be greater than 0"),
});

export const setupSchema = z.object({
  requiredHours: z.number().positive("Required hours must be greater than 0"),
  companyName: z.string().min(1, "Company name is required"),
  startDate: z.string().optional(),
});
