'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UI_COPY } from '@/config/copy';
import { linkGoogleAccount } from '@/server/auth/session';

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavePlanModal({ isOpen, onClose }: SavePlanModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleGoogleLink() {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const { error } = await linkGoogleAccount();
      if (error) {
        if (
          error.message.includes('provider is not enabled') ||
          error.message.includes('not supported') ||
          error.message.includes('could not be found')
        ) {
          setErrorMsg('Google login is not enabled in your Supabase project yet. Please enable Google in Supabase -> Authentication -> Providers.');
        } else {
          setErrorMsg(error.message);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to connect Google account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface/50 backdrop-blur-md transition-all duration-300"
      id="save-plan-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-plan-title"
    >
      <div className="relative w-full max-w-[430px] rounded-xl bg-surface-container-lowest p-8 sm:p-10 shadow-[0_24px_64px_-12px_rgba(67,13,110,0.18)] flex flex-col items-center text-center border border-primary/10 transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          id="close-save-plan-modal-btn"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration SVG Graphic Mark (from Stitch) */}
        <div className="w-16 h-16 mb-6 flex items-center justify-center relative">
          <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 72 72">
            <path
              d="M36 12C36.8 24 40 27.2 52 28C40 28.8 36.8 32 36 44C35.2 32 32 28.8 20 28C32 27.2 35.2 24 36 12Z"
              fill="#5B2A86"
              fillOpacity="0.9"
            />
            <path
              d="M52 14L54.5 20L60.5 22.5L54.5 25L52 31L49.5 25L43.5 22.5L49.5 20L52 14Z"
              fill="#F9BC4D"
            />
            <circle cx="21" cy="46" fill="#FF6B6B" fillOpacity="0.85" r="3" />
            <rect
              fill="#AE2F34"
              fillOpacity="0.6"
              height="4.5"
              rx="1.5"
              transform="rotate(28 47 45)"
              width="4.5"
              x="47"
              y="45"
            />
            <circle cx="22" cy="18" fill="#DFB7FF" r="2.2" />
            <circle cx="56" cy="38" fill="#F9BC4D" r="1.8" />
            <circle cx="36" cy="56" fill="#5B2A86" fillOpacity="0.4" r="2.5" />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="font-serif text-2xl font-bold text-primary tracking-tight mb-2"
          id="save-plan-title"
        >
          {UI_COPY.auth.savePlanTitle}
        </h2>

        {/* Description */}
        <p className="font-sans text-sm text-on-surface-variant max-w-[320px] mb-8 leading-relaxed">
          {UI_COPY.auth.savePlanDescription}
        </p>

        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-lg bg-error-container text-error text-xs font-sans">
            {errorMsg}
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleLink}
          disabled={isLoading}
          className="w-full h-12 px-6 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_2px_8px_rgba(67,13,110,0.08)] border border-primary/10 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          id="continue-with-google-btn"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-sans text-sm font-semibold text-on-surface">
            {isLoading ? 'Connecting…' : UI_COPY.auth.continueWithGoogle}
          </span>
        </button>

        {/* Maybe Later Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 font-sans text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          id="maybe-later-dismiss-btn"
        >
          {UI_COPY.auth.maybeLater}
        </button>
      </div>
    </div>
  );
}
