/**
 * Deterministic formatting utilities.
 * Never computed by LLM. Uses Intl.NumberFormat with en-IN locale by default.
 */

export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakh(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores.toFixed(1)}Cr`;
  }
  return `₹${lakhs.toFixed(1)}L`;
}

export function calculateDaysToGo(targetDateStr: string | Date, fromDate: Date = new Date()): number {
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}
