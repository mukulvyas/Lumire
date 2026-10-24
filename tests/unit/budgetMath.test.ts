import { describe, it, expect } from 'vitest';
import { rebalanceBudget } from '@/server/services/budgetMath';
import { formatCurrency, formatLakh, calculateDaysToGo, calculatePercentage } from '@/lib/formatters';

describe('Budget Math & Formatting Integrity', () => {
  it('rebalances categories so they sum exactly to totalBudget', () => {
    const total = 1500000; // ₹15 Lakh
    const categories = [
      { name: 'Venue & Stay', planned: 700000 },
      { name: 'Catering', planned: 400000 },
      { name: 'Decor', planned: 250000 },
      { name: 'Photo & Video', planned: 120000 },
      { name: 'Music', planned: 50000 },
      { name: 'Buffer', planned: 30000 },
    ];

    const rebalanced = rebalanceBudget(total, categories);
    const sum = rebalanced.reduce((acc, c) => acc + c.planned, 0);

    expect(sum).toBe(total);
  });

  it('correctly scales and absorbs rounding remainders', () => {
    const total = 1000000;
    const categories = [
      { name: 'Cat A', planned: 333333 },
      { name: 'Cat B', planned: 333333 },
      { name: 'Cat C', planned: 333333 },
    ];

    const rebalanced = rebalanceBudget(total, categories);
    const sum = rebalanced.reduce((acc, c) => acc + c.planned, 0);

    expect(sum).toBe(total);
  });

  it('formats currency with Indian locale and Lakh units', () => {
    expect(formatLakh(1500000)).toBe('₹15.0L');
    expect(formatLakh(1420000)).toBe('₹14.2L');
    expect(formatLakh(380000)).toBe('₹3.8L');
    expect(formatLakh(20000000)).toBe('₹2.0Cr');

    const formatted = formatCurrency(1500000);
    expect(formatted).toContain('15,00,000');
  });

  it('calculates days to go deterministically', () => {
    const today = new Date('2026-10-21');
    const eventDate = new Date('2027-02-14');
    const days = calculateDaysToGo(eventDate, today);

    expect(days).toBe(116);
  });

  it('calculates percentage accurately bounded between 0 and 100', () => {
    expect(calculatePercentage(132, 150)).toBe(88);
    expect(calculatePercentage(18, 40)).toBe(45);
    expect(calculatePercentage(150, 150)).toBe(100);
    expect(calculatePercentage(200, 150)).toBe(100);
  });
});
