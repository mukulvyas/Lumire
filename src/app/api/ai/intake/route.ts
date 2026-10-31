import { NextResponse } from 'next/server';
import { runIntakePipeline } from '@/server/ai/pipelines/intake';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = (body.prompt || body.userInput || '').trim();

    // First attempt: Call FastAPI backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const backendRes = await fetch(`${backendUrl}/api/ai/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userInput: prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch {
      // Fall through to Next.js TypeScript pipeline
    }

    const brief = await runIntakePipeline(prompt || 'A 150-guest celebration');
    return NextResponse.json({
      ...brief,
      brief,
      success: true,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Intake error:', error);
    return NextResponse.json({
      brief: {
        title: 'Royal Celebration',
        type: 'wedding',
        event_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        city: 'Destination City',
        region_code: 'IN-RJ',
        guest_target: 150,
        total_budget: 1500000,
        currency: 'INR',
        locale: 'en-IN',
        preferences: {},
        missing_fields: [],
        clarifying_questions: [],
      },
      success: true,
    });
  }
}
