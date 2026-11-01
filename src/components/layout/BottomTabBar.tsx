'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  CalendarDays,
  CircleDollarSign,
  Users,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { EVENT_NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

const ICONS = {
  Plan: CalendarDays,
  Budget: CircleDollarSign,
  Guests: Users,
  Vendors: Briefcase,
  Ideas: Sparkles,
};

export function BottomTabBar() {
  const pathname = usePathname();
  const params = useParams();
  const eventId = params?.id as string | undefined;

  if (!eventId || !pathname.includes('/events/')) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-primary/15 px-2 pt-1.5 safe-area-pb shadow-[0_-4px_24px_rgba(91,42,134,0.08)]"
      id="mobile-bottom-tab-bar"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {EVENT_NAV_ITEMS.map((item) => {
          const href = item.href(eventId);
          const isActive =
            item.segment === ''
              ? pathname === href
              : pathname.startsWith(href);
          const Icon = ICONS[item.label as keyof typeof ICONS] || Sparkles;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={cn(
                  'w-9 h-7 rounded-full flex items-center justify-center transition-all',
                  isActive ? 'bg-primary-container text-on-primary' : 'bg-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
