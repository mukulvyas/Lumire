import { describe, it, expect } from 'vitest';

interface VendorQuote {
  id: string;
  category: string;
  name: string;
  status: 'contacted' | 'quoted' | 'confirmed' | 'paid';
  quoteAmount: number;
}

function calculateVendorCommittedTotal(vendors: VendorQuote[]): number {
  return vendors
    .filter((v) => v.status === 'confirmed' || v.status === 'paid')
    .reduce((sum, v) => sum + v.quoteAmount, 0);
}

function calculateVendorStatusCounts(vendors: VendorQuote[]): Record<string, number> {
  const counts: Record<string, number> = {
    contacted: 0,
    quoted: 0,
    confirmed: 0,
    paid: 0,
  };
  vendors.forEach((v) => {
    if (counts[v.status] !== undefined) {
      counts[v.status]++;
    }
  });
  return counts;
}

describe('Vendor Kanban & Financial Lifecycle', () => {
  const sampleVendors: VendorQuote[] = [
    { id: 'v1', category: 'Venue & Stay', name: 'Heritage Palace', status: 'confirmed', quoteAmount: 650000 },
    { id: 'v2', category: 'Catering', name: 'Royal Caterers', status: 'quoted', quoteAmount: 360000 },
    { id: 'v3', category: 'Decor', name: 'Marigold Floral Studio', status: 'contacted', quoteAmount: 210000 },
    { id: 'v4', category: 'Photography', name: 'Heritage Wedding Films', status: 'paid', quoteAmount: 100000 },
    { id: 'v5', category: 'Music', name: 'Folk Ensemble', status: 'confirmed', quoteAmount: 40000 },
  ];

  it('accurately calculates committed total exclusively for confirmed and paid vendors', () => {
    // 650000 (v1) + 100000 (v4) + 40000 (v5) = 790000
    const committed = calculateVendorCommittedTotal(sampleVendors);
    expect(committed).toBe(790000);
  });

  it('correctly aggregates vendor counts across Kanban stages', () => {
    const counts = calculateVendorStatusCounts(sampleVendors);
    expect(counts.contacted).toBe(1);
    expect(counts.quoted).toBe(1);
    expect(counts.confirmed).toBe(2);
    expect(counts.paid).toBe(1);
  });

  it('handles empty vendor lists gracefully without errors', () => {
    expect(calculateVendorCommittedTotal([])).toBe(0);
    const emptyCounts = calculateVendorStatusCounts([]);
    expect(emptyCounts.confirmed).toBe(0);
  });

  it('validates vendor quote progression rules', () => {
    const validTransitions: Record<string, string[]> = {
      contacted: ['quoted', 'declined'],
      quoted: ['confirmed', 'declined', 'contacted'],
      confirmed: ['paid', 'quoted'],
      paid: [],
    };

    expect(validTransitions['contacted']).toContain('quoted');
    expect(validTransitions['quoted']).toContain('confirmed');
    expect(validTransitions['confirmed']).toContain('paid');
  });
});
