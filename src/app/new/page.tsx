'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventBrief } from '@/server/ai/schemas/eventBrief';
import { IntakeChat } from '@/features/intake/components/IntakeChat';
import { PlanGeneratingShimmer } from '@/features/intake/components/PlanGeneratingShimmer';
import { fireConfettiBurst } from '@/components/motion/ConfettiBurst';
import { SkeletonShimmer } from '@/components/motion/SkeletonShimmer';
import { Sparkles, AlertCircle } from 'lucide-react';

function IntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [isLoadingIntake, setIsLoadingIntake] = useState(true);
  const [brief, setBrief] = useState<EventBrief | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(10);
  const [statusMessage, setStatusMessage] = useState('Grounding celebration concept...');

  useEffect(() => {
    let isCancelled = false;

    async function fetchIntake() {
      setIsLoadingIntake(true);
      setErrorMessage(null);

      try {
        const promptToUse = initialPrompt.trim() || 'A 150-guest celebration with dinner and music';
        const res = await fetch('/api/ai/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptToUse }),
        });

        if (!res.ok) {
          throw new Error('Failed to analyze event details');
        }

        const data = await res.json();
        if (!isCancelled && data.brief) {
          setBrief(data.brief);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const error = err as Error;
          setErrorMessage(error.message || 'Something went wrong processing your request');
          // Provide fallback brief so user is never blocked
          setBrief({
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
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingIntake(false);
        }
      }
    }

    fetchIntake();

    return () => {
      isCancelled = true;
    };
  }, [initialPrompt]);

  async function handleStartGeneration(finalBrief: EventBrief) {
    setIsGenerating(true);
    setProgress(15);
    setStatusMessage('Grounding against regional market rates...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: finalBrief }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to generate plan stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const eventData = JSON.parse(jsonStr);

              if (eventData.error) {
                throw new Error(eventData.error);
              }

              if (eventData.progress !== undefined) {
                setProgress(eventData.progress);
              }
              if (eventData.message) {
                setStatusMessage(eventData.message);
              }

              if (eventData.done && eventData.eventId) {
                setProgress(100);
                setStatusMessage('Celebration plan finalized!');
                fireConfettiBurst();

                setTimeout(() => {
                  router.push(`/events/${eventData.eventId}`);
                }, 700);
                return;
              }
            } catch (err) {
              console.error('Error parsing SSE chunk:', err);
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setIsGenerating(false);
      setErrorMessage(error.message || 'Error occurred during generation. Please try again.');
    }
  }

  if (isGenerating) {
    return (
      <PlanGeneratingShimmer
        progress={progress}
        statusMessage={statusMessage}
        eventTitle={brief?.title || 'Your celebration'}
      />
    );
  }

  if (isLoadingIntake) {
    return (
      <div className="w-full max-w-[720px] mx-auto py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-7 h-7 text-primary animate-spin" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mb-2">
          Analyzing your celebration details…
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-[440px] mx-auto mb-8">
          Extracting dates, guest targets, and regional expectations from your vision.
        </p>
        <div className="max-w-[480px] mx-auto bg-surface-container-lowest/80 p-6 rounded-2xl border border-primary/10">
          <SkeletonShimmer lines={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)]">
      {errorMessage && (
        <div className="max-w-[820px] mx-auto mt-4 px-4">
          <div className="p-4 rounded-xl bg-error-container/60 border border-error/30 text-error flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {brief && (
        <IntakeChat
          initialBrief={brief}
          onGenerate={handleStartGeneration}
          isSubmitting={isGenerating}
        />
      )}
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[720px] mx-auto py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="font-sans text-sm text-on-surface-variant">Loading celebration intake...</p>
        </div>
      }
    >
      <IntakeContent />
    </Suspense>
  );
}
