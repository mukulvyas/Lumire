import { z } from 'zod';

export const VendorItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  quote_amount: z.number().nonnegative().default(0),
  status: z.enum(['contacted', 'quoted', 'confirmed', 'paid']).default('contacted'),
  note: z.string().optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
    })
    .default({}),
});

export const VendorChecklistSchema = z.object({
  vendors: z.array(VendorItemSchema).min(3),
});

export type VendorItem = z.infer<typeof VendorItemSchema>;
export type VendorChecklist = z.infer<typeof VendorChecklistSchema>;
