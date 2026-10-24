-- Enable Row Level Security on all application tables

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_sheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;

ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_benchmarks ENABLE ROW LEVEL SECURITY;

-- 1. Events RLS Policies
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (owner_id = auth.uid());

-- 2. Budget Categories RLS Policies
CREATE POLICY "Users can view budget categories of their events"
  ON budget_categories FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = budget_categories.event_id AND events.owner_id = auth.uid()));

CREATE POLICY "Users can insert budget categories into their events"
  ON budget_categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = budget_categories.event_id AND events.owner_id = auth.uid()));

CREATE POLICY "Users can update budget categories of their events"
  ON budget_categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = budget_categories.event_id AND events.owner_id = auth.uid()));

CREATE POLICY "Users can delete budget categories of their events"
  ON budget_categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = budget_categories.event_id AND events.owner_id = auth.uid()));

-- 3. Tasks RLS Policies
CREATE POLICY "Users can manage tasks of their events"
  ON tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.owner_id = auth.uid()));

-- 4. Run Sheet Items RLS Policies
CREATE POLICY "Users can manage run sheet items of their events"
  ON run_sheet_items FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = run_sheet_items.event_id AND events.owner_id = auth.uid()));

-- 5. Vendors RLS Policies
CREATE POLICY "Users can manage vendors of their events"
  ON vendors FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = vendors.event_id AND events.owner_id = auth.uid()));

-- 6. Vendor Questions RLS Policies
CREATE POLICY "Users can manage vendor questions of their events"
  ON vendor_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM vendors
    JOIN events ON events.id = vendors.event_id
    WHERE vendors.id = vendor_questions.vendor_id AND events.owner_id = auth.uid()
  ));

-- 7. Guests RLS Policies
CREATE POLICY "Users can manage guests of their events"
  ON guests FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.owner_id = auth.uid()));

-- 8. Seating Tables RLS Policies
CREATE POLICY "Users can manage seating tables of their events"
  ON seating_tables FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = seating_tables.event_id AND events.owner_id = auth.uid()));

-- 9. Ideas RLS Policies
CREATE POLICY "Users can manage ideas of their events"
  ON ideas FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = ideas.event_id AND events.owner_id = auth.uid()));

-- 10. AI Messages RLS Policies
CREATE POLICY "Users can manage ai messages of their events"
  ON ai_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = ai_messages.event_id AND events.owner_id = auth.uid()));

-- 11. Plan Revisions RLS Policies
CREATE POLICY "Users can manage plan revisions of their events"
  ON plan_revisions FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = plan_revisions.event_id AND events.owner_id = auth.uid()));

-- 12. Public Configuration Tables (Read-only for users, write for service_role)
CREATE POLICY "Allow public read of event templates"
  ON event_templates FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read of template items"
  ON template_items FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read of price benchmarks"
  ON price_benchmarks FOR SELECT
  TO PUBLIC
  USING (true);
