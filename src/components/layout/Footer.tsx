'use client';

import React from 'react';
import Link from 'next/link';
import { UI_COPY } from '@/config/copy';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-container-low/70 border-t border-primary/10 mt-auto">
      <div className="max-w-[1160px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold text-primary tracking-tight">
            {UI_COPY.brand.name}
          </span>
          <span className="text-xs text-on-surface-variant font-sans">
            © {currentYear} {UI_COPY.brand.name}. {UI_COPY.footer.allRightsReserved}
          </span>
        </div>

        <nav className="flex items-center gap-6" aria-label="Legal & Support">
          <Link
            href="/privacy"
            className="text-xs font-sans text-on-surface-variant hover:text-primary transition-colors"
          >
            {UI_COPY.footer.privacy}
          </Link>
          <Link
            href="/terms"
            className="text-xs font-sans text-on-surface-variant hover:text-primary transition-colors"
          >
            {UI_COPY.footer.terms}
          </Link>
          <Link
            href="/support"
            className="text-xs font-sans text-on-surface-variant hover:text-primary transition-colors"
          >
            {UI_COPY.footer.support}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
