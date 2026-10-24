'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Sparkles, User } from 'lucide-react';
import { EVENT_NAV_ITEMS } from '@/config/nav';
import { UI_COPY } from '@/config/copy';
import { cn } from '@/lib/utils';
import { SavePlanModal } from '@/features/auth/components/SavePlanModal';

interface TopNavProps {
  onSignInClick?: () => void;
}

export function TopNav({ onSignInClick }: TopNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const eventId = params?.id as string | undefined;
  const [internalModalOpen, setInternalModalOpen] = React.useState(false);

  const handleSignIn = onSignInClick || (() => setInternalModalOpen(true));

  const isEventRoute = Boolean(eventId && pathname.includes('/events/'));

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-primary/10 transition-colors">
      <div className="h-20 max-w-[1160px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo linking to Home */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group"
          id="nav-logo"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-primary text-primary" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">
            {UI_COPY.brand.name}
          </span>
        </Link>

        {/* Center Tabs: Only rendered inside an event view */}
        {isEventRoute && eventId ? (
          <nav
            className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-surface-container-low/70 border border-primary/10"
            id="event-nav-tabs"
            role="navigation"
            aria-label="Event Sections"
          >
            {EVENT_NAV_ITEMS.map((item) => {
              const href = item.href(eventId);
              const isActive =
                item.segment === ''
                  ? pathname === href
                  : pathname.startsWith(href);

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    'px-5 py-2 rounded-full font-sans text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold px-3 py-1 rounded-full bg-primary-fixed/40">
              {UI_COPY.brand.aiPlannerBadge}
            </span>
          </div>
        )}

        {/* Right: Sign in & Avatar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSignIn}
            className="font-sans text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            id="nav-sign-in-btn"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant border border-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95 cursor-pointer"
            id="nav-user-profile-btn"
            aria-label="User account"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SavePlanModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
      />
    </header>
  );
}
