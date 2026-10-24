import { z } from 'zod';

export const TaskItemSchema = z.object({
  title: z.string().min(1),
  phase: z.string().min(1),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  ai_tip: z.string().optional(),
  sort_order: z.number().int().default(0),
});

export const RunSheetItemSchema = z.object({
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  title: z.string().min(1),
  details: z.string().optional(),
});

export const TimelineSchema = z.object({
  tasks: z.array(TaskItemSchema).min(3),
  run_sheet: z.array(RunSheetItemSchema).min(2),
});

export type TaskItem = z.infer<typeof TaskItemSchema>;
export type RunSheetItem = z.infer<typeof RunSheetItemSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
