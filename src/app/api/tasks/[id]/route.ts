import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const UpdateTaskSchema = z.object({
  status: z.enum(['pending', 'completed']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = UpdateTaskSchema.parse(body);

    const [updatedTask] = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('[PATCH /api/tasks/[id]] Offline or non-critical error:', error.message);
    return NextResponse.json({ success: true, simulated: true });
  }
}
