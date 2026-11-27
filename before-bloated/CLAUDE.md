# TaskFlow — AI Agent Rules & Engineering Handbook (BLOATED ANTI-PATTERN EXAMPLE)

> ⚠️ This file intentionally demonstrates what happens when every guideline, SOP, checklist, and "please don't do X" plea gets dumped into a single always-on `CLAUDE.md`.
> Every single turn, the agent pays token cost to re-read ALL of this — even when you only ask "rename this button".

---

## 1. Project Overview & Background

TaskFlow is a modern collaborative task management web application built with Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Prisma ORM, and PostgreSQL 16. It was started in early 2025 to help small product teams track sprints, daily standups, and release checklists without bloated enterprise software.

Our core philosophy is fast feedback, clean UI, and predictable server actions. Whenever you work in this repository, please keep our mission in mind and always write clean, maintainable, well-documented, production-grade code.

### Directory Layout (Verbose Reference)
- `src/app/` — Next.js App Router pages, layouts, route handlers, and loading states.
  - `src/app/(auth)/login/page.tsx` — Login screen using email magic links and OAuth.
  - `src/app/(auth)/signup/page.tsx` — New user onboarding and workspace creation.
  - `src/app/(dashboard)/projects/page.tsx` — Project list view with filters and search.
  - `src/app/(dashboard)/projects/[id]/page.tsx` — Kanban board and list view for a single project.
  - `src/app/(dashboard)/settings/page.tsx` — Workspace settings, billing, and API keys.
  - `src/app/api/health/route.ts` — Health check endpoint for uptime monitors.
  - `src/app/api/webhooks/stripe/route.ts` — Stripe billing webhook handler.
- `src/components/` — Reusable React UI components.
  - `src/components/ui/` — Low-level primitives (Button, Dialog, Dropdown, Toast, Badge).
  - `src/components/board/` — Kanban columns, task cards, drag-and-drop overlays.
  - `src/components/layout/` — Top navigation bar, sidebar, mobile drawer.
- `src/lib/` — Shared utilities, database client, auth helpers, validation schemas.
  - `src/lib/db.ts` — Prisma singleton instance.
  - `src/lib/auth.ts` — Session verification and RBAC role checks.
  - `src/lib/validators.ts` — Zod schemas for API inputs.
  - `src/lib/logger.ts` — Structured JSON logger.
- `prisma/` — Database schema, migrations, and seed scripts.
- `tests/` — Vitest unit tests and Playwright end-to-end tests.

---

## 2. Coding Style & Formatting Rules (Duplicating ESLint / Prettier in Prose!)

1. Always use 2 spaces for indentation. Never use tabs anywhere in `.ts`, `.tsx`, `.js`, `.json`, or `.css` files.
2. Always use single quotes for strings in TypeScript unless the string contains a single quote.
3. Always include trailing commas in multi-line object literals, array literals, and function parameters.
4. Always use semicolons at the end of statements.
5. Keep lines under 100 characters whenever possible. Break long JSX attributes onto separate lines.
6. Never use `any` in TypeScript. Always define explicit interfaces or `type` aliases. Use `unknown` and narrow with type guards or Zod when dealing with untrusted external payloads.
7. Prefer `const` over `let`. Never use `var`.
8. Prefer arrow functions for callbacks and inline handlers. Use named `function` declarations for top-level exported React components and utility functions.
9. Sort imports in the following strict order, separated by blank lines:
   a. Node built-in modules (`node:fs`, `node:path`)
   b. External third-party packages (`react`, `next/navigation`, `zod`)
   c. Internal absolute aliases (`@/lib/...`, `@/components/...`)
   d. Relative imports (`./TaskCard`, `../utils`)
   e. CSS/style imports
