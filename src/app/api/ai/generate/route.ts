import { NextResponse } from 'next/server';
import { runGeneratePlanPipeline } from '@/server/ai/pipelines/generatePlan';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief = body.brief;
    const ownerId = body.ownerId || '00000000-0000-0000-0000-000000000001';

    // First attempt: Call FastAPI backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const backendRes = await fetch(`${backendUrl}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ brief, ownerId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendRes.ok && backendRes.body) {
        return new Response(backendRes.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }
    } catch {
      // Fall through to Next.js TypeScript pipeline
    }

    // Fallback: Run generate plan pipeline directly
    const plan = await runGeneratePlanPipeline(brief, ownerId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ progress: 30, message: 'Grounding against regional market rates...' })}\n\n`
          )
        );
        await new Promise((r) => setTimeout(r, 200));
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ progress: 65, message: 'Allocating category budgets & vendor contingencies...' })}\n\n`
          )
        );
        await new Promise((r) => setTimeout(r, 200));
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ progress: 100, done: true, eventId: plan.eventId, message: 'Celebration plan finalized!' })}\n\n`
          )
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Generate plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
