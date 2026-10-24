'use client';

import React, { useState } from 'react';
import { budgetCategories } from '@/server/db/schema';
import { formatCurrency, formatLakh, calculatePercentage } from '@/lib/formatters';
import {
  Castle,
  Utensils,
  Flower2,
  Camera,
  Music,
  Package,
  Sparkles,
  Check,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface BudgetOverviewProps {
  eventId: string;
  eventTitle: string;
  eventCity: string;
  eventDate: string;
  totalBudget: number;
  initialCategories: (typeof budgetCategories.$inferSelect)[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  venue: Castle,
  stay: Castle,
  catering: Utensils,
  food: Utensils,
  bar: Utensils,
  decor: Flower2,
  florals: Flower2,
  photography: Camera,
  film: Camera,
  music: Music,
  entertainment: Music,
  buffer: Package,
  contingency: Package,
};

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Package;
}

export function BudgetOverview({
  eventId: _eventId,
  eventTitle,
  eventCity,
  eventDate,
  totalBudget,
  initialCategories,
}: BudgetOverviewProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [recommendationDismissed, setRecommendationDismissed] = useState(false);
  const [recommendationApplied, setRecommendationApplied] = useState(false);

  const totalCommitted = categories.reduce((sum, c) => sum + Number(c.committed), 0);
  const committedRate = calculatePercentage(totalCommitted, totalBudget);
  const bufferRemaining = Math.max(0, totalBudget - totalCommitted);

  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  function handleApplyRecommendation() {
    setRecommendationApplied(true);
    // Optimistically reduce Décor category planned amount by ₹45,000 and add to buffer
    setCategories((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase().includes('décor') || c.name.toLowerCase().includes('decor')) {
          const newPlanned = Math.max(0, Number(c.planned) - 45000);
          return { ...c, planned: newPlanned.toString(), status: 'optimal' };
        }
        if (c.name.toLowerCase().includes('buffer')) {
          const newPlanned = Number(c.planned) + 45000;
          return { ...c, planned: newPlanned.toString() };
        }
        return c;
      })
    );
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* 1. Header / Context Section */}
      <header className="flex flex-col items-start gap-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-sans text-xs uppercase tracking-wider text-primary font-semibold">
            Budget Overview
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
          Your budget
        </h1>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl">
          Real-time cost tracking and AI allocation for{' '}
          <span className="font-semibold text-on-surface">{eventTitle}</span> • Total limit{' '}
          {formatCurrency(totalBudget, 'INR', 'en-IN')}
        </p>
      </header>

      {/* 2. Hero Metric Card */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest/80 backdrop-blur-xl p-6 sm:p-10 shadow-[0_16px_40px_-8px_rgba(91,42,134,0.08)] border border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-primary tracking-tight">
                {formatLakh(totalCommitted)}
              </span>
              <span className="font-sans text-base sm:text-lg text-on-surface-variant">
                of {formatLakh(totalBudget)} target
              </span>
            </div>

            <div className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-primary/10 text-xs sm:text-sm font-medium text-on-surface">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-success" />
              <span>{formatCurrency(bufferRemaining, 'INR', 'en-IN')} buffer remaining</span>
            </div>
          </div>

          {/* Master Animated Allocation Progress Bar */}
          <div className="relative w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-container via-primary to-tertiary-fixed-dim transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(100, committedRate)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs text-on-surface-variant font-medium">
            <span className="uppercase tracking-wider">Committed {committedRate}%</span>
            <span>
              {eventCity} • {formattedDate}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Content Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Category Breakdown */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-baseline justify-between px-1 mb-2">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                Category Breakdown
              </h2>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
                {categories.length} allocated celebration streams
              </p>
            </div>
            <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Deterministic Sync
            </span>
          </div>

          {/* Category Rows */}
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const plannedNum = Number(cat.planned);
              const committedNum = Number(cat.committed);
              const progress = calculatePercentage(committedNum, plannedNum);

              const isNearLimit = cat.status === 'near_limit' || (progress >= 90 && progress < 100);
              const isOver = cat.status === 'over_budget' || progress >= 100;
              const isUnused = cat.status === 'unused' || committedNum === 0;

              return (
                <div
                  key={cat.id}
                  className="group relative flex items-center justify-between min-h-[76px] px-5 sm:px-6 py-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md hover:bg-surface-container-lowest transition-all duration-300 shadow-xs hover:shadow-md border border-primary/5"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-sm sm:text-base font-semibold text-on-surface truncate">
                          {cat.name}
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-semibold text-primary">
                          {formatLakh(committedNum)}{' '}
                          <span className="font-normal text-on-surface-variant">
                            / {formatLakh(plannedNum)}
                          </span>
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOver ? 'bg-secondary' : isNearLimit ? 'bg-tertiary-fixed-dim' : 'bg-primary-container'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isOver
                          ? 'bg-error-container text-error'
                          : isNearLimit
                          ? 'bg-amber-100 text-amber-900'
                          : isUnused
                          ? 'bg-surface-container text-on-surface-variant'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOver ? 'bg-error' : isNearLimit ? 'bg-amber-500' : isUnused ? 'bg-outline' : 'bg-success'
                        }`}
                      />
                      <span className="hidden sm:inline capitalize">
                        {isOver ? 'Over budget' : isNearLimit ? 'Near limit' : isUnused ? 'Unused' : 'Optimal'}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: AI Concierge Card */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
          {!recommendationDismissed && (
            <div
              className={`relative rounded-3xl p-6 sm:p-7 bg-surface-container-lowest/90 backdrop-blur-2xl shadow-lg border border-primary/10 transition-all duration-300 ${
                recommendationApplied ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-tertiary-container animate-spin" style={{ animationDuration: '9s' }} />
                <span className="font-sans text-xs uppercase tracking-wider text-tertiary-container font-semibold">
                  AI Recommendation
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-primary mb-2">
                Save ₹45,000 on Décor
              </h3>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                Consolidate evening banquet lighting and floral staging with the venue&apos;s in-house vendor partner
                to trim ₹45,000 off Décor and add it directly to your unallocated buffer.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  disabled={recommendationApplied}
                  className={`flex-1 h-10 px-5 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    recommendationApplied
                      ? 'bg-success text-on-primary'
                      : 'bg-primary-container text-on-primary hover:bg-primary shadow-sm'
                  }`}
                >
                  <span>{recommendationApplied ? 'Applied' : 'Apply'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRecommendationDismissed(true)}
                  className="h-10 px-5 rounded-full bg-surface-container-high/60 text-on-surface-variant font-sans text-xs sm:text-sm font-medium hover:bg-surface-container-highest transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Sync Note */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-surface-container-low/70 text-on-surface-variant border border-primary/5">
            <RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="font-sans text-xs leading-normal">
              Your budget automatically syncs with vendor payment milestones and contracted schedules.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