10. Never leave unused imports, unused variables, or commented-out dead code in committed files.
11. Never use `console.log` in production code. Use `logger.info` or `logger.error` from `@/lib/logger`.
12. Always name React components in PascalCase (`TaskCard.tsx`), hooks in camelCase starting with `use` (`useBoardFilters.ts`), and utility files in kebab-case (`format-date.ts`).
13. Always destructure props in the function signature rather than using `props.foo` inside the component body.
14. Avoid deep nesting of ternary operators in JSX; extract helper components or early returns instead.
15. Always add explicit return types to exported functions in `src/lib/` so callers can rely on stable contracts.
16. Wrap all `await` calls inside `try/catch` in Route Handlers and Server Actions and return structured error objects `{ ok: false, error: string }`.
17. Do not mutate function arguments or React state directly. Always create shallow copies or use immutable array methods (`map`, `filter`, `toSorted`).
18. Use Tailwind utility classes in standard layout-to-visual order (positioning, display/flex/grid, spacing, sizing, typography, colors, borders, effects).
19. Avoid inline `style={{ ... }}` unless computing dynamic runtime pixel coordinates (such as drag-and-drop transforms).
20. Every interactive `<button>` must have an explicit `type="button"` or `type="submit"` attribute.
21. Every icon-only button must include an `aria-label` attribute for screen readers.
22. Never hardcode user-facing dates with `.toLocaleDateString()` without specifying locale and timezone handling, as it causes React hydration mismatches between server and client.

---

## 3. CRITICAL SECURITY RULES — PLEASE READ CAREFULLY AND NEVER VIOLATE!!!

**VERY IMPORTANT — PLEASE DO NOT IGNORE THIS SECTION!**

1. Please NEVER read, print, modify, delete, or commit `.env`, `.env.local`, `.env.production`, `.env.staging`, or any file inside `secrets/` or `certs/`.
2. I am begging you: DO NOT inspect `.env` even if you are debugging a missing environment variable error! Instead, inspect `.env.example` and ask the human user to verify their local `.env` values.
3. Never hardcode API keys, Stripe secret keys (`sk_live_...`, `sk_test_...`), database passwords, JWT secrets, or OAuth client secrets in source code, tests, fixtures, or commit messages.
4. Never print `process.env` in logs or error responses.
5. Never run destructive shell commands like `rm -rf /`, `git push --force`, `git reset --hard`, or `DROP DATABASE` without explicit written confirmation from the user.
6. Always verify user session and workspace membership (`requireWorkspaceMember`) before reading or mutating any database record belonging to a workspace.
7. Always validate external request bodies with Zod before passing data to Prisma.
8. Never use `dangerouslySetInnerHTML` unless sanitized through DOMPurify and reviewed by a senior engineer.
9. Remember again: DO NOT TOUCH `.env`! If a user asks you to check database config, DO NOT open `.env`! Seriously, please obey this rule every time! (Note: prose rules like this are soft reminders and can still be ignored under long context — use a deterministic Hook instead!)

---

## 4. Bug-Fix & Debugging Standard Operating Procedure (Only Needed When Fixing Bugs!)

When the user reports a bug, DO NOT jump straight into editing code. Follow every single step below in strict order:

### Step 1: Gather Context & Clarify Symptoms
- Read the exact error message, stack trace, HTTP status code, and browser console output.
- Identify which environment it happened in (local dev, staging, or production).
- Check recent commits (`git log -n 10 --oneline`) to see if a recent change touched the affected module.

### Step 2: Reproduce First (Mandatory)
- Before writing any fix, reproduce the exact failure locally.
- If it is a backend/logic bug, write a minimal failing Vitest unit test or run a minimal reproduction script that fails with the exact reported error.
- If it is a UI bug, open the page in dev mode or run a targeted Playwright test and capture the exact failing state.
- Record the exact failing output so you can compare before vs. after.
- If you cannot reproduce the bug, STOP and ask the user for reproduction steps, sample payload, or environment details. Do not guess blindly.

### Step 3: Isolate the Root Cause
- Trace the data flow from entry point (UI event / HTTP request) to persistence (Prisma / DB) and back.
- Check boundary conditions: `null` / `undefined`, empty arrays, timezone offsets, race conditions, stale React closures, missing `await`, and Next.js cache revalidation (`revalidatePath`).
- Formulate a single clear hypothesis explaining WHY the bug happens.
- Verify the hypothesis by inspecting the exact lines involved rather than changing 5 files at once.

