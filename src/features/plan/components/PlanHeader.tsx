'use client';

import React from 'react';
import Link from 'next/link';
import { formatLakh } from '@/lib/formatters';
import { Sparkles, Download, Calendar, MapPin, Users, IndianRupee } from 'lucide-react';

interface PlanHeaderProps {
  eventId: string;
  title: string;
  type: string;
  eventDate: string;
  city: string;
  guestTarget: number;
  totalBudget: number;
}

export function PlanHeader({
  eventId,
  title,
  type,
  eventDate,
  city,
  guestTarget,
  totalBudget,
}: PlanHeaderProps) {
  // Format readable date e.g. "14 Feb 2027"
  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 pt-4">
      <div className="space-y-3">
        {/* Status Pill Badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-sans text-xs uppercase tracking-widest font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="capitalize">{type}</span>
          </span>
          <span className="text-xs text-on-surface-variant font-medium">Active Curation</span>
        </div>

        {/* Dynamic Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
          {title}
        </h1>

        {/* Event Metadata Line */}
        <div className="font-sans text-sm sm:text-base text-on-surface-variant flex items-center flex-wrap gap-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            {formattedDate}
          </span>
          <span className="text-outline-variant font-serif">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            {city}
          </span>
          <span className="text-outline-variant font-serif">•</span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary shrink-0" />
            {guestTarget} guests
          </span>
          <span className="text-outline-variant font-serif">•</span>
          <span className="flex items-center gap-1 font-semibold text-on-surface">
            <IndianRupee className="w-4 h-4 text-primary shrink-0" />
            {formatLakh(totalBudget)}
          </span>
        </div>
      </div>

      {/* Top Right Action Cluster */}
      <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
        <a
          href={`/api/export/pdf?eventId=${eventId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-surface-container-lowest text-primary font-sans text-sm font-semibold shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all active:scale-95 border border-primary/10"
          id="plan-export-pdf-btn"
        >
          <Download className="w-4 h-4 text-primary/80 transition-transform group-hover:-translate-y-0.5" />
          <span>Export PDF</span>
        </a>

        <Link
          href={`/events/${eventId}/assistant`}
          className="group inline-flex items-center gap-2.5 h-12 px-7 rounded-full bg-primary-container text-on-primary font-sans text-sm font-semibold shadow-md shadow-primary-container/20 hover:brightness-110 hover:shadow-lg transition-all active:scale-95"
          id="plan-ask-ai-edit-btn"
        >
          <Sparkles className="w-4 h-4 text-tertiary-fixed transition-transform group-hover:rotate-12" />
          <span>Ask AI to edit</span>
        </Link>
      </div>
    </section>
  );
}
