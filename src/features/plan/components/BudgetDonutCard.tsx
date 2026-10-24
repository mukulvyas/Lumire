'use client';

import React from 'react';
import Link from 'next/link';
import { budgetCategories } from '@/server/db/schema';
import { formatLakh } from '@/lib/formatters';
import { ArrowRight } from 'lucide-react';

interface BudgetDonutCardProps {
  eventId: string;
  totalBudget: number;
  committedBudget: number;
  categories: (typeof budgetCategories.$inferSelect)[];
}

const CATEGORY_COLORS = [
  '#5B2A86', // Royal Plum
  '#F5B94A', // Champagne Gold
  '#FF6B6B', // Coral Blossom
  '#9B6EC9', // Lavender Accent
  '#3DDC97', // Mint Leaf
  '#F9BC4D', // Warm Amber
  '#DFB7FF', // Soft Lilac
  '#7D7481', // Neutral Slate
];

export function BudgetDonutCard({
  eventId,
  totalBudget,
  committedBudget,
  categories,
}: BudgetDonutCardProps) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  // Calculate slice offset and length for each category
  let accumulatedLength = 0;
  const segments = categories.map((cat, i) => {
    const planned = Number(cat.planned);
    const ratio = totalBudget > 0 ? planned / totalBudget : 0;
    const length = ratio * circumference;
    const offset = -accumulatedLength;
    accumulatedLength += length;
    const percent = Math.round(ratio * 1000) / 10; // 1 decimal place

    return {
      id: cat.id,
      name: cat.name,
      planned,
      percent,
      length,
      offset,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    };
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between px-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Budget at a glance
        </h2>
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Allocated Total
        </span>
      </div>

      {/* Main Glassmorphic Container */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] border border-primary/5 flex flex-col items-center">
        {/* Dynamic SVG Donut Chart */}
        <div className="relative w-56 h-56 flex items-center justify-center my-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track Circle */}
            <circle
              className="text-surface-container"
              cx="50"
              cy="50"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
            />

            {/* Segments */}
            {segments.map((seg) => (
              <circle
                key={seg.id}
                className="transition-all duration-700 ease-out"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={`${seg.length} ${circumference}`}
                strokeDashoffset={seg.offset}
              />
            ))}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-tight">
              {formatLakh(committedBudget)}
            </span>
            <span className="font-sans text-xs text-on-surface-variant">
              of {formatLakh(totalBudget)}
            </span>
          </div>
        </div>

        {/* Legend Items */}
        <div className="w-full space-y-3 pt-4 border-t border-surface-container">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="flex items-center justify-between text-xs sm:text-sm font-sans"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-on-surface truncate font-medium">{seg.name}</span>
              </div>
              <span className="text-on-surface-variant font-medium shrink-0 ml-2">
                {seg.percent}% • {formatLakh(seg.planned)}
              </span>
            </div>
          ))}
        </div>

        {/* View Budget Link */}
        <div className="w-full pt-6 mt-4 border-t border-surface-container">
          <Link
            href={`/events/${eventId}/budget`}
            className="inline-flex items-center gap-2 font-sans text-sm text-primary-container font-semibold hover:gap-3 transition-all"
            id="plan-view-full-budget-link"
          >
            <span>View budget</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
