import { z } from 'zod';

export const PatchOperationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('setBudgetTotal'),
    total_budget: z.number().positive(),
  }),
  z.object({
    type: z.literal('rebalanceCategory'),
    category_name: z.string().min(1),
    amount: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('replaceTheme'),
    new_theme: z.string().min(1),
  }),
  z.object({
    type: z.literal('addTask'),
    title: z.string().min(1),
    phase: z.string().min(1),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ai_tip: z.string().optional(),
  }),
  z.object({
    type: z.literal('updateVendorQuote'),
    vendor_name: z.string().min(1),
    quote_amount: z.number().nonnegative(),
    status: z.enum(['contacted', 'quoted', 'confirmed', 'paid']).optional(),
  }),
]);

export const PlanPatchSchema = z.object({
  summary: z.string().min(1),
  operations: z.array(PatchOperationSchema).min(1),
});

export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type PlanPatch = z.infer<typeof PlanPatchSchema>;
