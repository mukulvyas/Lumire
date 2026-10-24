'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Sparkles } from 'lucide-react';
import { UI_COPY } from '@/config/copy';

export function HeroPromptBar() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);

  const EXAMPLE_CHIPS = [
    { label: 'Royal Wedding Celebration', value: '150-guest royal wedding celebration in February, ₹15 lakh budget' },
    { label: '50th Birthday Party', value: '50th milestone birthday party with cocktail lounge & 60s jazz quintet, 80 guests' },
    { label: 'Community Festival Mela', value: 'Society Diwali mela with artisanal food stalls, light installations & 400 attendees' },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = prompt.trim();
    if (!query) return;

    // Navigate to intake flow with prompt in search params
    router.push(`/new?prompt=${encodeURIComponent(query)}`);
  }

  function handleVoiceClick() {
    setIsListening((prev) => !prev);
    if (!prompt) {
      setPrompt('150-guest celebration with bespoke catering and live acoustic ensemble');
    }
  }

  return (
    <div className="w-full max-w-[840px] mx-auto flex flex-col items-center">
      {/* Large Glass Prompt Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full h-[72px] rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-primary/15 shadow-[0_12px_40px_rgba(91,42,134,0.08)] px-3.5 flex items-center gap-3 transition-all duration-300 focus-within:shadow-[0_16px_48px_rgba(91,42,134,0.16)] focus-within:border-primary/40 focus-within:bg-surface-container-lowest"
        id="home-prompt-form"
      >
        {/* Mic Button */}
        <button
          type="button"
          onClick={handleVoiceClick}
          aria-label="Voice input"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isListening ? 'text-secondary bg-secondary-fixed/50' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
          id="home-mic-btn"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Input Field */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={UI_COPY.home.promptPlaceholder}
          className="font-sans text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/60 outline-none flex-1 bg-transparent min-w-0"
          id="home-event-prompt-input"
        />

        {/* Submit Action Button */}
        <button
          type="submit"
          className="h-[52px] rounded-full px-6 sm:px-7 font-sans text-sm font-semibold text-on-primary bg-gradient-to-r from-primary-container to-primary flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(91,42,134,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 cursor-pointer"
          id="home-create-plan-submit-btn"
        >
          <span>{UI_COPY.home.submitButton}</span>
          <Sparkles className="w-4 h-4 text-tertiary-fixed fill-tertiary-fixed" />
        </button>
      </form>

      {/* Suggestion Chips Below Prompt Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setPrompt(chip.value)}
            className="px-4 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm border border-primary/10 font-sans text-xs font-medium text-primary hover:bg-surface-container-lowest hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer shadow-xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* No Sign-up helper note */}
      <p className="text-xs text-on-surface-variant/80 mt-3.5 font-sans select-none">
        {UI_COPY.brand.noSignupNeeded}
      </p>
    </div>
  );
}
