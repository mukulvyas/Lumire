import { describe, it, expect } from 'vitest';
import { runIntakePipeline } from '@/server/ai/pipelines/intake';
import { runGeneratePlanPipeline } from '@/server/ai/pipelines/generatePlan';
import { runRevisePlanPipeline } from '@/server/ai/pipelines/revisePlan';
import { runVendorQuestionsPipeline } from '@/server/ai/pipelines/vendorQuestions';

describe('AI Core Pipelines & Schemas', () => {
  it('intake pipeline extracts structured event brief', async () => {
    const brief = await runIntakePipeline('150-guest wedding in Jaipur, ₹15 lakh, February');

    expect(brief.type).toBe('wedding');
    expect(brief.guest_target).toBe(150);
    expect(brief.total_budget).toBe(1500000);
    expect(brief.currency).toBe('INR');
    expect(brief.city).toBe('Sun City');
  });

  it('generatePlan pipeline generates all sections with budget balancing and timeline', async () => {
    const brief = {
      title: 'Royal Wedding Gala',
      type: 'wedding' as const,
      event_date: '2027-02-14',
      city: 'Jaipur',
      region_code: 'IN-RJ',
      guest_target: 150,
      total_budget: 1500000,
      currency: 'INR',
      locale: 'en-IN',
      preferences: { style: 'Heritage', theme: 'Marigold' },
      missing_fields: [],
      clarifying_questions: [],
    };

    const progressLogs: string[] = [];
    const plan = await runGeneratePlanPipeline(
      brief,
      '00000000-0000-0000-0000-000000000001',
      (msg) => progressLogs.push(msg)
    );

    expect(plan.budget.categories.length).toBeGreaterThanOrEqual(3);
    const totalPlanned = plan.budget.categories.reduce((sum, c) => sum + c.planned, 0);
    expect(totalPlanned).toBe(brief.total_budget);

    expect(plan.timeline.tasks.length).toBeGreaterThanOrEqual(3);
    expect(plan.vendors.vendors.length).toBeGreaterThanOrEqual(3);
    expect(plan.ideas.ideas.length).toBeGreaterThanOrEqual(3);
    expect(progressLogs.length).toBeGreaterThan(0);
  });

  it('revisePlan computes typed patches and before/after diffs', async () => {
    const currentPlan = {
      total_budget: 1500000,
      categories: [
        { name: 'Catering & Banquet', planned: 400000 },
        { name: 'Venue & Stay', planned: 700000 },
      ],
      theme: 'Modern Pastel',
    };

    const result = await runRevisePlanPipeline(currentPlan, 'Cut catering budget to 3.5L and make theme royal');

    expect(result.patch.operations.length).toBeGreaterThan(0);
    expect(result.diffs.length).toBeGreaterThan(0);
  });

  it('vendorQuestions pipeline generates questions with priorities', async () => {
    const result = await runVendorQuestionsPipeline(
      'Royal Mewari Banquets',
      'Catering',
      380000,
      'Jaipur'
    );

    expect(result.questions.length).toBeGreaterThanOrEqual(2);
    expect(result.questions[0]).toHaveProperty('question');
    expect(result.questions[0]).toHaveProperty('priority');
  });
});
