'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { UI_COPY } from '@/config/copy';

export function AskAIFab() {
  const params = useParams();
  const pathname = usePathname();
  const eventId = params?.id as string | undefined;

  // Don't show FAB on the assistant page itself to prevent redundancy
  if (pathname.includes('/assistant')) {
    return null;
  }

  const destination = eventId ? `/events/${eventId}/assistant` : '/new';

  return (
    <div
      className="fixed z-40 right-6 bottom-20 md:bottom-6 transition-all duration-300"
      id="ask-ai-fab-container"
    >
      <Link
        href={destination}
        className="group flex items-center gap-2.5 h-12 md:h-14 px-5 md:px-6 rounded-full bg-gradient-to-r from-primary-container to-primary text-on-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        id="ask-ai-fab"
        aria-label="Ask AI Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed fill-tertiary-fixed" />
        </div>
        <span className="font-sans text-sm md:text-base font-semibold tracking-wide">
          {UI_COPY.fab.askAi}
        </span>
      </Link>
    </div>
  );
}
