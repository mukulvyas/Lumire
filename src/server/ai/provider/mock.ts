import { z } from 'zod';
import { LLMProvider, GenerateOptions } from './types';
import { INTAKE_SYSTEM_PROMPT } from '../prompts/intake';
import { REVISE_PLAN_SYSTEM_PROMPT } from '../prompts/revisePlan';

export class MockLLMProvider implements LLMProvider {
  name = 'mock';

  async generateStructured<TOutput, TDef extends z.ZodTypeDef = z.ZodTypeDef, TInput = TOutput>(
    schema: z.ZodType<TOutput, TDef, TInput>,
    systemPrompt: string,
    userPrompt: string,
    _options?: GenerateOptions
  ): Promise<TOutput> {
    const promptLower = userPrompt.toLowerCase();

    // 1. Intake Response
    if (systemPrompt === INTAKE_SYSTEM_PROMPT || promptLower.includes('extract the structured eventbrief')) {
      const isWedding = promptLower.includes('wedding');
      const isBirthday = promptLower.includes('birthday');

      const mockBrief = {
        title: isWedding
          ? 'Royal Heritage Celebration'
          : isBirthday
          ? 'Milestone Birthday Gala'
          : 'Community Festival',
        type: isWedding ? 'wedding' : isBirthday ? 'birthday' : 'community',
        event_date: '2027-02-14',
        city: 'Sun City',
        region_code: 'IN-RJ',
        guest_target: 150,
        total_budget: 1500000,
        currency: 'INR',
        locale: 'en-IN',
        preferences: {
          style: 'Heritage Royal',
          culture: 'Celebratory',
          theme: 'Marigold & Antiqued Brass',
        },
        missing_fields: [],
        clarifying_questions: [],
      };

      return schema.parse(mockBrief);
    }

    // 2. Plan Revision Response
    if (systemPrompt === REVISE_PLAN_SYSTEM_PROMPT || promptLower.includes('propose the planpatch')) {
      const mockPatch = {
        summary: 'Reduced catering budget to ₹3.5L and updated decor styling.',
        operations: [
          {
            type: 'rebalanceCategory',
            category_name: 'Catering & Banquet',
            amount: 350000,
          },
          {
            type: 'replaceTheme',
            new_theme: 'Royal Marigold & Antiqued Brass',
          },
        ],
      };
      return schema.parse(mockPatch);
    }

    // 3. Vendor Shortlist
    if (promptLower.includes('vendor shortlist') || promptLower.includes('"vendors": [')) {
      const mockVendors = {
        vendors: [
          {
            name: 'House on the Clouds',
            category: 'Photography',
            quote_amount: 120000,
            status: 'contacted' as const,
            note: 'Fine-art documentary storytelling',
            contact: { phone: '+919876543210' },
          },
          {
            name: 'Marigold Heritage Florals',
            category: 'Décor',
            quote_amount: 210000,
            status: 'quoted' as const,
            note: 'Courtyard & Mandap floral styling',
            contact: { phone: '+919876543212' },
          },
          {
            name: 'The Grand Palace Resort',
            category: 'Venue',
            quote_amount: 675000,
            status: 'confirmed' as const,
            note: 'Grand Palace Pavilion',
            contact: { phone: '+919876543215' },
          },
        ],
      };
      return schema.parse(mockVendors);
    }

    // 4. Timeline / Tasks
    if (promptLower.includes('chronological milestone timeline') || promptLower.includes('"tasks": [')) {
      const mockTimeline = {
        tasks: [
          {
            title: 'Finalize Sangeet Choreographer & Playlist',
            phase: 'Creative Direction',
            due_date: '2026-10-29',
            ai_tip: 'Book by Friday to lock in peak season rehearsal rates.',
            sort_order: 1,
          },
          {
            title: 'Confirm Royal Suite Tasting Menu at Grand Palace',
            phase: 'Creative Direction',
            due_date: '2026-11-04',
            ai_tip: '38 guests have requested vegan/Jain catering preferences.',
            sort_order: 2,
          },
          {
            title: 'Send Royal Foil E-invites & Collect Travel Details',
            phase: 'Guest Engagement',
            due_date: '2026-11-12',
            ai_tip: 'Sending 3 months prior increases RSVP response rate by 24%.',
            sort_order: 3,
          },
        ],
        run_sheet: [
          {
            start_time: '16:00',
            end_time: '17:30',
            title: 'Guest Welcome & Saffron Sharbat Reception',
            details: 'Welcome drinks served in Courtyard with live acoustic sitar.',
          },
          {
            start_time: '18:00',
            end_time: '20:30',
            title: 'Ceremonial Vows & Phere at Sunset Mandap',
            details: 'Sunset phere under floral jharokha with classical shehnai.',
          },
        ],
      };
      return schema.parse(mockTimeline);
    }

    // 5. Creative Ideas
    if (promptLower.includes('creative, personalized celebration ideas') || promptLower.includes('"ideas": [')) {
      const mockIdeas = {
        ideas: [
          {
            kind: 'theme' as const,
            title: 'Royal Marigold & Antiqued Brass',
            reason: 'Uses local seasonal florals to save ₹35,000 against imported blooms.',
            est_cost: 35000,
            image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          },
          {
            kind: 'menu' as const,
            title: 'Bespoke Mewari Royal Feast',
            reason: 'Consolidates 6 live culinary stations within inclusive banquet package.',
            est_cost: 45000,
            image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
          },
          {
            kind: 'decor' as const,
            title: 'Heritage Jharokha Mandap',
            reason: 'Reuses courtyard architecture, reducing structural rigging costs by 20%.',
            est_cost: 50000,
            image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
          },
        ],
      };
      return schema.parse(mockIdeas);
    }

    // 6. Budget Split
    if (promptLower.includes('itemized budget split') || promptLower.includes('"categories": [')) {
      const mockBudget = {
        categories: [
          { name: 'Venue & Stay', planned: 675000, sort_order: 1 },
          { name: 'Catering & Banquet', planned: 380000, sort_order: 2 },
          { name: 'Décor & Ambiance', planned: 210000, sort_order: 3 },
          { name: 'Photography & Cinematography', planned: 115000, sort_order: 4 },
          { name: 'Music & Entertainment', planned: 40000, sort_order: 5 },
          { name: 'Other & Buffer', planned: 80000, sort_order: 6 },
        ],
      };
      return schema.parse(mockBudget);
    }

    // Default fallback attempt
    throw new Error(`MockLLMProvider: Unhandled prompt topic: ${userPrompt.slice(0, 80)}`);
  }

  async *streamText(
    _systemPrompt: string,
    _userPrompt: string,
    _options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const words = [
      'Analyzing celebration requirements...',
      ' Grounding against regional benchmarks...',
      ' Structuring itemized budget split...',
      ' Backward-planning milestone checklist...',
      ' Curating local vendor shortlist...',
    ];

    for (const word of words) {
      await new Promise((r) => setTimeout(r, 40));
      yield word;
    }
  }
}
