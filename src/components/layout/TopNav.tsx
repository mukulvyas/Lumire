'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Plus,
  Home,
  ArrowRight,
} from 'lucide-react';
import { EVENT_NAV_ITEMS } from '@/config/nav';
import { UI_COPY } from '@/config/copy';
import { cn } from '@/lib/utils';
import { SavePlanModal } from '@/features/auth/components/SavePlanModal';
import { createClient } from '@/server/auth/supabaseClient';

interface TopNavProps {
  onSignInClick?: () => void;
}

interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export function TopNav({ onSignInClick }: TopNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const eventId = params?.id as string | undefined;
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignIn = onSignInClick || (() => setInternalModalOpen(true));
  const isEventRoute = Boolean(eventId && pathname.includes('/events/'));
  const effectiveEventId = eventId || activeEventId;

  // Auto close mobile drawer on navigation
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (eventId) {
      try {
        localStorage.setItem('lumiere_last_event_id', eventId);
        setActiveEventId(eventId);
      } catch {
        // Ignore localStorage error
      }
    } else {
      try {
        const stored = localStorage.getItem('lumiere_last_event_id');
        if (stored) {
          setActiveEventId(stored);
        }
      } catch {
        // Ignore localStorage error
      }
    }
  }, [eventId, pathname]);

  useEffect(() => {
    const supabase = createClient();

    // Check active session on mount
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser && !currentUser.is_anonymous) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          fullName: (currentUser.user_metadata?.full_name as string) || (currentUser.user_metadata?.name as string),
          avatarUrl: (currentUser.user_metadata?.avatar_url as string) || (currentUser.user_metadata?.picture as string),
        });
      }
    });

    // Listen for auth state changes (e.g. login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !session.user.is_anonymous) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: (session.user.user_metadata?.full_name as string) || (session.user.user_metadata?.name as string),
          avatarUrl: (session.user.user_metadata?.avatar_url as string) || (session.user.user_metadata?.picture as string),
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMenuOpen(false);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  }

  const firstName =
    user?.fullName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Celebrant';

  const userInitial = firstName.charAt(0).toUpperCase();

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
        ) : activeEventId ? (
          <Link
            href={`/events/${activeEventId}`}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-sans text-xs font-semibold shadow-xs transition-all hover:scale-105"
            id="nav-resume-plan-btn"
          >
            <Sparkles className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Resume Celebration →</span>
          </Link>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold px-3 py-1 rounded-full bg-primary-fixed/40">
              {UI_COPY.brand.aiPlannerBadge}
            </span>
          </div>
        )}

        {/* Right: User Profile or Sign-in */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-primary/15 hover:border-primary/30 transition-all shadow-xs cursor-pointer"
                id="nav-user-dropdown-btn"
                aria-expanded={menuOpen}
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || 'User avatar'}
                    width={28}
                    height={28}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-primary/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-sans text-xs font-semibold flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <span className="font-sans text-sm font-medium text-on-surface">
                  Hi, {firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant transition-transform" />
              </button>

              {/* Profile Dropdown */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-primary/15 shadow-xl py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-primary/10">
                    <p className="font-sans text-sm font-semibold text-on-surface truncate">
                      {user.fullName || firstName}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant truncate">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Google Connected
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={activeEventId ? `/events/${activeEventId}` : '/new'}
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-sans text-sm text-on-surface hover:bg-surface-container transition-colors"
                      role="menuitem"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>{activeEventId ? 'Resume My Celebration' : 'Plan a Celebration'}</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-primary/10">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-sans text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
                      role="menuitem"
                      id="nav-logout-btn"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
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
          )}

          {/* Mobile Hamburger Menu Toggle Button (Always visible on mobile) */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-full bg-surface-container-low border border-primary/20 flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open navigation menu'}
            id="nav-mobile-menu-toggle-btn"
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="md:hidden w-full bg-surface/98 backdrop-blur-2xl border-b border-primary/15 px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto shadow-2xl"
          id="nav-mobile-drawer"
        >
          {effectiveEventId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <span>Celebration Workspace</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_NAV_ITEMS.map((item) => {
                  const href = item.href(effectiveEventId);
                  const isActive =
                    item.segment === '' ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={item.label}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      )}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Global Links */}
          <div className="pt-2 border-t border-primary/10 space-y-1.5">
            <Link
              href="/"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
            >
              <Home className="w-4 h-4 text-primary" />
              <span>Home</span>
            </Link>

            <Link
              href="/new"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Plan New Celebration</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 fill-primary" />
            </Link>

            {activeEventId && !isEventRoute && (
              <Link
                href={`/events/${activeEventId}`}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-on-primary bg-primary shadow-xs transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Resume My Celebration</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* User Profile / Auth Action */}
          <div className="pt-2 border-t border-primary/10">
            {user ? (
              <div className="flex items-center justify-between px-1">
                <div className="text-left">
                  <p className="text-xs font-semibold text-on-surface">
                    {user.fullName || firstName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    setMobileNavOpen(false);
                  }}
                  className="text-xs font-semibold text-error px-3 py-1.5 rounded-lg hover:bg-error/10 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleSignIn();
                }}
                className="w-full py-2.5 rounded-xl bg-surface-container text-primary text-xs font-semibold border border-primary/20 hover:bg-surface-container-high transition-colors text-center"
              >
                Sign in with Google / Email
              </button>
            )}
          </div>
        </div>
      )}

      <SavePlanModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
      />
    </header>
  );
}

