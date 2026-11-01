/**
 * Deterministic formatting utilities.
 * Never computed by LLM. Uses Intl.NumberFormat with en-IN locale by default.
 * Provides deterministic precision across all currency, lakh, percentage, and date calculations.
 */

/**
 * Formats a numeric monetary value into a localized currency string using standard Indian Numbering (en-IN).
 *
 * @param amount - The raw numerical amount to format.
 * @param currency - The ISO currency code (defaults to 'INR').
 * @param locale - The BCP 47 language tag (defaults to 'en-IN').
 * @returns A formatted string e.g. "₹15,00,000".
 * @example
 * ```ts
 * formatCurrency(1500000); // "₹15,00,000"
 * ```
 */
export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats large Indian financial quantities into succinct Lakh (L) and Crore (Cr) notations.
 *
 * @param amount - The raw numerical amount in rupees.
 * @returns Formatted representation e.g. "₹15.0L" or "₹1.5Cr".
 * @example
 * ```ts
 * formatLakh(1500000); // "₹15.0L"
 * formatLakh(15000000); // "₹1.5Cr"
 * ```
 */
export function formatLakh(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores.toFixed(1)}Cr`;
  }
  return `₹${lakhs.toFixed(1)}L`;
}

/**
 * Computes remaining calendar days from a given baseline date to an event date.
 * Guarantees a non-negative integer result.
 *
 * @param targetDateStr - Target ISO date string or Date object.
 * @param fromDate - Optional reference baseline date (defaults to current time).
 * @returns Non-negative number of days until the celebration.
 * @example
 * ```ts
 * calculateDaysToGo('2027-02-14', new Date('2026-11-01')); // 105
 * ```
 */
export function calculateDaysToGo(targetDateStr: string | Date, fromDate: Date = new Date()): number {
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates a clean integer percentage bounded strictly between 0% and 100%.
 * Safely guards against division by zero and negative totals.
 *
 * @param part - The numerator value.
 * @param total - The denominator value.
 * @returns Clamped integer percentage between 0 and 100.
 * @example
 * ```ts
 * calculatePercentage(75, 100); // 75
 * calculatePercentage(120, 100); // 100
 * ```
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}
