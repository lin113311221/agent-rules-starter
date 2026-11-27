#!/usr/bin/env node
// Zero-dependency rules auditor (Windows / macOS / Linux, Node >= 18).
// Usage:
//   node scripts/audit-rules.mjs before-bloated
//   node scripts/audit-rules.mjs after-clean
//   node scripts/audit-rules.mjs before-bloated after-clean

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const MAX_BOOT_LINES = 100;
const MAX_BOOT_TOKENS = 1500;

function estimateTokens(text) {
  // Heuristic: CJK characters ~1.5 tokens each; ASCII/other ~1 token per 4 chars.
  const cjkMatches = text.match(/[\u3000-\u9fff\uf900-\ufaff]/g) || [];
  const cjkCount = cjkMatches.length;
  const nonCjkCount = Math.max(0, text.length - cjkCount);
  return Math.ceil(cjkCount * 1.5 + nonCjkCount / 4);
}

function measureFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.length === 0 ? 0 : content.split(/\r?\n/).length;
  const chars = content.length;
  const tokens = estimateTokens(content);
  return { filePath, lines, chars, tokens };
}

function findSkills(dirPath) {
  const skillsDir = join(dirPath, '.claude', 'skills');
  if (!existsSync(skillsDir)) return [];
  const results = [];
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const skillFile = join(skillsDir, entry.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        results.push(measureFile(skillFile));
      }
    }
  }
  return results;
}

function auditTarget(targetArg) {
  const absTarget = resolve(process.cwd(), targetArg);
  if (!existsSync(absTarget)) {
    console.error(`Error: Path not found -> ${targetArg}`);
    process.exit(1);
  }

  const stat = statSync(absTarget);
  let primary = null;
  let portable = null;
  let skills = [];
  let hasHook = false;

  if (stat.isFile()) {
    primary = measureFile(absTarget);
  } else {
    const claudePath = join(absTarget, 'CLAUDE.md');
    const agentsPath = join(absTarget, 'AGENTS.md');
    if (existsSync(claudePath)) {
      primary = measureFile(claudePath);
      if (existsSync(agentsPath)) portable = measureFile(agentsPath);
    } else if (existsSync(agentsPath)) {
      primary = measureFile(agentsPath);
    }
    skills = findSkills(absTarget);
    hasHook = existsSync(join(absTarget, 'hooks', 'block-sensitive-files.mjs'));
  }

  if (!primary) {
    console.error(`Error: No CLAUDE.md or AGENTS.md found in ${targetArg}`);
    process.exit(1);
  }

  const pass = primary.lines <= MAX_BOOT_LINES && primary.tokens <= MAX_BOOT_TOKENS;
  const verdict = pass ? 'PASS' : 'BLOATED';

  return { targetArg, absTarget, primary, portable, skills, hasHook, verdict };
}

function printReport(report) {
  const relPrimary = relative(process.cwd(), report.primary.filePath).replace(/\\/g, '/');
  console.log(`\n=== Audit: ${report.targetArg} ===`);
  console.log(`  Boot file   : ${relPrimary}`);
  console.log(`  Boot lines  : ${report.primary.lines} (target: <= ${MAX_BOOT_LINES})`);
  console.log(`  Boot chars  : ${report.primary.chars}`);
  console.log(`  Boot tokens : ~${report.primary.tokens} tokens/session (target: <= ${MAX_BOOT_TOKENS})`);

  if (report.portable) {
    const relPortable = relative(process.cwd(), report.portable.filePath).replace(/\\/g, '/');
    console.log(`  Portable eq : ${relPortable} (${report.portable.lines} lines, ~${report.portable.tokens} tokens, not double-loaded)`);
  }

  if (report.skills.length > 0) {
    const skillTokens = report.skills.reduce((sum, s) => sum + s.tokens, 0);
    console.log(`  Skills      : ${report.skills.length} on-demand skill(s) (~${skillTokens} tokens offloaded, 0 boot cost)`);
  } else {
    console.log(`  Skills      : 0 (all SOPs stuffed into boot file)`);
  }

  console.log(`  Safety hook : ${report.hasHook ? 'YES (deterministic PreToolUse gate)' : 'NO (prose reminders only)'}`);
  console.log(`  Verdict     : ${report.verdict}`);
}

function printComparison(before, after) {
  const lineDiff = before.primary.lines - after.primary.lines;
  const linePct = ((lineDiff / before.primary.lines) * 100).toFixed(1);
  const tokenDiff = before.primary.tokens - after.primary.tokens;
  const tokenPct = ((tokenDiff / before.primary.tokens) * 100).toFixed(1);

  console.log('\n=== Before vs. After Savings ===');
  console.log(`  Lines saved  : ${before.primary.lines} -> ${after.primary.lines} (-${lineDiff} lines, -${linePct}%)`);
  console.log(`  Tokens saved : ~${before.primary.tokens} -> ~${after.primary.tokens} (-${tokenDiff} tokens/boot, -${tokenPct}%)`);
}

const args = process.argv.slice(2);
const targets = args.length === 0 ? ['before-bloated', 'after-clean'] : args;
const reports = targets.map(auditTarget);

for (const report of reports) {
  printReport(report);
}

if (reports.length >= 2) {
  printComparison(reports[0], reports[1]);
}
console.log('');
