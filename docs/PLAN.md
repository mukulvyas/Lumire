# Soirée: Production Implementation Plan

> **Version**: 1.0.0-draft  
> **Status**: Ready for User Review & Approval  
> **Target**: GenAI Event Planner for Weddings, Birthdays, and Community Gatherings  
> **Design Source of Truth**: Google Stitch Project `12473482902747162408` (*Luminous Celebration Atelier*)  

---

## 1. Executive Summary & System Philosophy

**Soirée** is a high-craft GenAI event planner engineered to eliminate logistical anxiety and replace clinical spreadsheets with serene, tactile, computational poise.

### Core Architecture Tenets
1. **Source of Truth Alignment**: All visual layouts, design tokens, elevations, typography, and motion curves derive strictly from Google Stitch project `12473482902747162408`.
2. **Zero Hardcoded Data**: Not a single mock figure, name, currency literal, or vendor estimate is hardcoded in application code. All data flows dynamically from Postgres (Supabase with RLS) or validated LLM generation grounded by regional benchmarks.
3. **Deterministic Math over LLM Hallucinations**: Percentages, countdown days, budget sums, currency formatting (`Intl.NumberFormat` with INR lakh grouping), and category rebalancing are computed deterministically in TypeScript, never delegated to probabilistic LLM arithmetic.
4. **Frictionless Authentication**: Anonymous session initialization on first load; zero sign-up wall. When the user chooses "Save your plan", Google OAuth links to the anonymous identity without losing state.
5. **Phase-Gated Execution**: Work proceeds one phase at a time with strict automated verification (`lint`, `typecheck`, `test`, `test:e2e`, `check:hardcoded`) and user review checkpoints.

---

## 2. Stitch MCP Discovery Summary

Stitch MCP tools were inspected and used to explore available projects:
- `projects/12473482902747162408`: *Soirée AI Event Planner* (Latest active project, updated today).
  - **Design Theme**: `Newsreader` (Editorial Serif) + `Plus Jakarta Sans` (Instrumental UI Sans), `ROUND_FULL` pill styling, custom brand color `#5b2a86` (Deep Royal Plum), secondary `#ff6b6b` (Coral Blossom), tertiary `#f5b94a` (Champagne Gold), surface `#fff8f3` (Warm Alabaster).

### Visual References Downloaded to `docs/design/`
All 9 core screens were captured and stored locally:
- `docs/design/01_home.png` & `docs/design/html/01_home.html` (Hero, celebration cards, how-it-works)
- `docs/design/02_plan_overview_wedding.png` & `docs/design/html/02_plan_overview_wedding.html` (Wedding dashboard)
- `docs/design/03_plan_overview_birthday.png` & `docs/design/html/03_plan_overview_birthday.html` (Birthday dashboard)
- `docs/design/04_ai_assistant.png` & `docs/design/html/04_ai_assistant.html` (AI chat & live diff preview)
- `docs/design/05_budget.png` & `docs/design/html/05_budget.html` (Budget ledger, status dots, AI recommendations)
- `docs/design/06_guests.png` & `docs/design/html/06_guests.html` (Guest rows, filters, seating plan)
- `docs/design/07_vendors.png` & `docs/design/html/07_vendors.html` (Kanban board: Contacted, Quoted, Confirmed, Paid)
- `docs/design/08_ideas.png` & `docs/design/html/08_ideas.html` (Idea cards with cost savings & add to plan)
- `docs/design/09_save_plan_modal.png` & `docs/design/html/09_save_plan_modal.html` (Google linking dialog)

