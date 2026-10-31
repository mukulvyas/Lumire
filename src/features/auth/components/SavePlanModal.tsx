'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { UI_COPY } from '@/config/copy';
import { linkGoogleAccount, signInWithEmail, signUpWithEmail } from '@/server/auth/session';

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavePlanModal({ isOpen, onClose }: SavePlanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

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
          setErrorMsg(
            'Google login is not enabled in your Supabase project yet. Please enable Google in Supabase -> Authentication -> Providers.'
          );
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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (emailMode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Successfully signed in! Reloading...');
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 800);
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm or sign in.');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      id="save-plan-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-plan-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[460px] rounded-3xl bg-surface-container-lowest p-7 sm:p-9 shadow-[0_24px_72px_-12px_rgba(67,13,110,0.28)] flex flex-col items-center text-center border border-primary/15 transition-all">
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

        {/* Celebration SVG Graphic Mark */}
        <div className="w-14 h-14 mb-4 flex items-center justify-center relative">
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
          className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-2"
          id="save-plan-title"
        >
          {UI_COPY.auth.savePlanTitle}
        </h2>

        {/* Description */}
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-[340px] mb-6 leading-relaxed">
          {UI_COPY.auth.savePlanDescription}
        </p>

        {/* Auth Mode Tabs (Google vs Email) */}
        <div className="w-full p-1 rounded-full bg-surface-container flex items-center mb-5 border border-primary/10">
          <button
            type="button"
            onClick={() => setAuthMode('google')}
            className={`flex-1 py-1.5 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              authMode === 'google'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            className={`flex-1 py-1.5 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              authMode === 'email'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Email & Password
          </button>
        </div>

        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-error-container text-error text-xs font-sans text-left">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-sans flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Auth Tab */}
        {authMode === 'google' && (
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={handleGoogleLink}
              disabled={isLoading}
              className="w-full h-12 px-6 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_2px_12px_rgba(67,13,110,0.08)] border border-primary/15 active:scale-[0.99] cursor-pointer disabled:opacity-50"
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
                {isLoading ? 'Connecting Google…' : UI_COPY.auth.continueWithGoogle}
              </span>
            </button>
            <p className="text-[11px] text-on-surface-variant font-sans">
              Instant one-click access with your Google account.
            </p>
          </div>
        )}

        {/* Email & Password Auth Tab */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailAuth} className="w-full space-y-3.5 text-left font-sans">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-on-surface-variant" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-full bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{emailMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setEmailMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                {emailMode === 'login'
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        )}

        {/* Maybe Later Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 font-sans text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          id="maybe-later-dismiss-btn"
        >
          {UI_COPY.auth.maybeLater}
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

