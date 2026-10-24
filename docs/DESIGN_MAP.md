# Soirée — Stitch Design Map & Token Specifications

This document defines the mapping from Google Stitch designs (Project: `12473482902747162408`, *Soirée AI Event Planner*, Theme: *Luminous Celebration Atelier*) to production Next.js App Router routes, typed React components, data sources, and design tokens.

---

## 1. Stitch Project & Screen Discovery

### Active Project Metadata
- **Project Resource**: `projects/12473482902747162408`
- **Title**: *Soirée AI Event Planner*
- **Theme Name**: *Luminous Celebration Atelier*
- **Primary Fonts**: `Newsreader` (Editorial Serif Headlines), `Plus Jakarta Sans` (Instrumental Modern Sans UI)
- **Primary Color**: `#5b2a86` / `#430d6e` (Deep Royal Plum)
- **Secondary Color**: `#ff6b6b` (Coral Blossom)
- **Tertiary Color**: `#f5b94a` / `#ffdeab` (Champagne Gold)
- **Success Color**: `#3DDC97` (Mint Leaf)
- **Base Surface**: `#fff8f3` (Warm Alabaster / Paper Vellum)
- **Dark Mode Base**: `#1a1024` (Deep Night Aubergine)

### Visual Design References Downloaded
All reference screenshots have been captured directly via Stitch MCP and stored in `docs/design/`:
1. `docs/design/01_home.png` (Home Screen)
2. `docs/design/02_plan_overview_wedding.png` (Plan Overview — Wedding)
3. `docs/design/03_plan_overview_birthday.png` (Plan Overview — Birthday)
4. `docs/design/04_ai_assistant.png` (AI Assistant & Live Patch Preview)
5. `docs/design/05_budget.png` (Budget Ledger & Rebalancing)
6. `docs/design/06_guests.png` (Guest Management & Seating Map)
7. `docs/design/07_vendors.png` (Vendor Kanban & Questions Drawer)
8. `docs/design/08_ideas.png` (Inspiration Grid & Save to Plan)
9. `docs/design/09_save_plan_modal.png` (Save Plan Modal / Google Linking)

Raw HTML/CSS bundles are stored in `docs/design/html/*.html`.

---

## 2. Screen & Route Mapping Table

