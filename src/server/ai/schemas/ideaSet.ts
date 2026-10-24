import { z } from 'zod';

export const IdeaItemSchema = z.object({
  kind: z.enum(['theme', 'menu', 'decor', 'entertainment', 'invitations', 'gifts']),
  title: z.string().min(1),
  reason: z.string().min(1),
  est_cost: z.number().nonnegative().default(0),
  image_url: z.string().url().optional(),
});

export const IdeaSetSchema = z.object({
  ideas: z.array(IdeaItemSchema).min(3),
});

export type IdeaItem = z.infer<typeof IdeaItemSchema>;
export type IdeaSet = z.infer<typeof IdeaSetSchema>;
