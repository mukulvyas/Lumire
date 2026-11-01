import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names intelligently with clsx and twMerge,
 * eliminating conflicting utility classes.
 *
 * @param inputs - Array of class names, conditionals, or objects.
 * @returns Optimized combined class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