| # | Stitch Screen Name | Stitch Screen ID | Route | Primary Components | Data Sources & Calculations |
|---|---|---|---|---|---|
| 1 | **Home** | `47e7f42c75b54b07afa8bc3b2cbd626c` | `/` | `HeroPromptBar`, `EventTypeSelector`, `HowItWorksSteps`, `SocialProofPill`, `AmbientMeshBackground` | • User prompt / speech input<br>• Static templates in DB (`event_templates`)<br>• Local storage / anonymous session id |
| 2 | **Intake (Follow-ups)** | *Derived from Stitch prompt & chat patterns* | `/new` | `IntakeChatConversation`, `QuickReplyChips`, `DatePickerPill`, `BudgetSliderCard`, `GeneratingShimmerModal`, `ConfettiBurst` | • `POST /api/ai/intake`<br>• `POST /api/ai/generate` (SSE streaming)<br>• DB transaction into `events`, `budget_categories`, `tasks`, `vendors`, `ideas` |
| 3 | **Plan Overview (Wedding)** | `90753f7522be4b4e9df82568281fcd0b` | `/events/[id]` | `EventHeaderPill`, `PlanStatCards` (Days, Guests, Budget, Tasks), `NextStepsMilestonesList`, `BudgetDonutSummaryCard`, `AskAIFab` | • `events` table (title, date, city)<br>• Computed countdown: `differenceInDays(event_date, today)`<br>• `guests` confirmed count / guest_target<br>• `budget_categories` sum(committed) vs total_budget<br>• `tasks` completed vs total count<br>• Top 3 upcoming incomplete tasks |
| 4 | **Plan Overview (Birthday)** | `c66bb8c86a1c425f99223e08a01b61aa` | `/events/[id]` | *Same components as above, parameterized by `event.type = 'birthday'`* | • Validates multi-event type adaptability (same components, zero hardcoded wedding strings) |
| 5 | **AI Assistant** | `094c466a61f8470ba26ae429242b0f64` | `/events/[id]/assistant` | `AssistantChatHistory`, `ChatBubbleUser`, `ChatBubbleAI`, `DiffListCard`, `LivePreviewAside` (Budget preview bar, Changed milestones list), `ApplyPatchButton`, `UndoPatchButton`, `QuickSuggestionsDock`, `AssistantPromptBar` | • `ai_messages` table (history)<br>• `POST /api/ai/revise`<br>• Computed diff preview<br>• `plan_revisions` snapshots on Apply/Undo |
| 6 | **Budget** | `bbbb547557af42fc8c60b1775f4fe027` | `/events/[id]/budget` | `BudgetHeaderStats` (Total vs Committed), `BudgetCategoryRow` (icon, name, spent/planned, progress bar, status dot), `AiRecommendationCard` (Apply/Dismiss), `UnallocatedBufferCard` | • `budget_categories` table<br>• Deterministic rebalancing logic<br>• `price_benchmarks` grounding<br>• Category status: `optimal`, `near_limit`, `over_budget`, `unused` |
| 7 | **Guests** | `d0e9ccb01eb04d65995b19908b2ae631` | `/events/[id]/guests` | `GuestStatusChips` (Confirmed, Pending, Declined), `GuestSearchBar`, `GuestListTable`, `GuestAvatarPill`, `AddGuestModal`, `WhatsAppInviteTrigger`, `SeatingPlanAside` (Table cards, seating progress, AI seating tip) | • `guests` table<br>• `seating_tables` table<br>• Dynamic stats: confirmed/target, percentage seated<br>• WhatsApp pre-filled invite link generator |
| 8 | **Vendors** | `9003a23df01a4279a69bc99d5e7fbb8e` | `/events/[id]/vendors` | `VendorSummaryHeader` (committed vs total), `VendorKanbanBoard` (Contacted, Quoted, Confirmed, Paid), `VendorCard` (tags, quote, tel, whatsapp, status), `AddVendorModal`, `VendorQuestionsDrawer` (AI generated checklist) | • `vendors` table<br>• `vendor_questions` table<br>• `POST /api/ai/vendor-questions`<br>• Drag-and-drop or status selector for Kanban stages |
| 9 | **Ideas** | `1342d3ecb0d44093b2e87d9b36ca9724` | `/events/[id]/ideas` | `IdeasFilterChips` (All, Theme, Menu, Decor, Music, Favors), `IdeaCard` (image, kind badge, title, cost-saving reason, heart favorite, "Add to plan" action) | • `ideas` table<br>• Server action: `toggleFavoriteIdea`, `addIdeaToPlan` (converts idea into task or vendor quote) |
| 10 | **Save Plan Modal** | `8aca836f279b49d59fd826763fb1495b` | *Global Modal Dialog* | `SavePlanModal`, `CelebrationMarkIllustration`, `GoogleSignInButton`, `MaybeLaterDismissButton` | • Supabase Auth: `linkIdentity` with Google OAuth<br>• Anonymous `owner_id` persists without data loss |
| 11 | **Full Timeline & Run Sheet** | *Derived from Plan Overview timeline link* | `/events/[id]/timeline` | `TimelineViewToggle` (Planning Milestones vs Day-Of Run Sheet), `TimelinePhasesList`, `TimelineMilestoneItem`, `RunSheetSchedule` | • `tasks` table grouped by `phase`<br>• `run_sheet_items` table (start_time, end_time, title, details)<br>• Export ICS trigger (`/api/export/ics`) |

---

## 3. Design Tokens & CSS Variables

Tokens are extracted directly from Stitch project CSS and Tailwind theme:

