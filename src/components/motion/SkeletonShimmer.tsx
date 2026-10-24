'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonShimmerProps {
  className?: string;
  lines?: number;
}

export function SkeletonShimmer({ className, lines = 3 }: SkeletonShimmerProps) {
  return (
    <div className={cn('animate-pulse space-y-3 w-full', className)}>
      <div className="h-6 bg-surface-container-high rounded-full w-3/4"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-container rounded-full"
          style={{ width: `${Math.max(40, 95 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
