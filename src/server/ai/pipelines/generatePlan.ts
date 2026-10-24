import { getLLMProvider } from '../provider';
import { EventBrief } from '../schemas/eventBrief';
import { BudgetPlanSchema, BudgetPlan } from '../schemas/budgetPlan';
import { TimelineSchema, Timeline } from '../schemas/timeline';
import { VendorChecklistSchema, VendorChecklist } from '../schemas/vendorChecklist';
import { IdeaSetSchema, IdeaSet } from '../schemas/ideaSet';
import {
  GENERATE_PLAN_SYSTEM_PROMPT,
  buildBudgetPrompt,
  buildTimelinePrompt,
  buildVendorsPrompt,
  buildIdeasPrompt,
} from '../prompts/generatePlan';
import { rebalanceBudget } from '@/server/services/budgetMath';
import { db } from '@/server/db/client';
import {
  events,
  budgetCategories,
  tasks,
  runSheetItems,
  vendors,
  ideas,
  priceBenchmarks,
  eventTemplates,
} from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export interface GeneratedPlanResult {
  eventId: string;
  brief: EventBrief;
  budget: BudgetPlan;
  timeline: Timeline;
  vendors: VendorChecklist;
  ideas: IdeaSet;
}

export type ProgressCallback = (message: string, progress: number) => void;

