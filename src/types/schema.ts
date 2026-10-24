export interface EventModel {
  id: string;
  owner_id: string;
  type: string; // 'wedding' | 'birthday' | 'community'
  title: string;
  event_date: string;
  city: string;
  region_code: string;
  guest_target: number;
  total_budget: string | number;
  currency: string;
  locale: string;
  preferences: Record<string, any>;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface BudgetCategoryModel {
  id: string;
  event_id: string;
  name: string;
  planned: string | number;
  committed: string | number;
  sort_order: number;
  status: string;
}

export interface TaskModel {
  id: string;
  event_id: string;
  title: string;
  phase: string;
  due_date: string;
  status: 'pending' | 'completed';
  ai_tip?: string | null;
  category_id?: string | null;
  sort_order: number;
}

export interface RunSheetItemModel {
  id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  title: string;
  details?: string | null;
}

export interface VendorModel {
  id: string;
  event_id: string;
  category: string;
  name: string;
  status: 'contacted' | 'quoted' | 'confirmed' | 'paid' | string;
  quote_amount: string | number;
  note?: string | null;
  contact?: Record<string, any>;
  created_at?: string | Date;
}

export interface GuestModel {
  id: string;
  event_id: string;
  name: string;
  party_size: number;
  relation?: string | null;
  dietary?: string | null;
  rsvp: 'pending' | 'attending' | 'declined' | string;
  table_id?: string | null;
  created_at?: string | Date;
}

export interface IdeaModel {
  id: string;
  event_id: string;
  kind: 'theme' | 'menu' | 'decor' | 'entertainment' | 'invitations' | 'gifts' | string;
  title: string;
  reason: string;
  est_cost: string | number;
  image_url?: string | null;
  saved: boolean;
}

export interface EventBrief {
  title: string;
  type: 'wedding' | 'birthday' | 'community';
  event_date: string;
  city: string;
  region_code: string;
  guest_target: number;
  total_budget: number;
  currency: string;
  locale: string;
  preferences?: {
    style?: string;
    culture?: string;
    theme?: string;
    dietary_notes?: string;
  };
  missing_fields?: string[];
  clarifying_questions?: string[];
}

export interface PlanDiffItem {
  field: string;
  before: string | number;
  after: string | number;
  changeType: 'modified' | 'added' | 'removed';
}

export interface PlanPatch {
  reasoning: string;
  operations: Array<{
    type: string;
    [key: string]: any;
  }>;
}

// Aliases matching former Drizzle schema inferSelect for transparent frontend compatibility
export type events = { $inferSelect: EventModel };
export type budgetCategories = { $inferSelect: BudgetCategoryModel };
export type tasks = { $inferSelect: TaskModel };
export type runSheetItems = { $inferSelect: RunSheetItemModel };
export type vendors = { $inferSelect: VendorModel };
export type guests = { $inferSelect: GuestModel };
export type ideas = { $inferSelect: IdeaModel };
