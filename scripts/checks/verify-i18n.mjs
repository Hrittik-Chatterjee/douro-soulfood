#!/usr/bin/env node
/**
 * verify-i18n.mjs — turns "no locale ships until it's fully translated" from
 * a policy into a red build.
 *
 * `LIVE_LOCALES` (src/lib/i18n/locales.ts) is the single gate that decides
 * whether a locale is live. This script is what makes that gate trustworthy:
 * for every live locale other than the default, it requires a dictionary file
 * with 100% `UIKey` coverage — a live locale one key short of complete would
 * otherwise silently fall back to German for that one string in production,
 * with no build signal at all.
 *
 * It also asserts the registry itself is internally consistent (no duplicate
 * locale codes, DEFAULT_LOCALE is actually live), since those are exactly the
 * kind of copy-paste mistakes a hand-edited registry invites.
 *
 * Usage: pnpm check:i18n
 * (imports .ts modules, so it needs Node's --experimental-strip-types)
 */
import { existsSync } from 'node:fs';
import { DEFAULT_LOCALE, LIVE_LOCALES, LOCALE_REGISTRY } from '../../src/lib/i18n/locales.ts';
import { deAT } from '../../src/lib/i18n/messages/de-AT.ts';

const problems = [];
const REQUIRED_KEYS = Object.keys(deAT);

const codes = LOCALE_REGISTRY.map((l) => l.code);
const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
if (duplicates.length > 0) {
  problems.push(
    `LOCALE_REGISTRY has duplicate locale code(s): ${[...new Set(duplicates)].join(', ')}`,
  );
}

if (!LIVE_LOCALES.includes(DEFAULT_LOCALE)) {
  problems.push(
    `DEFAULT_LOCALE ("${DEFAULT_LOCALE}") is not in LIVE_LOCALES — the default locale must be live.`,
  );
}

for (const locale of LIVE_LOCALES) {
  if (locale === DEFAULT_LOCALE) continue; // de-AT.ts IS the type source; trivially complete.

  const path = `src/lib/i18n/messages/${locale}.ts`;
  if (!existsSync(path)) {
    problems.push(`"${locale}" is in LIVE_LOCALES but ${path} does not exist.`);
    continue;
  }

  const mod = await import(`../../${path}`);
  const dict = mod[locale.replace(/[^a-zA-Z0-9]/g, '')] ?? mod.default;
  if (!dict || typeof dict !== 'object') {
    problems.push(`${path} exists but doesn't export a recognizable dictionary object.`);
    continue;
  }

  const missing = REQUIRED_KEYS.filter((k) => !(k in dict) || String(dict[k]).trim() === '');
  if (missing.length > 0) {
    problems.push(
      `"${locale}" is in LIVE_LOCALES but ${path} is missing ${missing.length}/${REQUIRED_KEYS.length} key(s): ${missing.join(', ')}`,
    );
  }
}

console.log(
  `Checked ${LOCALE_REGISTRY.length} registry entr${LOCALE_REGISTRY.length === 1 ? 'y' : 'ies'}, ${LIVE_LOCALES.length} live (${LIVE_LOCALES.join(', ')}).`,
);

if (problems.length > 0) {
  console.log(`\nFAIL: ${problems.length} i18n problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}

console.log('\nPASS: every live locale has complete UI-string coverage.');
