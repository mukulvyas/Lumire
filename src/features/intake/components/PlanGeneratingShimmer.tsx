'use client';

import React from 'react';
import { Sparkles, Calendar, PieChart, Users, CheckCircle2 } from 'lucide-react';
import { SkeletonShimmer } from '@/components/motion/SkeletonShimmer';

interface PlanGeneratingShimmerProps {
  progress: number;
  statusMessage: string;
  eventTitle?: string;
}

export function PlanGeneratingShimmer({
  progress,
  statusMessage,
  eventTitle = 'Your celebration',
}: PlanGeneratingShimmerProps) {
  const isComplete = progress >= 100;

  return (
    <div className="w-full max-w-[720px] mx-auto py-12 px-6 flex flex-col items-center text-center">
      {/* Glowing Ambient Badge */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary-container/20 via-tertiary-fixed-dim/20 to-secondary-container/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-lg flex items-center justify-center">
          {isComplete ? (
            <CheckCircle2 className="w-8 h-8 text-success animate-bounce" />
          ) : (
            <Sparkles className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '4s' }} />
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface mb-2">
        {isComplete ? 'Celebration plan ready!' : 'Crafting your celebration plan…'}
      </h2>
      <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-[500px] mb-8">
        {isComplete
          ? `Everything is in place for ${eventTitle}. Redirecting to your workspace...`
          : `Lumière AI is grounding costs, balancing schedules, and creating a tailored plan for ${eventTitle}.`}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-[520px] bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-5 border border-primary/15 shadow-md mb-10 text-left">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary mb-2.5">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping inline-block shrink-0" />
            <span className="truncate">{statusMessage || 'Allocating celebration streams...'}</span>
          </span>
          <span className="font-mono text-sm text-on-surface ml-2">{Math.min(100, Math.round(progress))}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5 border border-primary/10">
          <div
            className="h-full bg-gradient-to-r from-primary-container via-primary to-tertiary-fixed-dim rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(91,42,134,0.3)]"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
      </div>

      {/* Shimmer Preview Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-xl bg-surface-container-lowest/70 border border-primary/10 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-primary text-xs font-semibold">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Milestones</span>
          </div>
          <SkeletonShimmer lines={2} />
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest/70 border border-primary/10 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-secondary text-xs font-semibold">
            <PieChart className="w-4 h-4 text-secondary-container" />
            <span>Budget Ledger</span>
          </div>
          <SkeletonShimmer lines={2} />
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest/70 border border-primary/10 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-tertiary text-xs font-semibold">
            <Users className="w-4 h-4 text-tertiary-fixed-dim" />
            <span>Shortlists</span>
          </div>
          <SkeletonShimmer lines={2} />
        </div>
      </div>
    </div>
  );
}
