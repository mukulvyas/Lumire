'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function ActiveEventBanner() {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeEventTitle, setActiveEventTitle] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedId = localStorage.getItem('lumiere_last_event_id');
      const storedTitle = localStorage.getItem('lumiere_last_event_title');
      if (storedId) {
        setActiveEventId(storedId);
        setActiveEventTitle(storedTitle || 'Royal Palace Heritage Wedding');
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  if (!activeEventId) return null;

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-4 sm:p-5 rounded-3xl bg-surface-container-lowest/90 backdrop-blur-xl border border-primary/20 shadow-[0_12px_36px_-6px_rgba(91,42,134,0.12)] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary-container/20 text-primary flex items-center justify-center shrink-0 border border-primary/10">
          <Sparkles className="w-5 h-5 fill-primary" />
        </div>
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Celebration</span>
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-on-surface truncate mt-0.5">
            {activeEventTitle}
          </h3>
        </div>
      </div>

      <Link
        href={`/events/${activeEventId}`}
        className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-sans text-xs sm:text-sm font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
        id="home-resume-event-btn"
      >
        <span>Resume</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
