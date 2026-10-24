export interface RebalanceCategoryInput {
  id?: string;
  name: string;
  planned: number;
  committed?: number;
  sort_order?: number;
}

export interface RebalancedCategoryOutput extends RebalanceCategoryInput {
  planned: number;
  percentage: number;
}

/**
 * Deterministically rebalances category planned amounts so they sum EXACTLY to the event total budget.
 * Zero rounding drift or floating point error.
 */
export function rebalanceBudget(
  totalBudget: number,
  categories: RebalanceCategoryInput[]
): RebalancedCategoryOutput[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  if (totalBudget <= 0) {
    return categories.map((c) => ({
      ...c,
      planned: 0,
      percentage: 0,
    }));
  }

  const currentSum = categories.reduce((sum, c) => sum + (c.planned || 0), 0);

  // If already exactly equal, compute percentages directly
  if (currentSum === totalBudget) {
    return categories.map((c) => ({
      ...c,
      planned: Math.round(c.planned),
      percentage: Math.round((c.planned / totalBudget) * 100),
    }));
  }

  // If current sum is 0, split evenly across all categories
  if (currentSum === 0) {
    const baseAmount = Math.floor(totalBudget / categories.length);
    let remainder = totalBudget - baseAmount * categories.length;

    return categories.map((c) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder--;
      const planned = baseAmount + extra;
      return {
        ...c,
        planned,
        percentage: Math.round((planned / totalBudget) * 100),
      };
    });
  }

  // Scale proportionally
  const scaleFactor = totalBudget / currentSum;
  const scaled = categories.map((c) => ({
    ...c,
    planned: Math.round(c.planned * scaleFactor),
  }));

  // Fix rounding remainder to ensure exact sum = totalBudget
  const scaledSum = scaled.reduce((sum, c) => sum + c.planned, 0);
  const diff = totalBudget - scaledSum;

  if (diff !== 0) {
    // Find largest planned category to absorb the minor rounding difference
    let targetIndex = 0;
    let maxPlanned = -1;
    scaled.forEach((c, index) => {
      if (c.planned > maxPlanned) {
        maxPlanned = c.planned;
        targetIndex = index;
      }
    });

    scaled[targetIndex].planned += diff;
  }

  return scaled.map((c) => ({
    ...c,
    percentage: Math.round((c.planned / totalBudget) * 100),
  }));
}
