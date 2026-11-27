#!/usr/bin/env node
// Cross-platform PreToolUse hook (Windows / macOS / Linux, Node >= 18, zero deps).
// Reads tool-call JSON from stdin; exits 2 to block access to sensitive files.

import { readFileSync } from 'node:fs';

const raw = readFileSync(0, 'utf8').trim();
const payload = raw ? JSON.parse(raw) : {};
const input = payload.tool_input ?? payload;
const target = String(input.file_path ?? input.path ?? input.command ?? '').replace(/\\/g, '/');

const isAllowedExample = /(^|\/)\.env\.(example|sample|template)$/i.test(target);
const isSensitive =
  !isAllowedExample &&
  /(^|\/)(\.env(\.[^/\s"']+)?|secrets\/|certs\/|id_rsa|credentials\.json|[^/\s"']+\.(pem|key))($|\/|\s|["'])/i.test(target);

if (isSensitive) {
  console.error(`[HOOK BLOCKED] Sensitive file access denied: "${target}". Inspect .env.example or ask the user instead.`);
  process.exit(2);
}
