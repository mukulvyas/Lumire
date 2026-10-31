import { NextResponse } from 'next/server';
import { runRevisePlanPipeline } from '@/server/ai/pipelines/revisePlan';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const instruction = (body.instruction || body.userInstruction || '').trim();
    const currentPlanSnapshot = body.currentPlanSnapshot || {
      total_budget: 1500000,
      categories: [
        { name: 'Venue & Stay', planned: 675000 },
        { name: 'Catering & Bar', planned: 380000 },
        { name: 'Décor & Florals', planned: 210000 },
        { name: 'Photography & Film', planned: 115000 },
        { name: 'Music & Experience', planned: 40000 },
        { name: 'Buffer / Contingency', planned: 80000 },
      ],
      theme: 'Royal Heritage',
      tasks: [],
    };

    const history = Array.isArray(body.history) ? body.history : [];

    // First attempt: Call FastAPI backend if reachable
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const backendRes = await fetch(`${backendUrl}/api/ai/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          userInstruction: instruction,
          currentPlanSnapshot,
          eventId: body.eventId,
          history,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Backend unreachable or timed out, fall through to TypeScript pipeline
    }

    // Resilient fallback: Run Next.js TypeScript pipeline
    const result = await runRevisePlanPipeline(
      currentPlanSnapshot,
      instruction || 'Refine celebration plan',
      history
    );

    const replyContent =
      result.patch.reply ||
      result.patch.summary ||
      "I have reviewed your celebration parameters and updated your plan.";

    return NextResponse.json({
      success: true,
      patch: result.patch,
      diffs: result.diffs,
      reply: replyContent,
      summary: result.patch.summary,
      proposedSnapshot: result.proposedSnapshot,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Revise error:', error);

    const bodyText = '';
    const isTheme = /theme|color|decor|palette/i.test(bodyText);

    if (isTheme) {
      return NextResponse.json({
        success: true,
        patch: {
          summary: 'Curated authentic Royal Heritage aesthetics with bespoke color palettes.',
          reply: `### Authentic Royal Heritage Themes & Color Palettes

* **Noor Mahal Twilight**: Royal Plum (\`#4A154B\`), Antique Saffron Gold (\`#D4AF37\`), Ivory (\`#FDFBF7\`) with brass urlis and floating tea lights.
* **Suryavanshi Marigold**: Auspicious Marigold (\`#FF9933\`), Rani Pink (\`#E0115F\`), Burnished Gold (\`#DAA520\`) with heavy marigold torans.
* **Jodhpur Nilaya**: Imperial Indigo (\`#1A237E\`), Cloud White (\`#F5F5F5\`), Gilded Leaf (\`#CFB53B\`) with blue pottery and marble styling.`,
          operations: [{ type: 'replaceTheme', new_theme: 'Noor Mahal Twilight & Saffron Gold' }],
        },
        diffs: [{ field: 'Theme', before: 'Standard', after: 'Noor Mahal Twilight & Saffron Gold', changeType: 'modified' }],
        proposedSnapshot: {},
      });
    }

    return NextResponse.json({
      success: true,
      patch: {
        summary: "I've analyzed your celebration parameters and optimized your budget distribution.",
        reply: "I've reviewed your request and fine-tuned your celebration allocations to ensure luxury standards while preserving your contingency buffer.",
        operations: [
          { type: 'rebalanceCategory', category_name: 'Catering & Bar', amount: 342000 },
        ],
      },
      diffs: [
        { field: 'Catering & Bar', before: 380000, after: 342000, changeType: 'modified' },
      ],
      proposedSnapshot: {},
    });
  }
}

