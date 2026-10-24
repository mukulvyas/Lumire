'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { UI_COPY } from '@/config/copy';

export function CelebrationCards() {
  return (
    <section className="relative z-10 py-16 md:py-24 w-full">
      <div className="text-center max-w-[640px] mx-auto mb-14">
        <span className="font-sans text-xs uppercase tracking-widest text-primary/70 mb-2 block font-semibold">
          Curated Blueprint
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-on-surface mb-3 tracking-tight font-bold">
          {UI_COPY.home.celebrationHeadline}
        </h2>
        <p className="font-sans text-base text-on-surface-variant">
          {UI_COPY.home.celebrationSubtext}
        </p>
      </div>

      {/* 3 Celebration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Wedding */}
        <Link
          href="/new?type=wedding"
          className="bg-surface-container-lowest/80 backdrop-blur-md border border-primary/10 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(91,42,134,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(91,42,134,0.12)] transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[360px]"
        >
          <div>
            {/* SVG Art: Champagne Flutes & Floral Arch */}
            <div className="w-full h-24 rounded-2xl bg-surface-container-low/60 flex items-center justify-center mb-6 overflow-hidden relative">
              <svg className="w-40 h-20 transition-transform duration-500 group-hover:scale-105" fill="none" viewBox="0 0 160 80">
                <path d="M40 70C40 38 60 18 80 18C100 18 120 38 120 70" stroke="#E8D7F1" strokeDasharray="2 3" strokeWidth="1.5" />
                <circle cx="80" cy="18" fill="#F5B94A" fillOpacity="0.8" r="4" />
                <path d="M72 48L80 40L88 48L80 56Z" fill="#5B2A86" fillOpacity="0.08" stroke="#5B2A86" strokeWidth="1.2" />
                <circle cx="68" cy="34" fill="#FFDDE1" r="2.5" />
                <circle cx="92" cy="34" fill="#FFDDE1" r="2.5" />
                <path d="M74 46L70 66M66 66H74" stroke="#5B2A86" strokeLinecap="round" strokeWidth="1.2" />
                <path d="M74 46C74 38 70 34 70 34C70 34 66 38 66 46H74Z" fill="#FFDDE1" fillOpacity="0.5" stroke="#5B2A86" strokeWidth="1.2" />
                <path d="M86 46L90 66M86 66H94" stroke="#5B2A86" strokeLinecap="round" strokeWidth="1.2" />
                <path d="M86 46C86 38 90 34 90 34C90 34 94 38 94 46H86Z" fill="#F5B94A" fillOpacity="0.4" stroke="#5B2A86" strokeWidth="1.2" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">Wedding</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Timelines, multi-day itinerary, guest lists, and curated vendors in one serene space.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-primary/5">
            <span className="font-sans text-sm text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
              Start Wedding Plan <ArrowRight className="w-4 h-4" />
            </span>
            <span className="font-sans text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
              Bespoke
            </span>
          </div>
        </Link>

        {/* Card 2: Birthday */}
        <Link
          href="/new?type=birthday"
          className="bg-surface-container-lowest/80 backdrop-blur-md border border-primary/10 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(91,42,134,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(91,42,134,0.12)] transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[360px]"
        >
          <div>
            {/* SVG Art: Tier Cake & Candle Glow */}
            <div className="w-full h-24 rounded-2xl bg-surface-container-low/60 flex items-center justify-center mb-6 overflow-hidden relative">
              <svg className="w-40 h-20 transition-transform duration-500 group-hover:scale-105" fill="none" viewBox="0 0 160 80">
                <rect fill="#FFE5D9" height="18" rx="4" stroke="#FF6B6B" strokeWidth="1.2" width="44" x="58" y="50" />
                <rect fill="#FFF2D1" height="14" rx="3" stroke="#F5B94A" strokeWidth="1.2" width="28" x="66" y="36" />
                <line stroke="#5B2A86" strokeLinecap="round" strokeWidth="1.5" x1="80" x2="80" y1="36" y2="28" />
                <circle cx="80" cy="24" fill="#FF6B6B" r="3" />
                <circle cx="80" cy="24" fill="#F5B94A" fillOpacity="0.35" r="6" />
                <circle cx="50" cy="30" fill="#FF6B6B" r="1.5" />
                <circle cx="110" cy="32" fill="#F5B94A" r="1.5" />
                <circle cx="44" cy="52" fill="#5B2A86" fillOpacity="0.4" r="2" />
                <circle cx="116" cy="50" fill="#3DDC97" fillOpacity="0.6" r="2" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">Birthday</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Intimate dinners to milestone galas with curated themes, playlists, and custom menus.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-primary/5">
            <span className="font-sans text-sm text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
              Start Birthday Plan <ArrowRight className="w-4 h-4" />
            </span>
            <span className="font-sans text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
              Milestone
            </span>
          </div>
        </Link>

        {/* Card 3: Community Gathering */}
        <Link
          href="/new?type=community"
          className="bg-surface-container-lowest/80 backdrop-blur-md border border-primary/10 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(91,42,134,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(91,42,134,0.12)] transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[360px]"
        >
          <div>
            {/* SVG Art: Festoon Wire & Lanterns */}
            <div className="w-full h-24 rounded-2xl bg-surface-container-low/60 flex items-center justify-center mb-6 overflow-hidden relative">
              <svg className="w-40 h-20 transition-transform duration-500 group-hover:scale-105" fill="none" viewBox="0 0 160 80">
                <path d="M30 26Q80 44 130 26" stroke="#5B2A86" strokeOpacity="0.4" strokeWidth="1" />
                <circle cx="54" cy="34" fill="#F5B94A" r="4.5" />
                <circle cx="54" cy="34" fill="#F5B94A" fillOpacity="0.25" r="8" />
                <line stroke="#5B2A86" strokeWidth="1" x1="54" x2="54" y1="38.5" y2="43" />
                <circle cx="80" cy="37" fill="#3DDC97" r="5.5" />
                <circle cx="80" cy="37" fill="#3DDC97" fillOpacity="0.25" r="10" />
                <line stroke="#5B2A86" strokeWidth="1" x1="80" x2="80" y1="42.5" y2="48" />
                <circle cx="106" cy="34" fill="#F5B94A" r="4.5" />
                <circle cx="106" cy="34" fill="#F5B94A" fillOpacity="0.25" r="8" />
                <line stroke="#5B2A86" strokeWidth="1" x1="106" x2="106" y1="38.5" y2="43" />
                <rect fill="#5B2A86" fillOpacity="0.12" height="6" rx="2" width="68" x="46" y="58" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">Community Event</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Society festivals, charity fundraisers, and neighborhood gatherings made effortless.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-primary/5">
            <span className="font-sans text-sm text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
              Start Community Plan <ArrowRight className="w-4 h-4" />
            </span>
            <span className="font-sans text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
              Gathering
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