Full component mapping and token variables are documented in [`docs/DESIGN_MAP.md`](file:///Users/mukulvyas/Documents/Soirée/docs/DESIGN_MAP.md).

---

## 3. Tech Stack & Infrastructure

| Layer | Technology | Rationale & Specifications |
|---|---|---|
| **Frontend UI** | Next.js 15 (App Router) + React 19 + TypeScript 5 (Strict) | Pure UI layer rendered from Stitch designs, with responsive layouts, Framer Motion, and TanStack Query |
| **Backend API** | Python 3 + FastAPI (`backend/`) | High-performance async Python backend running on port 8000; mounted routers for `/api/ai/*`, `/api/events/*`, `/api/tasks/*`, `/api/ideas/*`, and `/api/export/*` |
| **Routing Bridge** | Next.js `rewrites()` | Transparently proxies `/api/:path*` to `http://127.0.0.1:8000/api/:path*`, allowing frontend components to call `/api/*` with zero client refactoring |
| **Database & Auth** | Supabase (Postgres 15+, Row Level Security) | Anonymous sessions via `@supabase/ssr`, Google OAuth identity linking |
| **ORM & Database Access** | SQLAlchemy 2.0 (Async) + `asyncpg` | Declarative async models in `backend/app/db/models.py` matching Supabase Postgres schema |
| **LLM & AI** | Google Gemini 1.5 Flash / Pro (via async HTTP / GenAI) | Structured JSON schema validation using Pydantic, regional grounding, and fallback mock generator in `backend/app/services/` |
| **Validation** | Pydantic v2 (Backend) + Zod 3 (Frontend forms) | Strict boundary schema validation on both tiers |
| **Styling** | Tailwind CSS v3/v4 + CSS Variables (`tokens.css`) + shadcn/ui primitives | Strict design token adherence, frosted glassmorphism, responsive breakpoints |
| **Motion** | Framer Motion + `canvas-confetti` | Micro-interactions, staggered entry, spring tab switches; full `prefers-reduced-motion` compliance |
| **Forms** | React Hook Form + `@hookform/resolvers/zod` | Performant uncontrolled forms with instant validation |
| **Export Engines** | Printable HTML export & RFC 5545 `.ics` Calendar | Clean printable documents and downloadable `.ics` calendar events generated by FastAPI |
| **Testing & Quality** | Vitest, Pytest, ESLint, Prettier, Custom AST check script (`npm run check:hardcoded`) | Multi-tier testing and verification across frontend and backend |

---

## 4. Database Schema & RLS Architecture

All tables enforce Postgres Row Level Security (`RLS`) with `owner_id = auth.uid()` so users (including anonymous sessions) strictly access only their own event data.

```sql
-- Core Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('wedding', 'birthday', 'community')),
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  city VARCHAR(100) NOT NULL,
  region_code VARCHAR(32) NOT NULL DEFAULT 'IN-RJ',
  guest_target INT NOT NULL,
  total_budget NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  locale VARCHAR(16) NOT NULL DEFAULT 'en-IN',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budget Breakdown
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  planned NUMERIC(12, 2) NOT NULL,
  committed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'optimal'
);

-- Tasks & Milestones
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(64) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  ai_tip TEXT,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Day-of Schedule
CREATE TABLE run_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT
);

-- Vendors & Quotes
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'contacted' CHECK (status IN ('contacted', 'quoted', 'confirmed', 'paid')),
  quote_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  note TEXT,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendor Discovery Questions
CREATE TABLE vendor_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'standard',
  answered BOOLEAN NOT NULL DEFAULT FALSE,
  answer TEXT
);

-- Guests & RSVP
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  party_size INT NOT NULL DEFAULT 1,
  relation VARCHAR(64),
  dietary VARCHAR(100),
  rsvp VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (rsvp IN ('pending', 'attending', 'declined')),
  table_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seating Tables
CREATE TABLE seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL DEFAULT 8
);

-- Creative Ideas & Moodboard
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  kind VARCHAR(32) NOT NULL CHECK (kind IN ('theme', 'menu', 'decor', 'entertainment', 'invitations', 'gifts')),
  title VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  est_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  saved BOOLEAN NOT NULL DEFAULT FALSE
);

-- AI Conversation & Proposals
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  proposed_patch JSONB,
  applied_at TIMESTAMPTZ
);

-- Plan Revisions for Undo / Rollback
CREATE TABLE plan_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configuration Tables (Config over constants)
CREATE TABLE event_templates (
  id VARCHAR(64) PRIMARY KEY,
  event_type VARCHAR(32) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  default_budget_split JSONB NOT NULL
);

CREATE TABLE template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(64) NOT NULL REFERENCES event_templates(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL, -- 'task', 'vendor', 'phase'
  title VARCHAR(255) NOT NULL,
  relative_days_before INT NOT NULL,
  phase VARCHAR(64) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE price_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region VARCHAR(64) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  category VARCHAR(64) NOT NULL,
  min_cost NUMERIC(12, 2) NOT NULL,
  max_cost NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(32) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Non-Negotiable Rules & "Nothing Hardcoded" Enforcement

1. **Deterministic Calculations**:
   - `countdownDays`: `Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))`
   - `currencyFormatter`:
     ```ts
     export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
       return new Intl.NumberFormat(locale, {
         style: 'currency',
         currency,
         maximumFractionDigits: 0,
       }).format(amount);
     }
     export function formatLakh(amount: number): string {
       const lakhs = amount / 100000;
       return `₹${lakhs.toFixed(1)}L`;
     }
     ```
2. **Deterministic Budget Rebalancing**:
   - Any LLM budget output is passed to `rebalanceBudget(total, categories)`:
     - Scales planned category amounts to sum exactly to `total`.
     - Preserves pennies/cents without rounding drift by allocating remainder to the largest non-committed category or `Buffer`.
3. **Regional Grounding**:
   - Before prompt construction, `price_benchmarks` is queried for `(region, event_type)`. If rows exist, they are injected into the prompt. If not, the UI marks generated figures with an "AI estimate" badge.
4. **Automated CI Hardcoding Detector**:
   - `scripts/check-hardcoded.ts` scans all `.ts`, `.tsx`, `.js` files in `src/`.
   - Regular expressions reject:
     - Prototype names: `"Riya"`, `"Arjun"`, `"Leela"`, `"Jaipur"`, `"Vikramaditya"` (unless in seed/test paths).
     - Raw currency literals in JSX: `/[₹$€£]\s*\d+/g`.
     - Mock array literals in components.
   - Integrated as `npm run check:hardcoded` and executed in git pre-commit hook via Husky.

---

## 6. AI Architecture & Pipelines

Server-only module in `src/server/ai/`:

### 1. `LLMProvider` Abstraction
```ts
export interface LLMProvider {
  generateStructured<T>(schema: z.ZodSchema<T>, systemPrompt: string, userPrompt: string, opts?: { temperature?: number }): Promise<T>;
  streamText(systemPrompt: string, userPrompt: string): AsyncGenerator<string, void, unknown>;
}
```
- Default: `GeminiProvider` using `@google/genai` (selected when `LLM_PROVIDER=gemini`).

### 2. Pipelines
- **`intake`**:
  - Input: Raw user prompt string.
  - Output: `EventBrief` schema with `isComplete: boolean`, `missingFields: string[]`, `clarifyingQuestions: string[]`.
- **`generatePlan`**:
  - Runs parallel calls for Budget, Timeline, Vendors, and Ideas.
  - Deterministically validates that category sums equal the total budget and timeline due dates are backward-planned from `event_date` (never in the past).
  - Emits Server-Sent Events (SSE) so the client renders progressive shimmer skeletons, then fires `canvas-confetti` upon receiving the final event ID.
- **`revisePlan`**:
  - Input: Current plan snapshot + user natural language instruction (e.g. "Cut catering budget 10% and make decor traditional").
  - Output: `PlanPatch` (typed operations: `setBudgetTotal`, `rebalanceCategory`, `replaceTheme`, `addTask`, `updateVendorQuote`).
  - Computes visual diff on the server: `before` vs `after`.
  - **Apply Action**: Executes patch in a Postgres transaction, updates DB rows, saves snapshot in `plan_revisions`.
  - **Undo Action**: Reverts to previous snapshot from `plan_revisions`.
- **`vendorQuestions`**:
  - Generates bespoke negotiation and contract questions for a vendor given category, event season, and venue constraints.

---

## 7. Folder Structure Blueprint

```
/Users/mukulvyas/Documents/Soirée/
├─ .env.example
├─ .env.local (gitignored)
├─ package.json
├─ tsconfig.json
├─ drizzle.config.ts
├─ tailwind.config.ts
├─ vitest.config.ts
├─ playwright.config.ts
├─ README.md
├─ docs/
│  ├─ PLAN.md                       # This approved plan
│  ├─ DESIGN_MAP.md                 # Stitch screen mapping & tokens
│  └─ design/                       # Downloaded Stitch screenshots
│     ├─ 01_home.png ... 09_save_plan_modal.png
│     └─ html/ (raw Stitch reference HTML)
├─ data/
│  ├─ seed/                         # DB templates (wedding, birthday, community)
│  └─ benchmarks/                   # Regional price benchmarks (Jaipur, Mumbai, Delhi, etc.)
├─ supabase/
│  └─ migrations/                   # SQL migration files generated by Drizzle
├─ scripts/
│  ├─ seed.ts                       # Database seeder for templates & benchmarks
│  └─ check-hardcoded.ts            # CI linter enforcing zero mock data in src/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # Root layout (fonts, providers, dark mode)
│  │  ├─ page.tsx                   # (marketing) Home screen
│  │  ├─ new/page.tsx               # Chat intake flow & generator skeleton
│  │  ├─ events/[id]/
│  │  │  ├─ layout.tsx              # Event layout: TopNav, AskAIFab, BottomTabBar, EventProvider
│  │  │  ├─ page.tsx                # Plan Overview
│  │  │  ├─ assistant/page.tsx      # AI Assistant chat & live preview diff
│  │  │  ├─ budget/page.tsx         # Budget categories, progress & AI tips
│  │  │  ├─ guests/page.tsx         # Guest list, RSVP, seating map
│  │  │  ├─ vendors/page.tsx        # Kanban board & questions drawer
│  │  │  ├─ ideas/page.tsx          # Idea cards & add to plan
│  │  │  └─ timeline/page.tsx       # Full planning timeline vs day-of run sheet
│  │  └─ api/
│  │     ├─ ai/
│  │     │  ├─ intake/route.ts
│  │     │  ├─ generate/route.ts    # SSE streaming route
│  │     │  ├─ revise/route.ts
│  │     │  └─ vendor-questions/route.ts
│  │     ├─ events/[id]/
│  │     │  ├─ route.ts             # Event CRUD
│  │     │  └─ patch/route.ts       # Apply & Undo revisions
│  │     └─ export/
│  │        ├─ pdf/route.ts
│  │        └─ ics/route.ts
│  ├─ components/
│  │  ├─ ui/                        # Button, Dialog, Drawer, Input, Progress, DropdownMenu
│  │  ├─ layout/                    # TopNav, BottomTabBar, Footer, AskAIFab, SavePlanModal
│  │  └─ motion/                    # Reveal, CountUp, ProgressFill, ConfettiBurst, SkeletonShimmer
│  ├─ features/
│  │  ├─ home/                      # HeroPromptBar, EventTypeCard, HowItWorks
│  │  ├─ intake/                    # ChatQuestion, QuickChips, DatePicker, BudgetSlider
│  │  ├─ plan/                      # StatCards, NextStepsList, BudgetDonut
│  │  ├─ assistant/                 # ChatHistory, DiffPreviewAside, ApplyUndoBar
│  │  ├─ budget/                    # BudgetRow, RecommendationCard, RebalanceModal
│  │  ├─ guests/                    # GuestRow, SeatingMap, AddGuestForm, WhatsAppInvite
│  │  ├─ vendors/                   # KanbanColumn, VendorCard, QuestionsDrawer
│  │  ├─ ideas/                     # IdeaGrid, IdeaCard, FilterChips
│  │  └─ auth/                      # SavePlanDialog, GoogleAuthButton
│  ├─ server/
│  │  ├─ ai/
│  │  │  ├─ provider/               # LLMProvider interface & GeminiProvider
│  │  │  ├─ schemas/                # Zod schemas (EventBrief, BudgetPlan, Timeline, PlanPatch)
│  │  │  ├─ prompts/                # Versioned prompt files (intake, generate, revise, questions)
│  │  │  └─ pipelines/              # intakePipeline, generatePipeline, revisePipeline
│  │  ├─ db/
│  │  │  ├─ schema.ts               # Drizzle table schemas
│  │  │  ├─ client.ts               # Supabase + Drizzle client
│  │  │  └─ queries/                # events, budget, tasks, vendors, guests
│  │  ├─ services/                  # budgetMath, dateMath, patchApplier, exportService
│  │  └─ auth/                      # anonymousSession, identityLinking
│  ├─ lib/                          # currency, dateUtils, env, utils
│  ├─ config/                       # copy.ts, nav.ts, featureFlags.ts
│  └─ styles/
│     ├─ tokens.css                 # Stitch tokens
│     └─ globals.css
└─ tests/
   ├─ unit/                         # Math, schemas, deterministic rebalancer
   ├─ e2e/                          # Playwright user flows
   └─ visual/                       # Stitch screenshot regression
