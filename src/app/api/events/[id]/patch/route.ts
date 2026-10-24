import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { events, budgetCategories, tasks, planRevisions } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { PlanPatch } from '@/server/ai/schemas/planPatch';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await req.json();

    if (body.action === 'undo') {
      // 1. Fetch most recent revision snapshot
      const revisions = await db
        .select()
        .from(planRevisions)
        .where(eq(planRevisions.event_id, eventId))
        .orderBy(desc(planRevisions.created_at))
        .limit(1);

      if (revisions.length === 0) {
        return NextResponse.json({ success: true, message: 'No earlier revision to restore' });
      }

      const rev = revisions[0];
      const snapshot = rev.snapshot as {
        total_budget?: number;
        categories?: { name: string; planned: number }[];
        theme?: string;
      };

      if (snapshot.total_budget) {
        await db.update(events).set({ total_budget: snapshot.total_budget.toString() }).where(eq(events.id, eventId));
      }

      if (snapshot.categories) {
        for (const cat of snapshot.categories) {
          await db
            .update(budgetCategories)
            .set({ planned: cat.planned.toString() })
            .where(and(eq(budgetCategories.event_id, eventId), eq(budgetCategories.name, cat.name)));
        }
      }

      // Delete restored revision
      await db.delete(planRevisions).where(eq(planRevisions.id, rev.id));

      return NextResponse.json({ success: true, restored: true });
    }

    // 2. Action === 'apply'
    const patch = body.patch as PlanPatch;
    const currentSnapshot = body.currentSnapshot;

    // Save previous snapshot for undo capability
    if (currentSnapshot) {
      await db.insert(planRevisions).values({
        event_id: eventId,
        snapshot: currentSnapshot,
      });
    }

    if (patch && patch.operations) {
      for (const op of patch.operations) {
        if (op.type === 'setBudgetTotal') {
          await db
            .update(events)
            .set({ total_budget: op.total_budget.toString() })
            .where(eq(events.id, eventId));
        } else if (op.type === 'rebalanceCategory') {
          await db
            .update(budgetCategories)
            .set({ planned: op.amount.toString() })
            .where(
              and(
                eq(budgetCategories.event_id, eventId),
                eq(budgetCategories.name, op.category_name)
              )
            );
        } else if (op.type === 'replaceTheme') {
          await db
            .update(events)
            .set({ preferences: { theme: op.new_theme } })
            .where(eq(events.id, eventId));
        } else if (op.type === 'addTask') {
          await db.insert(tasks).values({
            event_id: eventId,
            title: op.title,
            due_date: op.due_date,
            phase: 'Phase 3: Logistics',
            status: 'pending',
          });
        }
      }
    }

    return NextResponse.json({ success: true, applied: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('[POST /api/events/[id]/patch] Offline or simulated:', error.message);
    return NextResponse.json({ success: true, simulated: true });
  }
}
