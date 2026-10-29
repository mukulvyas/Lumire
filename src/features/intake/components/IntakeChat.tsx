'use client';

import React, { useState } from 'react';
import { EventBrief } from '@/server/ai/schemas/eventBrief';
import { formatCurrency, formatLakh } from '@/lib/formatters';
import { Sparkles, Calendar, Users, IndianRupee, MapPin, Tag } from 'lucide-react';

interface IntakeChatProps {
  initialBrief: EventBrief;
  onGenerate: (updatedBrief: EventBrief) => void;
  isSubmitting?: boolean;
}

export function IntakeChat({ initialBrief, onGenerate, isSubmitting = false }: IntakeChatProps) {
  const [brief, setBrief] = useState<EventBrief>(initialBrief);

  const POPULAR_DESTINATIONS = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Goa', 'Hyderabad', 'Udaipur'];

  const THEME_OPTIONS = [
    'Royal Heritage',
    'Modern Minimalist',
    'Garden Bohemia',
    'Vintage Sunset',
    'Contemporary Chic',
    'Traditional Festive',
  ];

  function handleTypeChange(type: 'wedding' | 'birthday' | 'community') {
    setBrief((prev) => ({
      ...prev,
      type,
      title: prev.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Celebration`,
    }));
  }

  function handleThemeToggle(theme: string) {
    setBrief((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: prev.preferences?.theme === theme ? undefined : theme,
      },
    }));
  }

  function handleQuickDate(monthsInFuture: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsInFuture);
    const dateStr = d.toISOString().split('T')[0];
    setBrief((prev) => ({ ...prev, event_date: dateStr }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate(brief);
  }

  return (
    <div className="w-full max-w-[820px] mx-auto py-8 px-4 sm:px-6">
      {/* Atelier AI Assistant Introduction Bubble */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-6 h-6 text-tertiary-fixed" />
        </div>
        <div className="flex-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-5 border border-primary/15 shadow-sm text-on-surface">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-primary font-sans text-sm">Lumière AI Atelier</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Intake Ready
            </span>
          </div>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-on-surface">
            I’ve synthesized your celebration concept! Review the key details below or fine-tune your guest count,
            budget, and date before we allocate your budget and build your timeline.
          </p>

          {brief.clarifying_questions && brief.clarifying_questions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10 space-y-1.5">
              <span className="text-xs font-semibold text-primary-container uppercase tracking-wider block">
                Clarifications:
              </span>
              {brief.clarifying_questions.map((q, i) => (
                <p key={i} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />
                  {q}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Brief Card */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-primary/15 shadow-lg space-y-6">
        {/* Celebration Title & Type */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Celebration Name
          </label>
          <input
            type="text"
            value={brief.title}
            onChange={(e) => setBrief((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full text-xl sm:text-2xl font-serif font-bold text-on-surface bg-surface-container-low/60 border border-primary/15 rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            required
            id="intake-event-title-input"
          />
        </div>

        {/* Celebration Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Event Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['wedding', 'birthday', 'community'] as const).map((type) => {
              const isSelected = brief.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-low/70 text-on-surface border-primary/10 hover:border-primary/30'
                  }`}
                >
                  {type === 'community' ? 'Community Mela' : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Event Date
            </label>
            <div className="flex items-center gap-1 text-[11px] text-primary">
              <span>Quick pick:</span>
              <button
                type="button"
                onClick={() => handleQuickDate(3)}
                className="hover:underline px-1 py-0.5 rounded cursor-pointer"
              >
                +3 mo
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDate(6)}
                className="hover:underline px-1 py-0.5 rounded cursor-pointer"
              >
                +6 mo
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDate(12)}
                className="hover:underline px-1 py-0.5 rounded cursor-pointer"
              >
                +1 yr
              </button>
            </div>
          </div>
          <input
            type="date"
            value={brief.event_date}
            onChange={(e) => setBrief((prev) => ({ ...prev, event_date: e.target.value }))}
            className="w-full text-sm font-sans font-medium text-on-surface bg-surface-container-low/60 border border-primary/15 rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
            required
            id="intake-event-date-input"
          />
        </div>

        {/* City / Destination */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            Destination / Location
          </label>
          <input
            type="text"
            value={brief.city}
            onChange={(e) => setBrief((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="City or destination venue..."
            className="w-full text-sm font-sans font-medium text-on-surface bg-surface-container-low/60 border border-primary/15 rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-surface-container-lowest transition-all mb-2.5"
            required
            id="intake-event-city-input"
          />
          <div className="flex flex-wrap gap-2">
            {POPULAR_DESTINATIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setBrief((prev) => ({ ...prev, city }))}
                className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  brief.city.toLowerCase() === city.toLowerCase()
                    ? 'bg-primary-fixed text-primary font-semibold border-primary/30'
                    : 'bg-surface-container-low/80 text-on-surface-variant border-primary/10 hover:border-primary/30'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Target Stepper & Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              Target Guest Count
            </label>
            <span className="font-mono text-base font-bold text-primary">
              {brief.guest_target} guests
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={800}
            step={10}
            value={brief.guest_target}
            onChange={(e) => setBrief((prev) => ({ ...prev, guest_target: Number(e.target.value) }))}
            className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
            id="intake-guest-count-range"
          />
          <div className="flex justify-between text-[11px] text-on-surface-variant/70 mt-1">
            <span>20 intimate</span>
            <span>250 grand</span>
            <span>800+ lavish</span>
          </div>
        </div>

        {/* Total Budget Slider with Lakh Formatting */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-primary" />
              Total Celebration Budget
            </label>
            <div className="text-right">
              <span className="font-serif text-lg font-bold text-primary mr-1.5">
                {formatLakh(brief.total_budget)}
              </span>
              <span className="text-xs text-on-surface-variant">
                ({formatCurrency(brief.total_budget, 'INR', 'en-IN')})
              </span>
            </div>
          </div>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={50000}
            value={brief.total_budget}
            onChange={(e) => setBrief((prev) => ({ ...prev, total_budget: Number(e.target.value) }))}
            className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
            id="intake-budget-range"
          />
          <div className="flex justify-between text-[11px] text-on-surface-variant/70 mt-1">
            <span>{formatLakh(100000)}</span>
            <span>{formatLakh(2500000)}</span>
            <span>{formatLakh(10000000)}</span>
          </div>
        </div>

        {/* Style & Theme Preference Chips */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-primary" />
            Style & Theme Preference
          </label>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = brief.preferences?.theme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleThemeToggle(theme)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-secondary-container text-on-secondary font-semibold border-secondary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant border-primary/10 hover:border-primary/30'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action Container */}
        <div className="pt-4 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-on-surface-variant">
            Deterministic math • Real-world price benchmarks • 100% editable
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-13 px-8 rounded-full font-sans text-sm font-semibold text-on-primary bg-gradient-to-r from-primary-container to-primary flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
            id="intake-generate-plan-btn"
          >
            <span>Generate Complete Plan</span>
            <Sparkles className="w-4 h-4 text-tertiary-fixed fill-tertiary-fixed" />
          </button>
        </div>
      </form>
    </div>
  );
}
