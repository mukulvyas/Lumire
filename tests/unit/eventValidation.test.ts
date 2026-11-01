import { describe, it, expect } from 'vitest';
import { EventBriefSchema } from '@/server/ai/schemas/eventBrief';

describe('Event Brief Schema & Validation Integrity', () => {
  it('parses a valid complete celebration brief successfully', () => {
    const raw = {
      title: 'Royal Palace Heritage Wedding',
      type: 'wedding',
      event_date: '2027-02-26',
      city: 'Jaipur',
      region_code: 'IN-RJ',
      guest_target: 150,
      total_budget: 1500000,
      currency: 'INR',
      locale: 'en-IN',
      preferences: {
        theme: 'Royal Heritage',
        culture: 'Rajasthani',
      },
    };

    const parsed = EventBriefSchema.parse(raw);
    expect(parsed.title).toBe('Royal Palace Heritage Wedding');
    expect(parsed.total_budget).toBe(1500000);
    expect(parsed.preferences.theme).toBe('Royal Heritage');
  });

  it('supplies robust defaults for partially specified briefs', () => {
    const minimal = {};
    const parsed = EventBriefSchema.parse(minimal);

    expect(parsed.title).toBe('Celebration Plan');
    expect(parsed.type).toBe('wedding');
    expect(parsed.guest_target).toBe(150);
    expect(parsed.total_budget).toBe(1500000);
    expect(parsed.currency).toBe('INR');
  });

  it('rejects invalid event dates with descriptive errors', () => {
    const invalidDate = {
      event_date: '26-02-2027', // Wrong format, should be YYYY-MM-DD
    };

    const result = EventBriefSchema.safeParse(invalidDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
    }
  });

  it('rejects unsupported event types', () => {
    const invalidType = {
      type: 'corporate_conference',
    };

    const result = EventBriefSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
  });

  it('supports birthday and community mela celebration types', () => {
    const birthday = EventBriefSchema.parse({ type: 'birthday', guest_target: 50 });
    expect(birthday.type).toBe('birthday');
    expect(birthday.guest_target).toBe(50);

    const community = EventBriefSchema.parse({ type: 'community', guest_target: 400 });
    expect(community.type).toBe('community');
    expect(community.guest_target).toBe(400);
  });

  it('validates positive numerical constraints on guest count and budget', () => {
    const negativeBudget = { total_budget: -50000 };
    expect(EventBriefSchema.safeParse(negativeBudget).success).toBe(false);

    const zeroGuests = { guest_target: 0 };
    expect(EventBriefSchema.safeParse(zeroGuests).success).toBe(false);
  });
});
