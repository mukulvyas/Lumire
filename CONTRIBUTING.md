# Contributing to Lumière ✨

Thank you for your interest in contributing to Lumière! We welcome contributions to enhance code quality, architecture, cultural intelligence, and test coverage.

## Architecture Guidelines

Lumière follows a strict **Layered Clean Architecture**:
1. **Presentation Layer (`src/features/`, `src/components/`)**:
   - Clean UI components utilizing atomic Tailwind utility classes.
   - Zero hardcoded mock literals or magic numbers.
   - Full keyboard accessibility and WCAG 2.1 AA landmark compliance.
2. **Domain Service Layer (`src/server/services/`, `src/lib/`)**:
   - Pure, deterministic calculation functions (e.g. `budgetMath.ts`, `formatters.ts`).
   - 100% test coverage with Vitest.
3. **AI Orchestration Layer (`src/server/ai/pipelines/`, `backend/app/services/`)**:
   - Google Gemini 1.5 & 2.5 Flash SDK integrations.
   - Structured JSON schema validation with Zod.
   - Fallback error handling ensuring the user is never blocked.
4. **Data Persistence (`src/server/db/`, `supabase/`)**:
   - Supabase PostgreSQL with strict Row Level Security (RLS) policies.

## Development Workflow

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Quality Audits**:
   Ensure all checks pass before pushing code:
   ```bash
   npm run ci
   ```
   This automatically verifies:
   - `check:hardcoded`: Ensures zero hardcoded mock names or literals.
   - `lint`: ESLint rules pass with zero warnings.
   - `typecheck`: TypeScript compiler (`tsc --noEmit`) passes with zero errors.
   - `test`: All 41+ Vitest tests pass.

## Code Style & Formatting

- Prettier is configured with 2-space indentation, single quotes, and 100-character line width.
- Use explicit TypeScript return types on public APIs.
- Document all core algorithms with JSDoc annotations (`@param`, `@returns`).
