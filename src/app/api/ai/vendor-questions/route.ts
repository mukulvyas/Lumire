import { NextRequest, NextResponse } from 'next/server';
import { runVendorQuestionsPipeline } from '@/server/ai/pipelines/vendorQuestions';
import { z } from 'zod';

const VendorQuestionsRequestSchema = z.object({
  vendorName: z.string().min(1),
  category: z.string().min(1),
  budgetEstimate: z.number().nonnegative(),
  city: z.string().optional().default('Destination City'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorName, category, budgetEstimate, city } = VendorQuestionsRequestSchema.parse(body);

    const result = await runVendorQuestionsPipeline(vendorName, category, budgetEstimate, city);

    return NextResponse.json({ success: true, questions: result.questions });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/ai/vendor-questions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate vendor questions' },
      { status: 400 }
    );
  }
}