```css
:root {
  /* Brand Primaries */
  --color-primary: #430d6e;
  --color-primary-container: #5b2a86;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #cf9afd;
  --color-primary-fixed: #f1daff;
  --color-primary-fixed-dim: #dfb7ff;

  /* Brand Accents */
  --color-secondary: #ae2f34;
  --color-secondary-container: #ff6b6b; /* Coral Blossom */
  --color-on-secondary: #ffffff;
  --color-secondary-fixed: #ffdad8;

  /* Gold & Warm Accents */
  --color-tertiary: #3e2900;
  --color-tertiary-container: #5a3e00;
  --color-tertiary-fixed: #ffdeab;
  --color-tertiary-fixed-dim: #f9bc4d; /* Champagne Gold */

  /* Semantic Feedback */
  --color-success: #3ddc97; /* Mint Leaf */
  --color-warning: #f5b94a;
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;

  /* Neutrals & Surfaces (Warm Paper/Vellum) */
  --color-surface: #fff8f3; /* Champagne Blush / Alabaster */
  --color-surface-dim: #dfd9d4;
  --color-surface-bright: #fff8f3;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f9f2ed;
  --color-surface-container: #f3ede8;
  --color-surface-container-high: #eee7e2;
  --color-surface-container-highest: #e8e1dc;

  /* Text & Inks */
  --color-on-surface: #1d1b18;
  --color-on-surface-variant: #4c4450;
  --color-outline: #7d7481;
  --color-outline-variant: #cec3d2;

  /* Glassmorphism & Elevation */
  --glass-bg-card: rgba(255, 255, 255, 0.78);
  --glass-border-card: rgba(91, 42, 134, 0.08);
  --glass-blur-card: blur(20px);
  --shadow-elevation-1: 0 8px 32px -4px rgba(91, 42, 134, 0.06), 0 2px 8px -2px rgba(91, 42, 134, 0.03);
  --shadow-elevation-2: 0 16px 40px -8px rgba(91, 42, 134, 0.10), 0 4px 12px -2px rgba(91, 42, 134, 0.04);
  --shadow-elevation-3: 0 24px 64px -12px rgba(45, 21, 66, 0.18);

  /* Radii */
  --radius-sm: 0.5rem;   /* 8px */
  --radius-md: 1rem;     /* 16px */
  --radius-lg: 1.5rem;   /* 24px - standard card */
  --radius-xl: 2rem;     /* 32px - modals & prompt bars */
  --radius-full: 9999px; /* Pill buttons, tags, search bars */

  /* Typography */
  --font-serif: 'Newsreader', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* Dark Mode Tokens */
.dark {
  --color-surface: #1a1024; /* Deep Night Aubergine */
  --color-surface-dim: #140b1d;
  --color-surface-bright: #241830;
  --color-surface-container-lowest: #140b1d;
  --color-surface-container-low: #1e1329;
  --color-surface-container: #261b33;
  --color-surface-container-high: #2f233d;
  --color-surface-container-highest: #3b2e4b;

  --color-on-surface: #f7f2fa;
  --color-on-surface-variant: #cec3d2;
  --color-outline: #978e9c;

  --glass-bg-card: rgba(255, 255, 255, 0.06);
  --glass-border-card: rgba(255, 255, 255, 0.12);
  --shadow-elevation-1: 0 8px 32px -4px rgba(0, 0, 0, 0.45);
  --shadow-elevation-2: 0 16px 40px -8px rgba(0, 0, 0, 0.55);
}
```

---

## 4. Known Corrections Applied on Top of Stitch Markup

1. **Top Navigation Consolidation**:
   - Stitch screens had inconsistent headers.
   - **Fix**: Standardized single TopNav fixed at top (`h-20`). Left: Logo linking to `/`, Center: 5 navigation tabs (`Plan`, `Budget`, `Guests`, `Vendors`, `Ideas`) with active tab styled in deep plum pill (`#5b2a86`), Right: `Sign in` link and guest avatar. No "Home" tab inside the event planner view.
2. **Floating "Ask AI" FAB**:
   - Fixed at `bottom: 24px; right: 24px; z-50` with plum background, gold sparkle icon, and hover elevation.
   - All page layouts have `pb-32` (~128px bottom padding) so the FAB never obstructs tabular data, action buttons, or footer links.
3. **Bottom Tab Bar on Mobile (< 768px)**:
   - On screens < 768px, the top nav tabs are hidden and replaced with a fixed bottom tab bar (height `64px`, 5 items: Plan, Budget, Guests, Vendors, Ideas, 44px minimum tap targets).
   - "Ask AI" docks gracefully above the mobile bottom tab bar (`bottom: 80px`).
4. **Plain-English Labeling**:
   - Replaced all jargon from early iterations ("Atelier Guarantee", "Celebration Architecture", "Curated Curation", "AI Concierge Deck") with clean, friendly English ("Your budget", "Next steps", "AI assistant", "How it works").
5. **Dynamic Data Agreement**:
   - Every metric shown across cards (e.g. ₹14.2L committed of ₹15.0L budget, 132/150 guests, 116 days to go) is calculated from the active DB rows in real time.
6. **No Overflow / Text Wrapping**:
   - Long vendor names use `break-words` and `truncate` gracefully without clipping.
   - Currency numbers use `tabular-nums` and responsive typography (`text-title-lg sm:text-headline-sm`).
