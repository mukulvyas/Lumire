import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  date,
  time,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Events
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  owner_id: uuid('owner_id').notNull(),
  type: varchar('type', { length: 32 }).notNull(), // 'wedding' | 'birthday' | 'community'
  title: varchar('title', { length: 255 }).notNull(),
  event_date: date('event_date').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  region_code: varchar('region_code', { length: 32 }).default('IN-RJ').notNull(),
  guest_target: integer('guest_target').notNull(),
  total_budget: numeric('total_budget', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 8 }).default('INR').notNull(),
  locale: varchar('locale', { length: 16 }).default('en-IN').notNull(),
  preferences: jsonb('preferences').default({}).notNull(),
  status: varchar('status', { length: 32 }).default('planning').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Budget Categories
export const budgetCategories = pgTable('budget_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  planned: numeric('planned', { precision: 12, scale: 2 }).notNull(),
  committed: numeric('committed', { precision: 12, scale: 2 }).default('0').notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
  status: varchar('status', { length: 32 }).default('optimal').notNull(), // 'optimal' | 'near_limit' | 'over_budget' | 'unused'
});

// 3. Tasks & Milestones
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  phase: varchar('phase', { length: 64 }).notNull(),
  due_date: date('due_date').notNull(),
  status: varchar('status', { length: 32 }).default('pending').notNull(), // 'pending' | 'completed'
  ai_tip: text('ai_tip'),
  category_id: uuid('category_id').references(() => budgetCategories.id, { onDelete: 'set null' }),
  sort_order: integer('sort_order').default(0).notNull(),
});

// 4. Run Sheet Items (Day-of Schedule)
export const runSheetItems = pgTable('run_sheet_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  start_time: time('start_time').notNull(),
  end_time: time('end_time').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  details: text('details'),
});

// 5. Vendors
export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 32 }).default('contacted').notNull(), // 'contacted' | 'quoted' | 'confirmed' | 'paid'
  quote_amount: numeric('quote_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  note: text('note'),
  contact: jsonb('contact').default({}).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Vendor Questions
export const vendorQuestions = pgTable('vendor_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendor_id: uuid('vendor_id')
    .references(() => vendors.id, { onDelete: 'cascade' })
    .notNull(),
  question: text('question').notNull(),
  priority: varchar('priority', { length: 16 }).default('standard').notNull(),
  answered: boolean('answered').default(false).notNull(),
  answer: text('answer'),
});

// 7. Guests
export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  party_size: integer('party_size').default(1).notNull(),
  relation: varchar('relation', { length: 64 }),
  dietary: varchar('dietary', { length: 100 }),
  rsvp: varchar('rsvp', { length: 32 }).default('pending').notNull(), // 'pending' | 'attending' | 'declined'
  table_id: uuid('table_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Seating Tables
export const seatingTables = pgTable('seating_tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  capacity: integer('capacity').default(8).notNull(),
});

// 9. Creative Ideas
export const ideas = pgTable('ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // 'theme' | 'menu' | 'decor' | 'entertainment' | 'invitations' | 'gifts'
  title: varchar('title', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  est_cost: numeric('est_cost', { precision: 12, scale: 2 }).default('0').notNull(),
  image_url: text('image_url'),
  saved: boolean('saved').default(false).notNull(),
});

// 10. AI Conversation Messages & Proposals
export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 16 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  proposed_patch: jsonb('proposed_patch'),
  applied_at: timestamp('applied_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 11. Plan Revisions (Enables Undo & Rollback)
export const planRevisions = pgTable('plan_revisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  snapshot: jsonb('snapshot').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 12. Configuration Tables (Config over constants)
export const eventTemplates = pgTable('event_templates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  event_type: varchar('event_type', { length: 32 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  default_budget_split: jsonb('default_budget_split').notNull(),
});

export const templateItems = pgTable('template_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  template_id: varchar('template_id', { length: 64 })
    .references(() => eventTemplates.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 32 }).notNull(), // 'task' | 'vendor' | 'phase'
  title: varchar('title', { length: 255 }).notNull(),
  relative_days_before: integer('relative_days_before').notNull(),
  phase: varchar('phase', { length: 64 }).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
});

export const priceBenchmarks = pgTable('price_benchmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  region: varchar('region', { length: 64 }).notNull(),
  event_type: varchar('event_type', { length: 32 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  min_cost: numeric('min_cost', { precision: 12, scale: 2 }).notNull(),
  max_cost: numeric('max_cost', { precision: 12, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 32 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
