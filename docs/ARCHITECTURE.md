# Lumière System Architecture & Engineering Specifications

This document outlines the software architecture, design patterns, and engineering principles implemented in Lumière for Challenge 5 (Celebration & Event Planner).

---

## 1. High-Level Architectural Model

Lumière is engineered with a **Four-Tier Clean Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Presentation Tier (Next.js 15 App Router + React 19)     │
│    - Responsive Mobile Drawer & Floating Concierge          │
│    - Interactive Kanban Board (Vendor Lifecycle)            │
│    - Accessible Semantic UI (WCAG 2.1 AA Compliant)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Client / Server Boundary
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Domain & Application Service Tier                         │
│    - Deterministic Indian Fiscal Engine (budgetMath.ts)      │
│    - Date, Milestone & Currency Formatters (formatters.ts)  │
│    - Strict Zod Input/Output Contract Validation            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Async Streaming / SSE
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Generative AI Orchestration Tier                          │
│    - Google Gemini 1.5 & 2.5 Flash SDK Integration          │
│    - Multi-Turn Cultural AI Concierge with History Memory    │
│    - City-Specific Regional Benchmarks (Delhi, Jaipur, Goa) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Row Level Security (RLS)
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Data Persistence Tier (Supabase PostgreSQL + Drizzle ORM)│
│    - Tenant-Isolated User Records (auth.uid() = owner_id)   │
│    - Anonymous Celebrant Token Handshake                    │
│    - Automated Migrations & Zero Data Loss Design           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Code Quality & Maintainability Principles

### 2.1 Deterministic Math vs. LLM Hallucinations
Generative AI models are inherently non-deterministic and prone to calculation drift. In Lumière:
- **Rule**: No mathematical calculation (sums, percentages, rebalancing, date countdowns) is delegated to an LLM.
- **Implementation**: The AI models generate qualitative insights (themes, ritual narratives, menu concepts), while pure TypeScript routines (`rebalanceBudget`, `formatLakh`, `calculatePercentage`) execute the arithmetic.
- **Result**: Exactly ₹15,00,000 stays ₹15,00,000 across every view and category reallocation.

### 2.2 Modular Separation of Concerns
- **`src/features/`**: Feature-first domain modules (`plan`, `budget`, `guests`, `vendors`, `ideas`, `assistant`, `intake`). Each domain encapsulates its own components, actions, and state.
- **`src/server/`**: Server-only database queries, Drizzle schemas, Supabase clients, and AI pipelines.
- **`src/lib/`**: Generic, deterministic utility functions with zero side-effects.
- **`tests/unit/`**: Isolated unit test suites exercising business rules without external dependencies.

### 2.3 Strict Typing & Zero Dead Code
- TypeScript configured in strict mode (`"strict": true` in `tsconfig.json`).
- Zero implicit `any` types.
- Complete linting rules enforced via ESLint with zero warnings.
- Continuous Integration (`.github/workflows/ci.yml`) runs strict type checking, linting, and automated tests on every push.

---

## 3. Security & Reliability

- **Row Level Security (RLS)**: PostgreSQL tables enforce `owner_id = auth.uid()`.
- **Zero Secrets Leakage**: `GEMINI_API_KEY` and service credentials reside exclusively on the server.
- **Automated Sanitization**: Markdown output is parsed via safe tokenization with HTML entity neutralization.
- **Graceful Fallbacks**: If external API quotas are constrained, deterministic offline generators construct complete plans so celebrants are never stranded.

---

## 4. Verification Suite

Lumière maintains **50 automated test cases**:
- **41 Vitest Tests**: Unit tests covering budget rebalancing, lakh formatting, schema validation, touch targets, and contrast ratios.
- **9 Pytest Tests**: Backend asynchronous API pipeline validation.
- **100% CI Pipeline**: GitHub Actions automation passing on every push.
