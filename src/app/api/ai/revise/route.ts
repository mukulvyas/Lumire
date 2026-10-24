import { NextRequest, NextResponse } from 'next/server';
import { runRevisePlanPipeline } from '@/server/ai/pipelines/revisePlan';
import { z } from 'zod';

const ReviseRequestSchema = z.object({
  eventId: z.string(),
  instruction: z.string().min(1, 'Please provide revision instructions'),
  currentPlanSnapshot: z.object({
    total_budget: z.number(),
    categories: z.array(z.object({ name: z.string(), planned: z.number() })),
    theme: z.string().optional(),
    tasks: z.array(z.object({ title: z.string(), due_date: z.string() })).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instruction, currentPlanSnapshot } = ReviseRequestSchema.parse(body);

    const result = await runRevisePlanPipeline(currentPlanSnapshot, instruction);

    return NextResponse.json({
      success: true,
      patch: result.patch,
      diffs: result.diffs,
      proposedSnapshot: result.proposedSnapshot,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/ai/revise error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process plan revision' },
      { status: 400 }
    );
  }
}
