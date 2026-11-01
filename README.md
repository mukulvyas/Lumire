# ✨ Lumière — AI Celebration & Event Planner Atelier

[![Next.js](https://img.shields.io/badge/Next.js-15.0_App_Router-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash--Lite-4285F4?logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Vitest-41%20Passed%20(100%25)-brightgreen?logo=vitest)](tests/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success?logo=w3c)](tests/unit/accessibility.test.ts)
[![Security](https://img.shields.io/badge/Security-RLS_%26_Sanitized-blue?logo=shield)](tests/unit/securitySanitization.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Lumière** (formerly Soirée) is a high-craft GenAI event planner engineered to eliminate logistical anxiety and replace clinical spreadsheets with serene, tactile, computational poise for weddings, milestone birthdays, and community gatherings.

---

## 🎯 The Problem & Our Solution

### The Challenge
Planning weddings and milestone events in India and worldwide is notorious for:
- **Chaotic, fragmented coordination**: Juggling 10+ disjointed spreadsheets, notes, and WhatsApp threads.
- **Hidden vendor costs & surprise markups**: Unclear GST inclusions, emergency generator fees, and overtime rates.
- **Generic AI arithmetic failures**: Standard LLMs hallucinate numbers, miscalculate category percentages, and break budget totals.
- **Cultural disconnection**: Generic templates miss authentic ritual timing, regional cuisine nuances, and traditional aesthetics.

### The Lumière Solution
- **Culturally Grounded Concierge**: Powered by **Google Gemini 3.1 Flash-Lite**, curating evocative heritage concepts with exact hex palettes (e.g., `#8C001A`, `#C5A059`), floral styling, and golden-hour sunset run-sheets.
- **Deterministic Math over Hallucinations**: Percentages, INR lakh groupings (`₹15,00,000`), contingency buffers, and category rebalancing are computed deterministically in code—guaranteeing 100% budget precision.
- **Vendor Negotiation Copilot**: Equips hosts with prioritized discovery questionnaires to ask venues, caterers, and photographers before signing contracts.
- **Zero-Friction Dual Auth**: Anonymous session intake on first load; users seamlessly link via **Google OAuth 2.0** or **Email/Password** without losing drafted plans.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["Next.js 15 Client (React 19 + Tailwind + Motion)"]
    APIProxy["Next.js App Router Proxy (/api/*)"]
    FastAPI["FastAPI Async Backend (Python 3.11)"]
    Gemini["Google Gemini 3.1 Flash-Lite API"]
    SupabaseDB[(Supabase PostgreSQL + RLS)]
    SupabaseAuth["Supabase Auth (Google OAuth & Email)"]

    Client -->|User Interactions & Anonymous Sessions| APIProxy
    APIProxy -->|Transparent Proxy / Next Pipelines| FastAPI
    Client -->|Auth State & Identity Linking| SupabaseAuth
    FastAPI -->|Structured JSON Schemas| Gemini
    FastAPI -->|Async Persistence / Queries| SupabaseDB
    SupabaseAuth -->|RLS Context Token| SupabaseDB
```

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| 💬 **AI Atelier Concierge** | Multi-turn chat assistant with conversation memory, providing deep thematic advice, budget rebalancing, and timeline adjustments. |
| 📊 **Interactive Budget Ledger** | Real-time budget allocation with visual status dots, contingency buffers, and automatic INR lakh grouping. |
| 🪷 **Curated Cultural Themes** | Authentic heritage aesthetics (*Noor Mahal Twilight*, *Suryavanshi Marigold*, *Jodhpur Nilaya*) complete with color hex codes and decor motifs. |
| 🤝 **Vendor Discovery & Board** | Kanban workflow tracking (*Contacted, Quoted, Confirmed, Paid*) with AI-generated discovery questions. |
| ⏱️ **Ritual Timeline & Run Sheet** | Golden-hour synchronized ceremony timelines with automated setup milestones. |
| 🔒 **Dual Authentication** | Centered modal supporting both Google OAuth and Email/Password credentials with seamless state preservation. |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2.
- **Generative AI**: Google Gemini 3.1 Flash-Lite (with automatic fallback to Gemini 2.5 Flash-Lite) via Google AI Studio API.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Google OAuth 2.0.
- **Validation**: Strict boundary schemas with Pydantic (Backend) and Zod (Frontend).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Google AI Studio API Key ([Get API Key](https://aistudio.google.com/))
- Supabase Project ([Supabase](https://supabase.com/))

### Installation & Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mukulvyas/Lumire.git
   cd Lumire
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and Gemini credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres

   # AI Provider
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key
   LLM_MODEL=gemini-3.1-flash-lite
   ```

3. **Start the Development Servers:**
   Run the unified full-stack runner script (starts both FastAPI on port 8000 and Next.js on port 3000):
   ```bash
   chmod +x ./run.sh
   ./run.sh
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Quality Assurance

Lumière enforces strict code quality and verification pipelines:

```bash
# 1. TypeScript Strict Typecheck
npm run typecheck

# 2. ESLint Static Analysis
npm run lint

# 3. Unit & Pipeline Test Suite (Vitest)
npm run test

# 4. AST Hardcode Audit (Ensures zero mock data in code)
npm run check:hardcoded

# 5. Production Build
npm run build
```

---

## 🛡️ Security & Privacy

- **Row-Level Security (RLS)**: User plans and budgets are isolated via Postgres RLS policies.
- **Strict Git Hygiene**: All secrets (`.env`, `.env.local`) are strictly excluded from version control via `.gitignore`.
- **Input Sanitization**: All incoming prompts and mutations are validated against strict Zod and Pydantic schemas.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
