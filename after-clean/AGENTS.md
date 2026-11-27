# TaskFlow — Portable Agent Rules (AGENTS.md)

> Cross-agent equivalent of `CLAUDE.md` for **Codex, Cursor, Gemini CLI, and other AGENTS.md-compatible tools**.
> **Rule of thumb**: Keep this file **under 100 lines** — always-on facts only; push specialized SOPs into skills.

## 1. Tech Stack & Verification Commands
- **Stack**: Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Prisma · PostgreSQL 16
- **Local dev**: `npm run dev` (requires local Postgres via `docker compose up -d postgres`)
- **Verification suite** (run before declaring code changes done):
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build` (when changing routes, build config, or `prisma/schema.prisma`)

## 2. Project Layout
- `src/app/` — Next.js App Router pages, Server Actions, and API Route Handlers
- `src/components/` — Reusable UI primitives (`ui/`) and feature components (`board/`, `layout/`)
- `src/lib/` — Database client (`db.ts`), auth/RBAC (`auth.ts`), Zod validators (`validators.ts`), logger (`logger.ts`)
- `prisma/` — Database schema, migrations (never edit applied SQL), and idempotent `seed.ts`
- `tests/` — Vitest unit tests (`tests/unit/`) and Playwright E2E tests (`tests/e2e/`)

## 3. Core Invariants (Always Apply)
- **Strict TypeScript**: Avoid `any`; validate untrusted request payloads with Zod before database writes.
- **Workspace isolation**: Every Server Action and API route must enforce `requireWorkspaceMember()` to prevent cross-tenant access (IDOR).
- **Observability**: Use `@/lib/logger` instead of `console.log`; return structured `{ ok, data | error }` results.
- **Focused diffs**: Keep changes minimal and scoped to the request; leave formatting to `npm run lint`.
- **Cross-platform**: Prefer portable Node scripts over bash-only commands so Windows, macOS, and Linux stay consistent.

## 4. Git & PR Conventions
- Never commit directly to `main`; use `feat/<slug>`, `fix/<slug>`, or `chore/<slug>` branches.
- Follow Conventional Commits (`feat(board): ...`, `fix(auth): ...`).
- Keep `git status` clean of temporary files and sensitive configs.

## 5. Safety Guardrails
- Never read, modify, print, or commit `.env*`, `secrets/`, or credential files (inspect `.env.example` instead).
- When your client supports pre-tool hooks, wire `hooks/block-sensitive-files.mjs` as a deterministic gate.
- Never execute destructive git or database commands (`git push --force`, `git reset --hard`, `DROP TABLE`) without explicit user confirmation.

## 6. On-Demand Workflows (Read Only When Needed)
- **Reviewing code or PRs** → read `.claude/skills/code-review/SKILL.md`
- **Investigating & fixing bugs** → read `.claude/skills/bug-fix/SKILL.md`
- **Large codebase scans / noisy test logs** → isolate in a subagent and return a concise summary.
