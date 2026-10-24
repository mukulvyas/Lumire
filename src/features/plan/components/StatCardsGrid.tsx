'use client';

import React from 'react';
import { formatLakh, calculatePercentage } from '@/lib/formatters';

interface StatCardsGridProps {
  daysToGo: number;
  confirmedGuests: number;
  totalGuestsTarget: number;
  committedBudget: number;
  totalBudget: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export function StatCardsGrid({
  daysToGo,
  confirmedGuests,
  totalGuestsTarget,
  committedBudget,
  totalBudget,
  completedTasksCount,
  totalTasksCount,
}: StatCardsGridProps) {
  // Safe calculations
  const guestProgress = calculatePercentage(confirmedGuests, totalGuestsTarget);
  const budgetProgress = calculatePercentage(committedBudget, totalBudget);
  const taskProgress = calculatePercentage(completedTasksCount, totalTasksCount);

  // Countdown progress assuming a typical 180-day planning cycle
  const countdownProgress = Math.max(10, Math.min(100, Math.round(((180 - daysToGo) / 180) * 100)));

  return (
    <section aria-label="Key Celebration Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-14">
      {/* 1. Countdown Card */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-7 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] flex flex-col justify-between h-44 hover:shadow-[0_16px_40px_-8px_rgba(91,42,134,0.1)] transition-all border border-primary/5">
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Countdown
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-primary">
            {daysToGo}
          </span>
          <span className="font-sans text-sm text-on-surface-variant font-medium">days</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-secondary-container h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${countdownProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Guests Card */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-7 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] flex flex-col justify-between h-44 hover:shadow-[0_16px_40px_-8px_rgba(91,42,134,0.1)] transition-all border border-primary/5">
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Guests
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-primary">
            {confirmedGuests}
          </span>
          <span className="font-sans text-sm text-on-surface-variant font-medium">
            / {totalGuestsTarget} confirmed
          </span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-success h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${guestProgress}%` }}
          />
        </div>
      </div>

      {/* 3. Budget Card */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-7 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] flex flex-col justify-between h-44 hover:shadow-[0_16px_40px_-8px_rgba(91,42,134,0.1)] transition-all border border-primary/5">
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Budget
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-primary">
            {formatLakh(committedBudget)}
          </span>
          <span className="font-sans text-sm text-on-surface-variant font-medium">
            / {formatLakh(totalBudget)}
          </span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-tertiary-fixed-dim h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${budgetProgress}%` }}
          />
        </div>
      </div>

      {/* 4. Tasks Card */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-7 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] flex flex-col justify-between h-44 hover:shadow-[0_16px_40px_-8px_rgba(91,42,134,0.1)] transition-all border border-primary/5">
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Tasks
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-primary">
            {completedTasksCount}
          </span>
          <span className="font-sans text-sm text-on-surface-variant font-medium">
            / {totalTasksCount} done
          </span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary-container h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${taskProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
