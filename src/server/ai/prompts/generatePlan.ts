import { EventBrief } from '../schemas/eventBrief';

export const GENERATE_PLAN_SYSTEM_PROMPT = `You are Soirée's Master Celebration Planner.
You generate production-quality, data-driven event plans grounded in real regional market prices and event blueprints.
You must return valid JSON matching the requested schema.

Non-negotiable Rules:
1. Category budget amounts must be realistic and reflect regional market rates.
2. Timeline tasks must be backward-planned from the event date and NEVER in the past.
3. Every task must include an actionable, concise AI tip.
4. Output strictly JSON without markdown delimiters.`;

export function buildBudgetPrompt(brief: EventBrief, benchmarks: unknown, blueprint: unknown): string {
  return `Generate an itemized budget split for this event:
Event Type: ${brief.type}
Total Budget: ₹${brief.total_budget}
Guest Count: ${brief.guest_target}
City: ${brief.city}
Style/Theme: ${JSON.stringify(brief.preferences)}

Regional Price Benchmarks Grounding:
${JSON.stringify(benchmarks, null, 2)}

Template Blueprint Split:
${JSON.stringify(blueprint, null, 2)}

Return a JSON object with:
"categories": [ { "name": string, "planned": number, "sort_order": number } ]`;
}

export function buildTimelinePrompt(brief: EventBrief, todayStr: string, blueprint: unknown): string {
  return `Generate a chronological milestone timeline and day-of run sheet:
Event Date: ${brief.event_date}
Today's Date: ${todayStr}
Event Type: ${brief.type}
Guest Count: ${brief.guest_target}

Blueprint Guide:
${JSON.stringify(blueprint, null, 2)}

Ensure:
- All task due_dates are between ${todayStr} and ${brief.event_date} (no past dates).
- Include 3 to 6 key planning milestones with practical AI tips.
- Include 2 to 4 day-of run sheet items with start_time and end_time (HH:MM).

Return a JSON object with:
"tasks": [ { "title": string, "phase": string, "due_date": "YYYY-MM-DD", "ai_tip": string, "sort_order": number } ],
"run_sheet": [ { "start_time": "HH:MM", "end_time": "HH:MM", "title": string, "details": string } ]`;
}

export function buildVendorsPrompt(brief: EventBrief): string {
  return `Generate a vendor shortlist for this celebration:
Event Type: ${brief.type}
City: ${brief.city}
Total Budget: ₹${brief.total_budget}
Guest Count: ${brief.guest_target}

Return 3 to 5 vendors across essential categories (e.g. Venue, Catering, Décor, Photography, Music) with realistic quote estimates in INR.

Return a JSON object with:
"vendors": [
  {
    "name": string,
    "category": string,
    "quote_amount": number,
    "status": "contacted" | "quoted" | "confirmed" | "paid",
    "note": string,
    "contact": { "phone": string }
  }
]`;
}

export function buildIdeasPrompt(brief: EventBrief): string {
  return `Curate 3 to 6 creative, personalized celebration ideas for:
Event Type: ${brief.type}
City: ${brief.city}
Theme/Style: ${JSON.stringify(brief.preferences)}

Each idea must explain how it saves money or enhances emotional impact without bloating costs.

Return a JSON object with:
"ideas": [
  {
    "kind": "theme" | "menu" | "decor" | "entertainment" | "invitations" | "gifts",
    "title": string,
    "reason": string,
    "est_cost": number,
    "image_url": string
  }
]`;
}
