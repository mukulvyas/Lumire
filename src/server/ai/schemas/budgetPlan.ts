import { z } from 'zod';

export const BudgetCategoryItemSchema = z.object({
  name: z.string().min(1),
  planned: z.number().nonnegative(),
  sort_order: z.number().int().default(0),
});

export const BudgetPlanSchema = z.object({
  categories: z.array(BudgetCategoryItemSchema).min(3),
});

export type BudgetCategoryItem = z.infer<typeof BudgetCategoryItemSchema>;
export type BudgetPlan = z.infer<typeof BudgetPlanSchema>;
