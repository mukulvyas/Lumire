import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatLakh,
  calculateDaysToGo,
  calculatePercentage,
} from '@/lib/formatters';

describe('Deterministic Financial & Date Formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers in INR standard grouping with rupee symbol', () => {
      const result = formatCurrency(1500000);
      expect(result).toMatch(/₹\s?15,00,000/);
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/₹\s?0/);
    });

    it('handles NaN gracefully without throwing', () => {
      expect(formatCurrency(NaN)).toBe('₹0');
    });

    it('handles negative numbers safely', () => {
      const result = formatCurrency(-50000);
      expect(result).toContain('50,000');
    });
  });

  describe('formatLakh', () => {
    it('formats exact lakhs with L suffix', () => {
      expect(formatLakh(1500000)).toBe('₹15.0L');
      expect(formatLakh(100000)).toBe('₹1.0L');
      expect(formatLakh(5000000)).toBe('₹50.0L');
    });

    it('formats fractional lakhs with one decimal place', () => {
      expect(formatLakh(1250000)).toBe('₹12.5L');
      expect(formatLakh(775000)).toBe('₹7.8L');
    });

    it('formats values equal to or exceeding 1 crore with Cr suffix', () => {
      expect(formatLakh(10000000)).toBe('₹1.0Cr');
      expect(formatLakh(25000000)).toBe('₹2.5Cr');
    });

    it('handles zero and NaN gracefully', () => {
      expect(formatLakh(0)).toBe('₹0');
      expect(formatLakh(NaN)).toBe('₹0');
    });
  });

  describe('calculateDaysToGo', () => {
    it('returns positive integer for future dates', () => {
      const base = new Date('2026-11-01T00:00:00Z');
      const target = '2026-11-15T00:00:00Z';
      expect(calculateDaysToGo(target, base)).toBe(14);
    });

    it('returns 0 for past dates without negative numbers', () => {
      const base = new Date('2026-11-15T00:00:00Z');
      const past = '2026-11-01T00:00:00Z';
      expect(calculateDaysToGo(past, base)).toBe(0);
    });

    it('returns 0 for same day', () => {
      const base = new Date('2026-11-01T12:00:00Z');
      const same = '2026-11-01T12:00:00Z';
      expect(calculateDaysToGo(same, base)).toBe(0);
    });
  });

  describe('calculatePercentage', () => {
    it('calculates integer percentage accurately', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(75, 150)).toBe(50);
    });

    it('clamps percentage to maximum 100', () => {
      expect(calculatePercentage(150, 100)).toBe(100);
    });

    it('returns 0 for zero or negative total safely without division by zero', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
      expect(calculatePercentage(50, -10)).toBe(0);
    });
  });
});
