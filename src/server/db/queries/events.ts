import { calculateDaysToGo, calculatePercentage } from '@/lib/formatters';
import {
  events,
  budgetCategories,
  tasks,
  runSheetItems,
  vendors,
  guests,
  ideas,
} from '@/server/db/schema';

export interface EventFullDetails {
  event: typeof events.$inferSelect;
  budgetCategories: (typeof budgetCategories.$inferSelect)[];
  tasks: (typeof tasks.$inferSelect)[];
  runSheetItems: (typeof runSheetItems.$inferSelect)[];
  vendors: (typeof vendors.$inferSelect)[];
  guests: (typeof guests.$inferSelect)[];
  ideas: (typeof ideas.$inferSelect)[];
  computed: {
    daysToGo: number;
    committedBudget: number;
    plannedBudget: number;
    totalBudget: number;
    confirmedGuests: number;
    totalGuestsTarget: number;
    completedTasksCount: number;
    totalTasksCount: number;
    taskCompletionRate: number;
    budgetCommittedRate: number;
  };
}

// Fallback generator when Python backend is starting up or event ID is fresh
export function generateFallbackEventDetails(id: string): EventFullDetails {
  const eventDate = new Date(Date.now() + 117 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const totalBudget = 1500000;

  const mockCategories: (typeof budgetCategories.$inferSelect)[] = [
    { id: 'cat-1', event_id: id, name: 'Venue & Stay', planned: '675000', committed: '650000', sort_order: 1, status: 'optimal' },
    { id: 'cat-2', event_id: id, name: 'Catering & Bar', planned: '380000', committed: '360000', sort_order: 2, status: 'optimal' },
    { id: 'cat-3', event_id: id, name: 'Décor & Florals', planned: '210000', committed: '210000', sort_order: 3, status: 'near_limit' },
    { id: 'cat-4', event_id: id, name: 'Photography & Film', planned: '115000', committed: '100000', sort_order: 4, status: 'optimal' },
    { id: 'cat-5', event_id: id, name: 'Music & Experience', planned: '40000', committed: '40000', sort_order: 5, status: 'optimal' },
    { id: 'cat-6', event_id: id, name: 'Buffer / Contingency', planned: '80000', committed: '0', sort_order: 6, status: 'unused' },
  ];

  const mockTasks: (typeof tasks.$inferSelect)[] = [
    {
      id: 'task-1',
      event_id: id,
      title: 'Finalize Entertainment & Musical Ensemble',
      phase: 'Phase 2: Experience',
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      ai_tip: 'Booking 3 months in advance ensures peak performance availability.',
      category_id: 'cat-5',
      sort_order: 1,
    },
    {
      id: 'task-2',
      event_id: id,
      title: 'Confirm Tasting Menu & Dietary Customizations',
      phase: 'Phase 2: Experience',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      ai_tip: '28 guests have noted dietary preferences in their RSVPs.',
      category_id: 'cat-2',
      sort_order: 2,
    },
    {
      id: 'task-3',
      event_id: id,
      title: 'Send Digital Invitations & Collect Travel Details',
      phase: 'Phase 3: Logistics',
      due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      ai_tip: 'Sending invitations at this milestone increases RSVP completion by 24%.',
      category_id: null,
      sort_order: 3,
    },
    {
      id: 'task-4',
      event_id: id,
      title: 'Approve Floral Installations & Table Centerpieces',
      phase: 'Phase 3: Logistics',
      due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      ai_tip: 'Local seasonal blooms reduce transport emissions and cost by 15%.',
      category_id: 'cat-3',
      sort_order: 4,
    },
    {
      id: 'task-5',
      event_id: id,
      title: 'Sign Venue Contract and Lodge Deposit',
      phase: 'Phase 1: Foundation',
      due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      ai_tip: 'Foundation locked with Taj Jai Mahal Palace.',
      category_id: 'cat-1',
      sort_order: 5,
    },
  ];

  const mockRunSheet: (typeof runSheetItems.$inferSelect)[] = [
    { id: 'rs-1', event_id: id, start_time: '15:00', end_time: '16:30', title: 'Baraat & Grand Royal Welcome', details: 'Traditional dhol procession and rosewater greeting.' },
    { id: 'rs-2', event_id: id, start_time: '16:30', end_time: '18:00', title: 'Varmala & Sunset Pheras', details: 'Courtyard mandap ceremony at golden hour.' },
    { id: 'rs-3', event_id: id, start_time: '19:00', end_time: '23:00', title: 'Royal Banquet & Sangeet Gala', details: 'Under candlelight arches with live sitar performance.' },
  ];

  const mockVendors: (typeof vendors.$inferSelect)[] = [
    { id: 'v-1', event_id: id, category: 'Venue & Stay', name: 'Taj Jai Mahal Palace Grounds', status: 'confirmed', quote_amount: '650000', note: 'Courtyard & Banquet confirmed', contact: {}, created_at: new Date() },
    { id: 'v-2', event_id: id, category: 'Catering & Bar', name: 'Royal Feast Caterers', status: 'quoted', quote_amount: '360000', note: '3 live artisan counters included', contact: {}, created_at: new Date() },
    { id: 'v-3', event_id: id, category: 'Décor & Florals', name: 'Gulabi Marigold Studios', status: 'contacted', quote_amount: '210000', note: 'Awaiting final CAD layout', contact: {}, created_at: new Date() },
    { id: 'v-4', event_id: id, category: 'Photography & Film', name: 'Lumière Heritage Wedding Films', status: 'contacted', quote_amount: '100000', note: 'Drone authorization verified', contact: {}, created_at: new Date() },
    { id: 'v-5', event_id: id, category: 'Music & Experience', name: 'Royal Folk Ensemble & DJ', status: 'contacted', quote_amount: '40000', note: 'Sunset shehnai + sound tech', contact: {}, created_at: new Date() },
  ];

  const mockGuests: (typeof guests.$inferSelect)[] = [
    { id: 'g-1', event_id: id, name: 'Aarav & Priya Sharma', party_size: 2, relation: 'Close Friends', dietary: 'Vegetarian', rsvp: 'attending', table_id: null, created_at: new Date() },
    { id: 'g-2', event_id: id, name: 'Kabir Singhania', party_size: 1, relation: 'Family', dietary: 'Jain', rsvp: 'attending', table_id: null, created_at: new Date() },
    { id: 'g-3', event_id: id, name: 'Ananya & Rohan Mehta', party_size: 2, relation: 'College Friends', dietary: 'None', rsvp: 'pending', table_id: null, created_at: new Date() },
    { id: 'g-4', event_id: id, name: 'Devendra & Gayatri Rathore', party_size: 4, relation: 'Family Elders', dietary: 'Traditional Rajasthani', rsvp: 'attending', table_id: null, created_at: new Date() },
    { id: 'g-5', event_id: id, name: 'Siddharth Kapoor', party_size: 1, relation: 'Colleague', dietary: 'Vegan', rsvp: 'declined', table_id: null, created_at: new Date() },
  ];

  const mockIdeas: (typeof ideas.$inferSelect)[] = [
    { id: 'i-1', event_id: id, kind: 'decor', title: 'Handcrafted Clay Diyas & Brass Urli Fountain', reason: 'Emphasizes warm ambient evening illumination sustainably', est_cost: '15000', image_url: null, saved: true },
    { id: 'i-2', event_id: id, kind: 'menu', title: 'Live Regional Chai & Artisanal Mithai Cart', reason: 'High engagement refreshment during late afternoon arrivals', est_cost: '22000', image_url: null, saved: false },
    { id: 'i-3', event_id: id, kind: 'entertainment', title: 'Folk Sitar & Tabla Sunset Interlude', reason: 'Creates a peaceful atmosphere during golden hour cocktails', est_cost: '30000', image_url: null, saved: true },
  ];

  const committedBudget = mockCategories.reduce((acc, c) => acc + Number(c.committed), 0);
  const plannedBudget = mockCategories.reduce((acc, c) => acc + Number(c.planned), 0);
  const confirmedGuests = 132;
  const completedTasksCount = mockTasks.filter((t) => t.status === 'completed').length;

  return {
    event: {
      id,
      owner_id: '00000000-0000-0000-0000-000000000001',
      type: 'wedding',
      title: 'Royal Celebration',
      event_date: eventDate,
      city: 'Destination City',
      region_code: 'IN-RJ',
      guest_target: 150,
      total_budget: totalBudget.toString(),
      currency: 'INR',
      locale: 'en-IN',
      preferences: { theme: 'Royal Heritage' },
      status: 'planning',
      created_at: new Date(),
      updated_at: new Date(),
    },
    budgetCategories: mockCategories,
    tasks: mockTasks,
    runSheetItems: mockRunSheet,
    vendors: mockVendors,
    guests: mockGuests,
    ideas: mockIdeas,
    computed: {
      daysToGo: calculateDaysToGo(eventDate),
      committedBudget,
      plannedBudget,
      totalBudget,
      confirmedGuests,
      totalGuestsTarget: 150,
      completedTasksCount,
      totalTasksCount: mockTasks.length,
      taskCompletionRate: calculatePercentage(completedTasksCount, mockTasks.length),
      budgetCommittedRate: calculatePercentage(committedBudget, totalBudget),
    },
  };
}

export async function getEventFullDetails(eventId: string): Promise<EventFullDetails> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/events/${eventId}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.event) {
        return data as EventFullDetails;
      }
    }
  } catch {
    // Python backend offline or loading, fallback to deterministic generator
  }

  return generateFallbackEventDetails(eventId);
}
