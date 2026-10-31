import { getLLMProvider } from '../provider';
import { PlanPatchSchema, PlanPatch } from '../schemas/planPatch';
import { REVISE_PLAN_SYSTEM_PROMPT, buildRevisePlanUserPrompt } from '../prompts/revisePlan';

export interface PlanDiffItem {
  field: string;
  before: string | number;
  after: string | number;
  changeType: 'modified' | 'added' | 'removed';
}

export interface RevisePlanResult {
  patch: PlanPatch;
  diffs: PlanDiffItem[];
  proposedSnapshot: unknown;
}

export async function runRevisePlanPipeline(
  currentPlanSnapshot: {
    total_budget: number;
    categories: { name: string; planned: number }[];
    theme?: string;
    tasks?: { title: string; due_date: string }[];
  },
  userInstruction: string,
  history?: Array<{ role: string; content: string }>
): Promise<RevisePlanResult> {
  const provider = getLLMProvider();
  const todayStr = new Date().toISOString().split('T')[0];

  const patch = await provider.generateStructured(
    PlanPatchSchema,
    REVISE_PLAN_SYSTEM_PROMPT,
    buildRevisePlanUserPrompt(currentPlanSnapshot, userInstruction, todayStr, history)
  );

  // Compute deterministic before/after diffs for UI
  const diffs: PlanDiffItem[] = [];
  const proposed = JSON.parse(JSON.stringify(currentPlanSnapshot));
  const operations = patch.operations || [];

  for (const op of operations) {
    if (op.type === 'setBudgetTotal') {
      diffs.push({
        field: 'Total Budget',
        before: currentPlanSnapshot.total_budget,
        after: op.total_budget,
        changeType: 'modified',
      });
      proposed.total_budget = op.total_budget;
    } else if (op.type === 'rebalanceCategory') {
      const existing = currentPlanSnapshot.categories.find((c) => c.name === op.category_name);
      diffs.push({
        field: op.category_name,
        before: existing ? existing.planned : 0,
        after: op.amount,
        changeType: existing ? 'modified' : 'added',
      });
      const cat = proposed.categories.find((c: { name: string }) => c.name === op.category_name);
      if (cat) cat.planned = op.amount;
    } else if (op.type === 'replaceTheme') {
      diffs.push({
        field: 'Theme',
        before: currentPlanSnapshot.theme || 'Standard',
        after: op.new_theme,
        changeType: 'modified',
      });
      proposed.theme = op.new_theme;
    } else if (op.type === 'addTask') {
      diffs.push({
        field: `New Task: ${op.title}`,
        before: 'None',
        after: op.due_date,
        changeType: 'added',
      });
    }
  }

  return {
    patch,
    diffs,
    proposedSnapshot: proposed,
  };
}
