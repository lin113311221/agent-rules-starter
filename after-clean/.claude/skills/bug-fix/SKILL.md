---
name: bug-fix
description: Repro-first 3-step debugging SOP. Load only when investigating or fixing a bug, crash, or regression.
---

# Bug-Fix SOP (Repro-First, 3 Steps)

Do not edit production code before reproducing the failure.

## Step 1: Reproduce First
- Capture the exact error message, stack trace, or failing UI state.
- Write a minimal failing test (`npm test -- <file>`) or small repro script that fails with the exact reported error.
- If you cannot reproduce it, stop and ask the user for repro steps or sample input.

## Step 2: Isolate & Fix Root Cause
- Trace data flow from entry point (UI/HTTP) → validation → Prisma/DB → response.
- Check common culprits: `null`/`undefined`, stale closures, missing `await`, timezone/hydration drift, missing `revalidatePath`.
- Apply the **smallest fix** at the root cause (no drive-by refactors or symptom-masking `?.` bands).

## Step 3: Verify & Lock In Regression Test
- Confirm the failing test now passes.
- Run `npm run typecheck && npm run lint && npm test`.
- Keep the regression test in the repo and report: **Root cause**, **Fix**, and **Verification run**.
