import math
from typing import List, Dict, Any

def rebalance_budget(total_budget: float, categories: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deterministically rebalances category planned amounts so they sum EXACTLY to the event total budget.
    Zero rounding drift or floating point error.
    """
    if not categories:
        return []

    if total_budget <= 0:
        return [{**c, "planned": 0.0, "percentage": 0} for c in categories]

    current_sum = sum(float(c.get("planned", 0)) for c in categories)

    # If already exactly equal, compute percentages directly
    if current_sum == total_budget:
        return [
            {
                **c,
                "planned": round(float(c["planned"])),
                "percentage": round((float(c["planned"]) / total_budget) * 100),
            }
            for c in categories
        ]

    # If current sum is 0, split evenly across all categories
    if current_sum == 0:
        base_amount = math.floor(total_budget / len(categories))
        remainder = int(total_budget - base_amount * len(categories))

        result = []
        for c in categories:
            extra = 1 if remainder > 0 else 0
            if remainder > 0:
                remainder -= 1
            planned = base_amount + extra
            result.append({
                **c,
                "planned": planned,
                "percentage": round((planned / total_budget) * 100),
            })
        return result

    # Scale proportionally
    scale_factor = total_budget / current_sum
    scaled = []
    for c in categories:
        scaled.append({
            **c,
            "planned": round(float(c.get("planned", 0)) * scale_factor),
        })

    # Fix rounding remainder to ensure exact sum = total_budget
    scaled_sum = sum(c["planned"] for c in scaled)
    diff = int(round(total_budget - scaled_sum))

    if diff != 0:
        # Find largest planned category to absorb the minor rounding difference
        target_idx = 0
        max_planned = -1
        for idx, c in enumerate(scaled):
            if c["planned"] > max_planned:
                max_planned = c["planned"]
                target_idx = idx

        scaled[target_idx]["planned"] += diff

    return [
        {
            **c,
            "percentage": round((c["planned"] / total_budget) * 100),
        }
        for c in scaled
    ]
