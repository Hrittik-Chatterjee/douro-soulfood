#!/usr/bin/env node
/**
 * verify-hours.mjs — asserts that every `settings.hours[]` row authored in
 * Keystatic is machine-readable, so the site's `openingHoursSpecification`
 * actually describes all seven days.
 *
 * `src/lib/hours.ts` deliberately DOESN'T throw on an unrecognised day label: a
 * content-editor typo ("Montga") must not be able to fail the build and take the
 * site offline. The cost of that choice is that a typo would silently drop a day
 * from the structured data while still rendering for humans.
 *
 * This check is how that silence gets broken — loudly, in CI, where it's our
 * problem rather than the client's.
 *
 * Usage: pnpm check:hours
 * (imports a .ts module, so it needs Node's --experimental-strip-types)
 */
import { readFileSync } from 'node:fs';
import { dayIndexFromLabel, parseHours } from '../../src/lib/hours.ts';

const SETTINGS = 'src/content/settings/default.json';
const settings = JSON.parse(readFileSync(SETTINGS, 'utf-8'));
const rows = settings.hours ?? [];

const problems = [];

if (rows.length === 0) problems.push('no `hours` rows at all — the site would advertise no opening hours');

const { entries, unmapped } = parseHours(rows);

for (const row of unmapped) {
  problems.push(
    `unrecognised day label ${JSON.stringify(row.day)} — omitted from openingHoursSpecification. ` +
      `Add it to DAY_INDEX_BY_LABEL in src/lib/hours.ts, or fix the typo in ${SETTINGS}.`,
  );
}

for (const entry of entries) {
  if (!entry.closed && entry.ranges.length === 0) {
    problems.push(`${entry.rawLabel}: time ${JSON.stringify(entry.rawTime)} has no parseable range`);
  }
}

const seen = new Set();
for (const entry of entries) {
  if (seen.has(entry.dayIndex)) problems.push(`${entry.rawLabel}: duplicate day`);
  seen.add(entry.dayIndex);
}
for (let day = 1; day <= 7; day += 1) {
  if (!seen.has(day)) {
    const names = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };
    problems.push(`${names[day]} is missing — crawlers can't tell if it's closed or merely unlisted`);
  }
}

console.log(`${rows.length} hours row(s) in ${SETTINGS}; ${entries.length} mapped, ${unmapped.length} unmapped.`);
for (const entry of entries) {
  const detail = entry.closed ? 'closed' : entry.ranges.map((r) => `${r.opens}-${r.closes}`).join(', ');
  console.log(`  ${entry.dayIndex} ${entry.rawLabel.padEnd(12)} ${detail}`);
}

if (problems.length > 0) {
  console.log(`\nFAIL: ${problems.length} problem(s) with the authored opening hours:`);
  for (const problem of problems) console.log(`  • ${problem}`);
  process.exit(1);
}

console.log('\nPASS: every day maps to a schema.org DayOfWeek and parses.');
