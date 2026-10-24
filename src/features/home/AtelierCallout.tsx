'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { UI_COPY } from '@/config/copy';
import { calculatePercentage } from '@/lib/formatters';

export function AtelierCallout() {
  const sampleTarget = 1500000;
  const sampleAllocated = 1480000;
  const percentAllocated = calculatePercentage(sampleAllocated, sampleTarget);

  return (
    <section className="relative z-10 my-12 rounded-[28px] overflow-hidden bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container p-8 md:p-12 border border-primary/10 shadow-[0_12px_36px_rgba(91,42,134,0.04)] w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Guarantee */}
        <div className="md:col-span-7">
          <span className="font-sans text-xs uppercase tracking-widest text-primary/70 mb-2 block font-semibold">
            Quality Guarantee
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-on-surface font-bold mb-3">
            {UI_COPY.home.guaranteeTitle}
          </h3>
          <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-[520px] mb-6 leading-relaxed">
            {UI_COPY.home.guaranteeText}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-sans text-sm text-on-surface font-medium">
                Verified regional suppliers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-sans text-sm text-on-surface font-medium">
                Real-time budget ledger
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-sans text-sm text-on-surface font-medium">
                Seamless guest RSVP
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Plan Micro-Card */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-72 h-52 rounded-2xl bg-surface-container-high/60 border border-primary/10 p-5 flex flex-col justify-between backdrop-blur-md shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-primary font-semibold uppercase tracking-wider">
                Live Blueprint Preview
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="font-serif text-lg text-on-surface font-bold">
                Grand Pavilion Celebration
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-0.5">
                {percentAllocated}% Allocated • 6 Streams
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentAllocated}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-sans text-on-surface-variant">
              <span>22 Tasks scheduled</span>
              <span className="text-primary font-semibold">3 upcoming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
