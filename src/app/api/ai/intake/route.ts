import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runIntakePipeline } from '@/server/ai/pipelines/intake';

const IntakeRequestSchema = z.object({
  prompt: z.string().min(1, 'Please describe your event'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = IntakeRequestSchema.parse(body);

    const brief = await runIntakePipeline(prompt);

    return NextResponse.json({ success: true, brief });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/ai/intake error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process event intake' },
      { status: 400 }
    );
  }
}
