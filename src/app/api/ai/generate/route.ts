import { NextRequest } from 'next/server';
import { EventBriefSchema } from '@/server/ai/schemas/eventBrief';
import { runGeneratePlanPipeline } from '@/server/ai/pipelines/generatePlan';
import { z } from 'zod';

const GenerateRequestSchema = z.object({
  brief: EventBriefSchema,
  ownerId: z.string().optional().default('00000000-0000-0000-0000-000000000001'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief, ownerId } = GenerateRequestSchema.parse(body);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const result = await runGeneratePlanPipeline(brief, ownerId, (message, progress) => {
            sendEvent({ message, progress });
          });

          sendEvent({
            done: true,
            progress: 100,
            eventId: result.eventId,
            plan: result,
          });

          controller.close();
        } catch (err: unknown) {
          const error = err as Error;
          console.error('[SSE generate] Pipeline error:', error);
          sendEvent({ error: error.message || 'Generation failed' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
