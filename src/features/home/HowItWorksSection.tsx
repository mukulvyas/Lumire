'use client';

import React from 'react';
import { UI_COPY } from '@/config/copy';

export function HowItWorksSection() {
  return (
    <section className="relative z-10 py-16 md:py-24 w-full">
      <div className="text-center max-w-[600px] mx-auto mb-16">
        <span className="font-sans text-xs uppercase tracking-widest text-primary/70 mb-2 block font-semibold">
          Effortless Flow
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-on-surface tracking-tight font-bold">
          {UI_COPY.home.howItWorksTitle}
        </h2>
      </div>

      {/* 3 Steps in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting delicate hairline (desktop only) */}
        <div className="hidden md:block absolute top-[44px] left-[16%] right-[16%] h-[1px] bg-primary/10 pointer-events-none -z-0" />

        {UI_COPY.home.steps.map((step, idx) => {
          const numberColor =
            idx === 0
              ? 'bg-primary/5 border-primary/10 text-primary'
              : idx === 1
              ? 'bg-tertiary-fixed/40 border-tertiary-fixed-dim/30 text-tertiary'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800';

          return (
            <div
              key={step.number}
              className="flex flex-col items-start relative z-10 p-6 rounded-2xl bg-surface-container-lowest/50 border border-primary/5 hover:bg-surface-container-lowest/80 transition-all shadow-xs"
            >
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 shadow-xs font-serif text-xl font-bold ${numberColor}`}
              >
                {step.number}
              </div>
              <h3 className="font-serif text-xl text-on-surface mb-2 font-bold">
                {step.title}
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