```

---

## 8. Phase-by-Phase Execution Plan

### Phase 0: Plan & Design Pull (Current Phase)
- **Objectives**:
  - Connect to Stitch MCP, discover active project (`12473482902747162408`) and inspect all 9 screen assets.
  - Download all visual screenshots to `docs/design/*.png` and HTML bundles to `docs/design/html/*.html`.
  - Extract design tokens into `docs/DESIGN_MAP.md`.
  - Draft `docs/PLAN.md` with complete architecture and stop for user approval.
- **Verification**: User approves `docs/PLAN.md` and `docs/DESIGN_MAP.md`.

---

### Phase 1: Foundation (Scaffold, Tooling, Tokens & Base Layout)
- **Objectives**:
  - Initialize Next.js 15 App Router project with TypeScript strict mode.
  - Setup Tailwind CSS with extracted Stitch tokens (`src/styles/tokens.css`).
  - Configure Google Fonts: `Newsreader` (serif headlines) and `Plus Jakarta Sans` (UI sans).
  - Implement base layout components:
    - `TopNav`: Logo, centered 5 tabs (`Plan`, `Budget`, `Guests`, `Vendors`, `Ideas`) with plum pill, right `Sign in` & avatar.
    - `BottomTabBar`: Responsive mobile tab bar (< 768px).
    - `AskAIFab`: Bottom-right floating sparkle button with page bottom padding (`pb-32`).
    - `Footer`: Dynamic copyright year, terms, privacy.
  - Configure dark mode support using CSS variables.
  - Setup `.env.example` and Zod-based environment validator (`src/lib/env.ts`).
- **Verification**: `npm run lint`, `npm run typecheck`, initial Vitest pass.

---

### Phase 2: Data Layer & Authentication
- **Objectives**:
  - Setup Drizzle ORM schema (`src/server/db/schema.ts`) and generate migrations in `supabase/migrations/`.
  - Enable Postgres RLS on all 12 tables keyed to `owner_id = auth.uid()`.
  - Implement seed script (`scripts/seed.ts`) loading `data/seed/*.json` and `data/benchmarks/*.json`.
  - Implement anonymous authentication flow with cookie persistence.
  - Implement Google OAuth identity linking (`linkIdentity`) in `SavePlanModal`.
  - Add `npm run check:hardcoded` script in `scripts/check-hardcoded.ts`.
- **Verification**: Run migrations, execute `npm run db:seed`, test anonymous session generation and RLS security policies.

---

### Phase 3: AI Core & Pipelines
- **Objectives**:
  - Implement `LLMProvider` interface and `GeminiProvider` using Google GenAI SDK.
  - Define Zod schemas: `EventBriefSchema`, `BudgetPlanSchema`, `TimelineSchema`, `VendorChecklistSchema`, `IdeaSetSchema`, `PlanPatchSchema`.
  - Author versioned prompts in `src/server/ai/prompts/` (intake, generatePlan, revisePlan, vendorQuestions).
  - Implement deterministic `rebalanceBudget` function ensuring exact category sum equality.
  - Implement `generatePlan` pipeline running budget, timeline, vendors, and ideas in parallel with SSE progress streaming.
  - Unit tests for deterministic math, prompt formatting, and schema validation.
- **Verification**: `npm run test` executes unit tests covering budget rebalancing and Zod schemas with 100% pass rate.

---

### Phase 4: Home & Intake Flow
- **Objectives**:
  - Build Home page (`/`):
    - Ambient mesh gradient background.
    - Hero prompt bar with voice mic icon and quick-reply chips ("Wedding in Jaipur", "50th birthday", "Society Diwali mela").
    - 3 celebration cards (`wedding`, `birthday`, `community`) linking to intake.
    - "How it works" 3-step section.
  - Build Intake flow (`/new`):
    - Conversational follow-up questions for missing fields (date, city, guest target, budget, style/culture).
    - Quick-reply chips, calendar date picker pill, budget slider.
    - Generating state: shimmer skeletons and real-time SSE progress indicators.
    - Confetti burst on completion, auto-redirect to `/events/[id]`.
- **Verification**: Test end-to-end plan generation from home input through SSE stream to created event.

---

### Phase 5: Plan Overview & Timeline
- **Objectives**:
  - Build Plan Overview dashboard (`/events/[id]`):
    - Header with event title, countdown days (computed), location, and celebration pill.
    - 4 Stat Cards: Days to go, Confirmed Guests / Target, Committed Budget / Total, Tasks done / total.
    - Next Steps card: Top 3 upcoming tasks with relative due dates and AI tips.
    - Budget Donut card: SVG donut chart, top spending streams, link to full budget.
  - Build Full Timeline page (`/events/[id]/timeline`):
    - Toggle: Planning Milestones vs Day-Of Run Sheet.
    - Chronological milestone list with category pills and completion checkboxes.
- **Verification**: Test both Wedding and Birthday plans to verify that the same data-driven components render correctly with dynamic DB rows.

---

### Phase 6: Budget & AI Assistant
- **Objectives**:
  - Build Budget page (`/events/[id]/budget`):
    - Total vs Committed metric banner.
    - Category list rows with progress bars, spent/planned amounts, and status dots (`optimal`, `near_limit`, `over_budget`, `unused`).
    - AI Recommendation card with "Apply" and "Dismiss" actions.
    - Unallocated buffer reserve card.
  - Build AI Assistant page (`/events/[id]/assistant`):
    - Left column: Chat message stream, typing dots indicator, ambient prompt console with voice button and suggestion chips.
    - Right column: Live preview card showing proposed budget shifts and changed milestones.
    - "Apply to plan" button executing atomic revision and saving `plan_revisions` snapshot.
    - "Undo" button restoring previous plan snapshot.
- **Verification**: Execute revision instruction (e.g. "Cut budget 10%"), verify live diff preview, apply revision, confirm DB updates, test undo.

---

### Phase 7: Guests & Vendors
- **Objectives**:
  - Build Guests page (`/events/[id]/guests`):
    - Status filter chips: Confirmed, Pending, Declined with counts.
    - Search bar filtering by guest name, dietary requirement, or table.
    - Guest rows with party size, relation, dietary tag, and RSVP status.
    - Add Guest modal.
    - WhatsApp invite link generator (`https://wa.me/?text=...`).
    - Seating Plan aside: Visual table capacity cards (e.g. Royal Marigold 8/8, Saffron Terrace 6/8) and AI seating tips.
  - Build Vendors page (`/events/[id]/vendors`):
    - Committed budget tracker.
    - Kanban Board: 4 columns (`Contacted`, `Quoted`, `Confirmed`, `Paid`) with drag/drop or stage switcher.
    - Vendor card: Name, category, quote estimate, call and WhatsApp actions, status badge.
    - Right Drawer: "Questions to ask" generated by AI (`POST /api/ai/vendor-questions`).
- **Verification**: Add guest, update RSVP, assign table; move vendor through Kanban columns; open vendor drawer and verify AI questions.

---

### Phase 8: Ideas & Exports
- **Objectives**:
  - Build Ideas page (`/events/[id]/ideas`):
    - Category filter chips (`All`, `Theme`, `Menu`, `Decor`, `Music`, `Gifts`).
    - Idea cards: Photography/art preview, kind tag, title, cost-saving reasoning, heart favorite toggle, "Add to plan" action.
  - Implement Exports:
    - `/api/export/pdf`: Server-rendered printable summary of budget, timeline, and vendors.
    - `/api/export/ics`: Generates downloadable `.ics` calendar file with all planning milestones and run sheet timings.
    - WhatsApp Share: Formats summary text and share link.
- **Verification**: Save ideas, download ICS file (verify in calendar app), test PDF export route.

---

### Phase 9: Motion, Mobile & Polish Pass
- **Objectives**:
  - Motion refinement: Card staggered entrances, count-up animations on stat cards, progress bar fill transitions, smooth modal fades.
  - Mobile responsiveness pass: Validate layouts at 390px (iPhone viewport); verify bottom tab bar, 44px touch targets, sticky FAB repositioning.
  - Empty, loading, and error states across all routes in matching glassmorphic aesthetic.
  - PWA manifest (`manifest.json`), service worker registration, apple-touch-icons.
  - Accessibility audit: keyboard focus rings, semantic landmark tags, AA contrast ratios.
- **Verification**: Run browser subagent at 1440px and 390px viewports; verify reduced motion toggle.

---

### Phase 10: QA, Hardcoding Check & Handover
- **Objectives**:
  - Run `npm run check:hardcoded` across `src/` to guarantee zero sample names or hardcoded numbers.
  - Run complete test suite: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`.
  - Visual comparison against Stitch screenshots (`docs/design/*.png`).
  - Document setup steps, environment configuration, and demo script in `README.md`.
- **Verification**: Clean clone test with fresh database seed; all automated checks passing.

---

## 9. Key Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **LLM Output Formatting / Hallucination** | High: Invalid JSON could crash generation or break budget sums | Strict Zod validation on all LLM outputs; max 2 automated retries on failure; deterministic post-processing function (`rebalanceBudget`) forces category amounts to sum exactly to total. |
| **Anonymous Session Loss** | High: User creates plan, refreshes, and loses event | `@supabase/ssr` cookies store anonymous session ID; Supabase `linkIdentity` connects Google OAuth to existing `owner_id` without re-creating rows. |
| **Hardcoded Data Leakage** | Medium: Violation of core requirements | Dedicated AST/regex linter `npm run check:hardcoded` in pre-commit hook and CI script fails build if mock strings or currency literals appear in JSX. |
| **Mobile Layout Cramping** | Medium: Data-dense tables fail on 390px screens | Stitch desktop 12-column layouts collapse to single-column vertical cards; top navigation converts to 5-tab bottom bar; horizontal scrolling for Kanban columns. |
| **Rate Limits on Gemini API** | Medium: Multiple parallel generation calls could throttle | Server pipeline uses request throttling and concurrency limits; local fallback mock provider available in development via `LLM_PROVIDER=mock`. |

---

## 10. Open Questions for User Approval

1. **Supabase Setup**: Do you have an active Supabase project URL and anon key ready for `.env.local`, or should we initialize with local Supabase CLI / mock configuration during Phase 1 & 2?
2. **Gemini API Key**: Is your `GEMINI_API_KEY` configured in your local environment, or would you like us to ensure the fallback mock provider is fully functional for initial pipeline tests?
3. **PDF Export Engine**: Do you prefer `@react-pdf/renderer` (pure JS, faster serverless runtime) or a Playwright headless print route (exact CSS/browser fidelity)?
