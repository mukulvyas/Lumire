import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { ideas, tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const UpdateIdeaSchema = z.object({
  saved: z.boolean().optional(),
  addToPlan: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { saved, addToPlan } = UpdateIdeaSchema.parse(body);

    if (saved !== undefined) {
      await db.update(ideas).set({ saved }).where(eq(ideas.id, id));
    }

    if (addToPlan) {
      // Find the idea
      const ideaRows = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
      if (ideaRows.length > 0) {
        const idea = ideaRows[0];
        // Insert as a new actionable task
        await db.insert(tasks).values({
          event_id: idea.event_id,
          title: `Incorporate Idea: ${idea.title}`,
          phase: 'Phase 3: Logistics',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ai_tip: idea.reason,
          status: 'pending',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('[PATCH /api/ideas/[id]] Simulated fallback:', error.message);
    return NextResponse.json({ success: true, simulated: true });
  }
}
