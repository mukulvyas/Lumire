import { z } from 'zod';
import { getLLMProvider } from '../provider';
import {
  VENDOR_QUESTIONS_SYSTEM_PROMPT,
  buildVendorQuestionsPrompt,
} from '../prompts/vendorQuestions';

export const VendorQuestionsResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      priority: z.enum(['critical', 'high', 'standard']).default('standard'),
    })
  ).min(2),
});

export type VendorQuestionsResponse = z.infer<typeof VendorQuestionsResponseSchema>;

export async function runVendorQuestionsPipeline(
  vendorName: string,
  category: string,
  budgetEstimate: number,
  city = 'Local Destination'
): Promise<VendorQuestionsResponse> {
  const provider = getLLMProvider();

  // If using mock provider or offline fallback
  if (provider.name === 'mock') {
    return {
      questions: [
        {
          question: `Does the quote of ₹${budgetEstimate.toLocaleString()} include GST and venue generator backup?`,
          priority: 'critical',
        },
        {
          question: 'What is the overtime rate per hour if the evening schedule extends past midnight?',
          priority: 'high',
        },
        {
          question: 'What is the advance payment breakdown and cancellation/postponement refund policy?',
          priority: 'critical',
        },
        {
          question: 'Do you bring your own setup crew and cleanup team or is that billed separately?',
          priority: 'standard',
        },
      ],
    };
  }

  const result = await provider.generateStructured(
    VendorQuestionsResponseSchema,
    VENDOR_QUESTIONS_SYSTEM_PROMPT,
    buildVendorQuestionsPrompt(vendorName, category, budgetEstimate, city)
  );

  return result;
}