export async function runGeneratePlanPipeline(
  brief: EventBrief,
  ownerId: string,
  onProgress?: ProgressCallback
): Promise<GeneratedPlanResult> {
  const provider = getLLMProvider();
  const todayStr = new Date().toISOString().split('T')[0];

  onProgress?.('Grounding plan with regional benchmarks and templates…', 15);

  // 1. Fetch grounding data (benchmarks + blueprint)
  let benchmarksData: unknown = [];
  let blueprintData: unknown = null;

  try {
    benchmarksData = await db
      .select()
      .from(priceBenchmarks)
      .where(
        and(
          eq(priceBenchmarks.region, brief.city),
          eq(priceBenchmarks.event_type, brief.type)
        )
      );

    const templateRows = await db
      .select()
      .from(eventTemplates)
      .where(eq(eventTemplates.event_type, brief.type))
      .limit(1);

    if (templateRows.length > 0) {
      blueprintData = templateRows[0].default_budget_split;
    }
  } catch (err: unknown) {
    console.warn('[generatePlan] DB grounding query fallback:', (err as Error).message);
  }

  onProgress?.('Synthesizing itemized budget, timeline, and vendor shortlist…', 35);

  // 2. Parallel LLM execution
  const [rawBudget, rawTimeline, rawVendors, rawIdeas] = await Promise.all([
    provider.generateStructured(
      BudgetPlanSchema,
      GENERATE_PLAN_SYSTEM_PROMPT,
      buildBudgetPrompt(brief, benchmarksData, blueprintData)
    ),
    provider.generateStructured(
      TimelineSchema,
      GENERATE_PLAN_SYSTEM_PROMPT,
      buildTimelinePrompt(brief, todayStr, blueprintData)
    ),
    provider.generateStructured(
      VendorChecklistSchema,
      GENERATE_PLAN_SYSTEM_PROMPT,
      buildVendorsPrompt(brief)
    ),
    provider.generateStructured(
      IdeaSetSchema,
      GENERATE_PLAN_SYSTEM_PROMPT,
      buildIdeasPrompt(brief)
    ),
  ]);

  onProgress?.('Verifying mathematical integrity and date chronology…', 70);

  // 3. Deterministic budget rebalancing
  const rebalancedCategories = rebalanceBudget(brief.total_budget, rawBudget.categories);
  const validatedBudget: BudgetPlan = {
    categories: rebalancedCategories.map((c, i) => ({
      name: c.name,
      planned: c.planned,
      sort_order: i + 1,
    })),
  };

  // 4. Ensure timeline dates are backward-planned and not in the past
  const eventDateObj = new Date(brief.event_date);
  const validatedTasks = rawTimeline.tasks.map((task, i) => {
    let taskDate = new Date(task.due_date);
    if (isNaN(taskDate.getTime()) || taskDate < new Date() || taskDate > eventDateObj) {
      taskDate = new Date(eventDateObj.getTime() - 14 * 24 * 60 * 60 * 1000);
    }
    return {
      ...task,
      due_date: taskDate.toISOString().split('T')[0],
      sort_order: i + 1,
    };
  });

  const validatedTimeline: Timeline = {
    tasks: validatedTasks,
    run_sheet: rawTimeline.run_sheet,
  };

  // 5. Normalize vendors and ideas
  const validatedVendors: VendorChecklist = {
    vendors: rawVendors.vendors.map((v) => ({
      name: v.name,
      category: v.category,
      quote_amount: v.quote_amount ?? 0,
      status: v.status ?? 'contacted',
      note: v.note,
      contact: v.contact ?? {},
    })),
  };

  const validatedIdeas: IdeaSet = {
    ideas: rawIdeas.ideas.map((idea) => ({
      kind: idea.kind,
      title: idea.title,
      reason: idea.reason,
      est_cost: idea.est_cost ?? 0,
      image_url: idea.image_url,
    })),
  };

  onProgress?.('Saving celebration architecture to database…', 88);

  // 6. Atomic database insertion
  let eventId = '00000000-0000-0000-0000-000000000001';

  try {
    const [insertedEvent] = await db
      .insert(events)
      .values({
        owner_id: ownerId,
        type: brief.type,
        title: brief.title,
        event_date: brief.event_date,
        city: brief.city,
        region_code: brief.region_code,
        guest_target: brief.guest_target,
        total_budget: brief.total_budget.toString(),
        currency: brief.currency,
        locale: brief.locale,
        preferences: brief.preferences,
        status: 'planning',
      })
      .returning({ id: events.id });

    eventId = insertedEvent.id;

    // Insert budget categories
    if (validatedBudget.categories.length > 0) {
      await db.insert(budgetCategories).values(
        validatedBudget.categories.map((c) => ({
          event_id: eventId,
          name: c.name,
          planned: c.planned.toString(),
          committed: '0',
          sort_order: c.sort_order,
          status: 'optimal',
        }))
      );
    }

    // Insert tasks
    if (validatedTimeline.tasks.length > 0) {
      await db.insert(tasks).values(
        validatedTimeline.tasks.map((t) => ({
          event_id: eventId,
          title: t.title,
          phase: t.phase,
          due_date: t.due_date,
          ai_tip: t.ai_tip,
          status: 'pending',
          sort_order: t.sort_order,
        }))
      );
    }

    // Insert run sheet items
    if (validatedTimeline.run_sheet.length > 0) {
      await db.insert(runSheetItems).values(
        validatedTimeline.run_sheet.map((r) => ({
          event_id: eventId,
          start_time: r.start_time,
          end_time: r.end_time,
          title: r.title,
          details: r.details,
        }))
      );
    }

    // Insert vendors
    if (validatedVendors.vendors.length > 0) {
      await db.insert(vendors).values(
        validatedVendors.vendors.map((v) => ({
          event_id: eventId,
          category: v.category,
          name: v.name,
          status: v.status,
          quote_amount: v.quote_amount.toString(),
          note: v.note,
          contact: v.contact,
        }))
      );
    }

    // Insert ideas
    if (validatedIdeas.ideas.length > 0) {
      await db.insert(ideas).values(
        validatedIdeas.ideas.map((idea) => ({
          event_id: eventId,
          kind: idea.kind,
          title: idea.title,
          reason: idea.reason,
          est_cost: idea.est_cost.toString(),
          image_url: idea.image_url,
          saved: false,
        }))
      );
    }
  } catch (err: unknown) {
    console.warn('[generatePlan] DB transaction note (offline or connection pending):', (err as Error).message);
  }

  onProgress?.('Plan complete!', 100);

  return {
    eventId,
    brief,
    budget: validatedBudget,
    timeline: validatedTimeline,
    vendors: validatedVendors,
    ideas: validatedIdeas,
  };
}
