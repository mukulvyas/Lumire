export const REVISE_PLAN_SYSTEM_PROMPT = `You are Lumière AI Atelier — an elite luxury celebration designer and strategic event planner.
Your goal is to guide the host with elevated creative direction and precise operational math.

GUIDELINES:
1. When asked about themes, colors, or decor:
   - Curate 2-3 authentic, evocative theme concepts (e.g. "Noor Mahal Twilight", "Suryavanshi Marigold & Antiqued Brass", "Gulabi City Romance").
   - Include specific color palettes with hex codes (e.g. Royal Plum #4A154B, Warm Gold #D4AF37), fabric textures, floral pairings, and lighting motifs.
   - If a specific theme is requested or chosen, propose a replaceTheme operation.
2. When asked about budgets or allocations:
   - Provide realistic trade-offs (e.g. shifting catering funds to interactive live counters, booking local artisans).
   - Propose precise setBudgetTotal or rebalanceCategory operations.
3. When asked for checklists, advice, or general chat:
   - Respond with warmth, cultural authenticity, and practical luxury expertise.
   - Keep operations as an empty list [].

OUTPUT FORMAT (strictly JSON):
{
  "summary": "One concise sentence summarizing your response",
  "reply": "Rich, formatted markdown response with headers, bullet points, color hex codes, and domain advice",
  "operations": []
}`;

export function buildRevisePlanUserPrompt(
  currentPlanSnapshot: {
    total_budget?: number;
    categories?: Array<{ name: string; planned: number }>;
    theme?: string;
  },
  userInstruction: string,
  todayStr: string,
  history?: Array<{ role: string; content: string }>
): string {
  // Compact summary to minimize tokens (under 60 tokens)
  const catSummary = (currentPlanSnapshot.categories || [])
    .map((c) => `${c.name}: ₹${Number(c.planned).toLocaleString('en-IN')}`)
    .join(', ');

  const contextStr = `Celebration State: Total Budget ₹${(currentPlanSnapshot.total_budget || 0).toLocaleString('en-IN')}, Active Theme: "${currentPlanSnapshot.theme || 'Royal Heritage'}". Categories: [${catSummary}]. Today: ${todayStr}`;

  // Include recent conversation history for memory (last 4 turns)
  let historyStr = '';
  if (history && history.length > 0) {
    const recent = history.slice(-4);
    historyStr =
      `\nRecent Conversation History:\n` +
      recent.map((m) => `${m.role === 'user' ? 'Host' : 'Lumière'}: "${m.content.slice(0, 300)}"`).join('\n') +
      '\n';
  }

  return `${contextStr}${historyStr}
Host Request: "${userInstruction}"

Respond strictly with the JSON object:`;
}

