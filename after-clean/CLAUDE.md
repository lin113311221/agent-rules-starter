# TaskFlow — Always-On Project Rules

> **Rule of thumb**: Keep this file **under 100 lines**.
> Put task-specific SOPs in `.claude/skills/` and hard safety gates in `hooks/`.

## 1. Tech Stack & Commands
- **Stack**: Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Prisma · PostgreSQL 16
- **Local dev**: `npm run dev` (requires local Postgres via `docker compose up -d postgres`)
- **Verify** (run before finishing any code change):
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build` (required when touching routes, build config, or `prisma/schema.prisma`)

## 2. Repository Map
- `src/app/` — App Router pages, Server Actions, and API Route Handlers
- `src/components/` — UI primitives (`ui/`) and feature components (`board/`, `layout/`)
- `src/lib/` — Prisma client (`db.ts`), auth/RBAC (`auth.ts`), Zod schemas (`validators.ts`), logger (`logger.ts`)
- `prisma/` — `schema.prisma`, migrations (never edit applied SQL), and idempotent `seed.ts`
- `tests/` — Vitest unit tests (`tests/unit/`) & Playwright E2E tests (`tests/e2e/`)

## 3. Always-On Engineering Invariants
- **Type safety**: No `any`; validate all external inputs with Zod before touching Prisma.
- **AuthZ**: Every Server Action and Route Handler must call `requireWorkspaceMember()` to prevent cross-tenant access (IDOR).
- **API & errors**: Use `@/lib/logger` (no `console.log` in app code); return structured `{ ok, data | error }` envelopes.
- **Minimal diff**: Solve the task with the smallest clean change; do not bundle unrelated refactors or formatting sweeps.
- **Formatting**: Delegate style rules to ESLint/Prettier (`npm run lint`) — never restate formatter rules in this file.
- **Cross-platform**: Keep scripts Node-based (`node ...`) so Windows PowerShell, macOS, and Linux behave identically.

## 4. Git & PR Conventions
- Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`; never commit directly to `main`.
- Commit messages: Conventional Commits (`feat(board): ...`, `fix(auth): ...`).
- Never leave untracked temp files or accidental `.env` edits in `git status`.

## 5. Safety Boundaries (Enforced by Hook)
- Never read, edit, print, or commit `.env*`, `secrets/`, or private keys (inspect `.env.example` instead).
- Hard enforcement lives in `hooks/block-sensitive-files.mjs` (copy `.claude/settings.example.json` → `.claude/settings.json` to enable).
- Never run destructive commands (`git push --force`, `git reset --hard`, `prisma migrate reset` on shared DBs) without explicit approval.

## 6. On-Demand Skills & Subagents (0 Boot Token Cost)
- **Code review / PR audit** → `.claude/skills/code-review/SKILL.md`
- **Bug fixing & debugging** → `.claude/skills/bug-fix/SKILL.md`
- **Heavy / noisy exploration** → Delegate large codebase scans or verbose test logs to a Subagent and return a concise summary.
