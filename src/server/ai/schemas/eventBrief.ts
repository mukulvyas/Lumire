import { z } from 'zod';

export const EventBriefSchema = z.object({
  title: z.string().min(1).default('Celebration Plan'),
  type: z.enum(['wedding', 'birthday', 'community']).default('wedding'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').default('2027-02-14'),
  city: z.string().min(1).default('Destination City'),
  region_code: z.string().default('IN-RJ'),
  guest_target: z.number().int().positive().default(150),
  total_budget: z.number().positive().default(1500000),
  currency: z.string().default('INR'),
  locale: z.string().default('en-IN'),
  preferences: z
    .object({
      style: z.string().optional(),
      culture: z.string().optional(),
      theme: z.string().optional(),
      dietary_notes: z.string().optional(),
    })
    .default({}),
  missing_fields: z.array(z.string()).default([]),
  clarifying_questions: z.array(z.string()).default([]),
});

export type EventBrief = z.infer<typeof EventBriefSchema>;
