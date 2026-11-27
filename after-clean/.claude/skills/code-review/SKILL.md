---
name: code-review
description: Structured code review checklist for pull requests and git diffs. Load only when reviewing code changes or auditing a PR.
---

# Code Review Checklist (On-Demand)

Inspect changed files across five areas and report only actionable findings:

1. **Correctness & Edge Cases**
   - Handles `null`, `undefined`, empty collections, concurrent calls, and error paths.
   - Async operations are awaited; Next.js cache revalidation is called after mutations.
2. **Security & Permissions**
   - Every Server Action / Route Handler enforces `requireWorkspaceMember()` (no IDOR).
   - Untrusted payloads are validated with Zod before touching Prisma.
   - Zero secrets, tokens, or `process.env` dumps in code, logs, or client bundles.
3. **Data & Performance**
   - No N+1 Prisma queries inside loops; large lists are paginated.
   - No unnecessary client-side payload bloat or redundant re-renders.
4. **Type Safety & Maintainability**
   - No new `any`, `@ts-ignore`, or unsafe casts; diff stays scoped to the task.
5. **Verification**
   - Unit tests cover happy path + key failure cases; `typecheck`, `lint`, and `test` pass.

## Output Format
- Group findings by `[Blocker]`, `[Major]`, `[Minor]`, `[Nit]` with `file:line` citations and concrete fixes.
- End with one clear verdict: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`.
