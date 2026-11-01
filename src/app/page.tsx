import React from 'react';
import { HeroPromptBar } from '@/features/home/HeroPromptBar';
import { ActiveEventBanner } from '@/features/home/ActiveEventBanner';
import { CelebrationCards } from '@/features/home/CelebrationCards';
import { HowItWorksSection } from '@/features/home/HowItWorksSection';
import { AtelierCallout } from '@/features/home/AtelierCallout';
import { UI_COPY } from '@/config/copy';
import { Sparkles } from 'lucide-react';
   
export default function HomePage() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* Drifting Ambient Mesh Gradient Background (from Stitch) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[720px] pointer-events-none opacity-60 z-0">
        <div className="absolute w-[520px] h-[520px] -top-10 left-10 rounded-full bg-[#FFE5D9] mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute w-[480px] h-[480px] top-12 right-16 rounded-full bg-[#FFDDE1] mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute w-[500px] h-[500px] top-44 left-1/3 rounded-full bg-[#E8D7F1] mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute w-[440px] h-[440px] top-64 right-1/4 rounded-full bg-[#FFF2D1] mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-[1160px] mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* ================= SECTION 1: HERO ================= */}
        <section className="pt-12 pb-20 md:pt-16 md:pb-24 text-center flex flex-col items-center w-full">
          {/* AI Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md shadow-xs border border-primary/15 mb-6 transition-all hover:bg-white hover:border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed-dim fill-tertiary-fixed-dim" />
            <span className="font-sans text-xs uppercase tracking-widest text-primary-container font-semibold">
              {UI_COPY.brand.aiPlannerBadge}
            </span>  
          </div> 

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl.  md:text-6xl leading-[1.1] tracking-tight text-on-surface max-w-[860px] mx-auto mb-4 font-bold">
            Plan any celebration,{' '}
            <span className="italic font-normal text-primary">beautifully.</span>
          </h1>

          {/* Subtext */}
          <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-[680px] mx-auto mb-8 leading-relaxed">
            {UI_COPY.brand.subtext}
          </p>

          {/* Active Celebration Resume Banner */}
          <ActiveEventBanner />

          {/* Prompt Bar with Mic & Chips */}
          <HeroPromptBar />
        </section>

        {/* ================= SECTION 2: CELEBRATION TYPES ================= */}
        <CelebrationCards />

        {/* ================= SECTION 3: HOW IT WORKS ================= */}
        <HowItWorksSection />

        {/* ================= SECTION 4: CALLOUT ================= */}
        <AtelierCallout />
      </div>
    </div>
  );
}