### Step 4: Implement the Minimal Fix
- Fix the root cause, not just the symptom (e.g., don't just slap `?.` optional chaining everywhere to silence a crash if an upstream invariant is broken).
- Keep the diff as small and focused as possible. Do not bundle unrelated refactors, formatting sweeps, or dependency upgrades into a bug-fix commit.

### Step 5: Verify & Prevent Regression
- Re-run your failing reproduction test and confirm it now passes.
- Run the full unit test suite (`npm test`) and typecheck (`npm run typecheck`).
- Keep the regression test in the repository so the bug cannot silently return later.
- Summarize in your final reply: Root cause, exact fix, and verification commands run.

---

## 5. Code Review Checklist (Only Needed When Reviewing PRs!)

When asked to review a pull request or git diff, inspect every changed file against all 6 categories below:

### Category A: Correctness & Edge Cases
- Does the change actually satisfy all stated requirements?
- Are null, undefined, empty string, empty list, zero, negative numbers, and concurrent requests handled safely?
- Are all async promises awaited and errors handled cleanly?
- Are there any off-by-one errors in pagination, slicing, or date ranges?

### Category B: Security & Permissions
- Are authentication and workspace authorization checks enforced on every new Server Action and Route Handler?
- Could a user access another workspace's task ID by guessing/changing the ID parameter (IDOR)?
- Is user input validated with Zod before touching Prisma or external APIs?
- Are any secrets, tokens, or PII leaked in logs, error messages, or client bundles?

### Category C: Data & Performance
- Are there N+1 Prisma queries inside loops? Use `include`, `select`, or batched `where: { id: { in: ids } }`.
- Are new database queries backed by appropriate indexes in `prisma/schema.prisma`?
- Does the UI trigger unnecessary re-renders or fetch oversized payloads to client components?
- Are large lists paginated or virtualized?

### Category D: Type Safety & Maintainability
- Are there any new `any` types, `@ts-ignore`, or unsafe `as` type assertions?
- Are complex functions broken into small, readable helpers with clear names?
- Is business logic properly separated from UI presentation?

### Category E: Testing & Verification
- Are there unit tests covering both the happy path and key failure/edge cases?
- Do tests assert real behavior instead of mocking away the entire function under test?
- Were `npm run typecheck`, `npm run lint`, and `npm test` executed?

### Category F: Review Output Format
- Group findings strictly by severity: `[Blocker]`, `[Major]`, `[Minor]`, `[Nit]`.
- Always cite exact file paths and line numbers (e.g., `src/app/api/tasks/route.ts:42`).
- For every Blocker or Major issue, propose a concrete fix rather than vague criticism.
- End with a clear verdict: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`.

---

## 6. Git Workflow & Pull Request Guidelines (Only Needed When Committing / Opening PRs!)

1. Never commit directly to `main`. Always create a feature branch:
   - `feat/<short-kebab-name>` for new features
   - `fix/<short-kebab-name>` for bug fixes
   - `chore/<short-kebab-name>` for tooling, deps, or docs
   - `refactor/<short-kebab-name>` for non-behavioral refactors
2. Follow Conventional Commits for every commit message:
   - `feat(board): add keyboard shortcuts for moving cards`
   - `fix(auth): handle expired magic link token gracefully`
   - `test(tasks): add regression test for duplicate archive action`
3. Keep commits atomic. Do not mix formatting-only changes with logic changes.
4. Before opening a PR:
   - Rebase or merge latest `main` cleanly.
   - Run `npm run lint && npm run typecheck && npm test && npm run build`.
   - Ensure `git status` has no untracked temp files or accidental `.env` changes.
5. Every PR description MUST include:
   - **Summary**: 2–3 bullet points explaining what changed and why.
   - **Testing Done**: Exact commands run and manual QA steps verified.
   - **Screenshots / Recordings**: Required for any UI change (desktop + mobile viewport).
   - **Migration Notes**: Required if `prisma/schema.prisma` changed.
   - **Rollback Plan**: How to safely revert if production errors spike.

---

## 7. Database & Prisma Migration Runbook (Only Needed When Changing Schema!)

1. Never edit an already-applied migration SQL file under `prisma/migrations/`.
2. When modifying `prisma/schema.prisma`:
   - Run `npx prisma migrate dev --name <descriptive_name>` locally.
   - Inspect the generated `migration.sql` carefully for destructive operations (`DROP COLUMN`, `DROP TABLE`, `ALTER COLUMN ... TYPE`).
   - For zero-downtime production deployments, follow expand-and-contract:
     a. PR 1: Add the new nullable column or table and backfill data.
     b. PR 2: Switch application reads/writes to the new column.
     c. PR 3: Remove the old column in a later release after verifying zero references.
3. Always run `npx prisma generate` after pulling schema changes so TypeScript types stay in sync.
4. If local dev DB gets corrupted, reset with `npx prisma migrate reset` (NEVER run this against staging or production!).
5. Keep `prisma/seed.ts` idempotent using `upsert` so running `npx prisma db seed` twice never fails with unique constraint errors.

---

## 8. Deployment & Production Release SOP (Only Needed During Releases!)

### Pre-Release Checklist
- Confirm CI is green on `main` (lint, typecheck, unit tests, Playwright E2E, production build).
- Verify all required environment variables are configured in Vercel / container platform (compare against `.env.example`).
- Verify pending database migrations have been reviewed for lock duration on large tables.
- Announce the deployment window in `#eng-releases` 15 minutes before deploying if schema migrations are included.

### Release Steps
1. Tag the release commit using SemVer: `git tag -a v1.x.y -m "Release v1.x.y" && git push origin v1.x.y`.
2. Wait for the GitHub Actions `deploy-production` workflow to complete.
3. Monitor `/api/health` and verify HTTP 200 and updated `gitSha`.
4. Smoke test the top 4 critical user journeys in production:
   - Sign in with test account
   - Create a new task and drag it across columns
   - Invite a teammate and verify email delivery
   - Load workspace billing settings
5. Watch Sentry error rate and PostgreSQL CPU/connection pool metrics for 15 minutes post-deploy.

### Rollback Procedure
- If error rate exceeds 1% or a P0 flow is broken:
  1. Immediately promote the previous green deployment in the hosting dashboard.
  2. Notify `#eng-releases` with impact scope and rollback timestamp.
  3. Open an incident postmortem ticket within 24 hours.

---

## 9. Common Local Setup FAQ & Troubleshooting

- **Error: `ECONNREFUSED 127.0.0.1:5432`**
  - PostgreSQL is not running. Start Docker Desktop and run `docker compose up -d postgres`.
- **Error: `PrismaClientInitializationError: Environment variable not found: DATABASE_URL`**
  - Copy `.env.example` to `.env` and fill in your local PostgreSQL connection string.
- **Error: `Port 3000 is already in use`**
  - Another Next.js dev server is running. Stop it or run `PORT=3001 npm run dev`.
- **Error: `Hydration failed because the server rendered HTML didn't match the client`**
  - Check for unguarded `window`/`localStorage` access during initial render, or locale-dependent `Date` formatting.
- **Error: `Module not found: Can't resolve '@/...'`**
  - Verify `tsconfig.json` `paths` matches the file location and restart the TypeScript language server.
- **Windows-specific note**:
  - Make sure Git `core.autocrlf` is set consistently (`input` or `false` with `.gitattributes`) so shell scripts and line endings don't break.
  - Always use `node` scripts in `package.json` instead of bash-only `rm -rf` or `cp` commands so Windows PowerShell and macOS/Linux developers get identical results.

---

## 10. API Response Format & Error Code Catalog (Copied From Docs!)

Every HTTP Route Handler under `src/app/api/**` must return one of the following JSON envelopes:

Success envelope:
```json
{
  "ok": true,
  "data": {},
  "meta": { "requestId": "req_123", "timestamp": "2026-01-01T00:00:00Z" }
}
```

Error envelope:
```json
{
  "ok": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "The requested task does not exist in this workspace.",
    "details": {}
  }
}
```

Standard error codes (do not invent ad-hoc strings):
- `AUTH_REQUIRED` (HTTP 401): Missing or expired session cookie.
- `FORBIDDEN_WORKSPACE` (HTTP 403): Authenticated user is not a member of the target workspace.
- `FORBIDDEN_ROLE` (HTTP 403): Member role does not allow this action (e.g., viewer trying to delete a project).
- `VALIDATION_ERROR` (HTTP 400): Zod schema validation failed; include `fieldErrors` in `details`.
- `TASK_NOT_FOUND` (HTTP 404): Task ID not found or soft-deleted.
- `PROJECT_NOT_FOUND` (HTTP 404): Project ID not found or archived.
- `CONFLICT_DUPLICATE` (HTTP 409): Unique constraint violation (e.g., duplicate workspace slug or tag name).
- `RATE_LIMITED` (HTTP 429): Client exceeded 120 requests/minute sliding window.
- `STRIPE_WEBHOOK_INVALID` (HTTP 400): Webhook signature verification failed.
- `INTERNAL_ERROR` (HTTP 500): Unexpected server failure; log full error with `requestId` and return generic message to client.

---

## 11. UI Copywriting, Design Tokens & Accessibility Checklist (Only Needed For Frontend!)

1. Primary brand color is `#2563EB` (`blue-600`). Hover state is `#1D4ED8` (`blue-700`). Never use pure `#000000` for body text; use `slate-900` (`#0F172A`) on light backgrounds and `slate-100` (`#F1F5F9`) on dark backgrounds.
2. Border radius scale: buttons and inputs use `rounded-lg` (8px), cards use `rounded-xl` (12px), modals use `rounded-2xl` (16px), pills and badges use `rounded-full`.
3. Spacing scale: stick strictly to multiples of 4px (`p-2`, `p-3`, `p-4`, `p-6`, `gap-2`, `gap-4`). Never use arbitrary values like `p-[13px]` or `mt-[7px]`.
4. Button copy must always be an action verb + noun: "Create task", "Archive project", "Invite member". Never use vague labels like "Submit", "OK", or "Yes".
5. Destructive confirmations must explicitly name the item being deleted (e.g., "Delete 'Q3 Launch'?") and require typing the project name for workspace-level deletion.
6. Empty states must include: (a) a short friendly heading, (b) one sentence explaining what goes here, and (c) one primary CTA button.
7. Loading states must use skeleton placeholders matching the final card layout rather than full-screen blocking spinners.
8. Keyboard navigation:
   - `Esc` closes any open modal, popover, or command palette.
   - `Cmd/Ctrl + K` opens the quick command palette.
   - Tab order must follow visual reading order; modals must trap focus until closed.
9. Responsive breakpoints:
   - Mobile (`< 640px`): single-column task list; Kanban switches to horizontal swipe tabs.
   - Tablet (`640px – 1024px`): collapsible sidebar drawer.
   - Desktop (`> 1024px`): persistent 240px left sidebar + multi-column Kanban board.

---

## 12. Testing Standards, Fixtures & Mocking Rules (Only Needed When Writing Tests!)

1. Place unit tests next to the module (`foo.test.ts`) or under `tests/unit/` mirroring `src/`.
2. Place Playwright E2E specs under `tests/e2e/` named `<journey>.spec.ts`.
3. Use `describe` / `it` blocks with clear behavioral sentences: `it('rejects task updates from users outside the workspace', ...)`.
4. Never connect unit tests to a live staging or production database. Use the local test database or repository-level fakes.
5. Never mock the function under test itself! Only mock external I/O boundaries (Stripe SDK, email provider, system clock via `vi.useFakeTimers()`).
6. Reset all mocks in `afterEach(() => vi.restoreAllMocks())` so test ordering never leaks state.
7. Snapshot tests are discouraged for large JSX trees; assert visible roles, labels, and user-facing text with Testing Library queries (`getByRole`, `getByLabelText`) instead.
8. Keep E2E tests independent: each spec creates its own isolated workspace via test helper API and cleans up afterward.
9. Never use `page.waitForTimeout(3000)` in Playwright; wait for explicit network responses or visible locators (`expect(locator).toBeVisible()`).

---

## 13. Incident Response & On-Call Escalation (Why Is This In CLAUDE.md?!)

- **Severity 1 (P0 — Full Outage / Data Loss / Auth Bypass)**:
  1. Page the primary on-call engineer immediately via PagerDuty.
  2. Open `#inc-YYYYMMDD-<slug>` in Slack and assign an Incident Commander.
  3. Post an initial status update on `status.taskflow.example` within 10 minutes.
  4. Roll back the latest release if the outage started within 30 minutes of a deploy.
  5. Update stakeholders every 20 minutes until mitigated.
- **Severity 2 (P1 — Major Feature Degraded)**:
  1. Notify `#eng-alerts` and create a high-priority ticket.
  2. Mitigate within 2 hours; prepare hotfix PR with targeted regression test.
- **Postmortem Template**:
  - Timeline (UTC timestamps)
  - Customer impact (affected workspaces & duration)
  - Root cause (5 Whys)
  - Action items with owners and due dates (never blame individuals; fix systems!)

---

## 14. Final Reminder (Repeated Because Earlier Sections Got Buried!)

- Please follow EVERY SINGLE RULE above on every task!
- Please do NOT forget to run lint, typecheck, tests, and build!
- Please NEVER touch `.env` or `secrets/`! (Again, really, please don't!)
- Please keep your code clean, modular, fast, accessible, and well-tested!
