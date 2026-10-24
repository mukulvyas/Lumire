'use client';

import React, { useState } from 'react';
import { ideas } from '@/server/db/schema';
import { formatLakh } from '@/lib/formatters';
import {
  Sparkles,
  Heart,
  Plus,
  Check,
  PiggyBank,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

interface IdeasGridProps {
  eventId: string;
  eventTitle: string;
  eventCity: string;
  totalBudget: number;
  initialIdeas: (typeof ideas.$inferSelect)[];
}

const IDEA_KIND_LABELS: Record<string, string> = {
  theme: 'Theme',
  menu: 'Menu',
  decor: 'Décor',
  entertainment: 'Entertainment',
  invitations: 'Invitations',
  gifts: 'Favors',
};

export function IdeasGrid({
  eventId: _eventId,
  eventTitle,
  eventCity,
  totalBudget,
  initialIdeas,
}: IdeasGridProps) {
  const [ideasList, setIdeasList] = useState(initialIdeas);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const categories = ['all', 'theme', 'menu', 'decor', 'entertainment', 'gifts'];

  const filteredIdeas = ideasList.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.kind.toLowerCase() === activeFilter.toLowerCase();
  });

  async function toggleFavorite(ideaId: string) {
    const target = ideasList.find((i) => i.id === ideaId);
    if (!target) return;

    const newSaved = !target.saved;
    setIdeasList((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, saved: newSaved } : i))
    );

    try {
      await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved: newSaved }),
      });
    } catch (err) {
      console.error('Failed to toggle idea favorite:', err);
    }
  }

  async function handleAddToPlan(ideaId: string) {
    setAddedIds((prev) => new Set(prev).add(ideaId));

    try {
      await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addToPlan: true }),
      });
    } catch (err) {
      console.error('Failed to add idea to plan:', err);
    }
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-fixed/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-sans text-xs uppercase tracking-widest text-primary font-semibold">
              Atelier Curated Concepts
            </span>
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
              Curated Celebration Ideas
            </h1>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl">
              Handpicked concepts tailored to your {formatLakh(totalBudget)} celebration budget and {eventCity} setting for {eventTitle}.
            </p>
          </div>
        </div>

        {/* Micro-Badge Context */}
        <div className="flex items-center gap-3 bg-surface-container-lowest/80 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-xs border border-primary/10 self-start md:self-auto shrink-0">
          <Compass className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-sans text-[11px] text-on-surface-variant uppercase font-semibold">Destination</span>
            <span className="font-sans text-xs font-bold text-on-surface">{eventCity}</span>
          </div>
          <div className="w-px h-6 bg-surface-container-high mx-1" />
          <div className="flex flex-col">
            <span className="font-sans text-[11px] text-on-surface-variant uppercase font-semibold">Target Cap</span>
            <span className="font-sans text-xs font-bold text-primary">{formatLakh(totalBudget)}</span>
          </div>
        </div>
      </header>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4 pb-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest/80 text-on-surface-variant hover:text-primary hover:bg-surface-container border border-primary/10'
                }`}
              >
                {cat === 'all' ? 'All Ideas' : IDEA_KIND_LABELS[cat] || cat}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-on-surface-variant font-sans text-xs font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-tertiary-container" />
          <span>Showing {filteredIdeas.length} curated inspirations</span>
        </div>
      </div>

      {/* 3-Column Core Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {filteredIdeas.map((idea) => {
          const isFavorited = idea.saved;
          const isAdded = addedIds.has(idea.id);

          return (
            <article
              key={idea.id}
              className="group flex flex-col bg-surface-container-lowest/80 backdrop-blur-2xl rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 border border-primary/10"
            >
              {/* Media Container */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-fixed/40 via-surface-container-high to-tertiary-fixed/40 flex items-center justify-center">
                {idea.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={idea.image_url}
                    alt={idea.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                )}

                {/* Kind Badge */}
                <div className="absolute top-3.5 left-3.5 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs">
                  <span className="font-sans text-[11px] uppercase tracking-wider text-primary font-bold">
                    {IDEA_KIND_LABELS[idea.kind] || idea.kind}
                  </span>
                </div>

                {/* Concierge Top Pick Badge */}
                <div className="absolute top-3.5 right-3.5 bg-tertiary-container/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-tertiary-fixed fill-tertiary-fixed" />
                  <span className="font-sans text-[10px] font-semibold">Atelier Pick</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 pt-4">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-primary tracking-tight leading-snug">
                  {idea.title}
                </h2>

                {/* Cost Saving / Rationale Box */}
                <div className="flex items-start gap-2.5 mt-3 mb-5 bg-surface-container-low/70 p-3 rounded-2xl border border-primary/5">
                  <PiggyBank className="w-4 h-4 text-tertiary-container shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    {idea.reason}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-2 flex items-center justify-between gap-3 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(idea.id)}
                    aria-label="Save idea to favorites"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isFavorited
                        ? 'bg-secondary-fixed text-secondary'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-secondary'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-secondary' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToPlan(idea.id)}
                    disabled={isAdded}
                    className={`flex-1 h-10 px-4 rounded-full font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-success text-on-primary'
                        : 'bg-primary-container text-on-primary hover:bg-primary shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
