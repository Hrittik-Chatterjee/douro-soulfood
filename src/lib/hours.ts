/**
 * hours.ts — the single place that understands the free-text opening-hours
 * strings authored in Keystatic (`settings.hours[]`).
 *
 * WHY THIS EXISTS
 * ---------------
 * `settings.hours[].day` holds German labels ("Montag".."Sonntag") and `.time`
 * holds either a human range ("11:00 – 22:00", note the EN DASH) or the literal
 * word "Geschlossen". Two things previously depended on parsing that by hand:
 *
 *  1. The homepage "today's hours" widget matched `Intl.DateTimeFormat('de-AT',
 *     {weekday:'long'})` output against `day` as a raw string. That silently
 *     produces nothing the moment the formatting locale isn't German — no
 *     error, just a stale label.
 *  2. schema.org `openingHoursSpecification` needs `https://schema.org/Monday`
 *     and 24h `opens`/`closes` values, which "Montag" / "11:00 – 22:00" are not.
 *
 * Normalising once, here, lets the widget and the structured data derive from
 * the same parse — so the visible summary and the machine-readable hours can
 * never disagree.
 *
 * RESILIENCE
 * ----------
 * A content editor owns this data. An unrecognised day label or an unparseable
 * time must NEVER fail the build — a typo like "Montga" would take the whole
 * site down. Unrecognised entries are reported via `unmapped` (surfaced by
 * `scripts/checks/verify-hours.mjs`) and omitted from the structured data, while
 * the raw label still renders for human visitors.
 */

/** ISO-8601 day numbering: Monday = 1 … Sunday = 7. */
export type DayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TimeRange {
  /** 24h `HH:MM`, as schema.org expects. */
  opens: string;
  closes: string;
}

export interface HoursEntry {
  dayIndex: DayIndex;
  closed: boolean;
  ranges: TimeRange[];
  /** The label exactly as authored, for display. */
  rawLabel: string;
  /** The time string exactly as authored, for display. */
  rawTime: string;
}

export interface ParsedHours {
  entries: HoursEntry[];
  /** Rows whose `day` couldn't be mapped — a CMS typo, not a crash. */
  unmapped: { day: string; time: string }[];
}

/** schema.org DayOfWeek IRIs, indexed by ISO day number. */
const SCHEMA_DAY: Record<DayIndex, string> = {
  1: 'https://schema.org/Monday',
  2: 'https://schema.org/Tuesday',
  3: 'https://schema.org/Wednesday',
  4: 'https://schema.org/Thursday',
  5: 'https://schema.org/Friday',
  6: 'https://schema.org/Saturday',
  7: 'https://schema.org/Sunday',
};

/**
 * German day labels → ISO index. Long forms plus the common abbreviations a
 * content editor might type. Keys are pre-normalised (see `normalizeLabel`).
 */
const DAY_INDEX_BY_LABEL: Record<string, DayIndex> = {
  montag: 1, mo: 1, mon: 1,
  dienstag: 2, di: 2, die: 2,
  mittwoch: 3, mi: 3, mit: 3,
  donnerstag: 4, do: 4, don: 4,
  freitag: 5, fr: 5, fre: 5,
  samstag: 6, sa: 6, sam: 6, sonnabend: 6,
  sonntag: 7, so: 7, son: 7,
};

/** Lowercase, strip trailing dots/whitespace. Tolerates "Mo." and " Montag ". */
function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\.+$/, '');
}

export function dayIndexFromLabel(label: string): DayIndex | undefined {
  return DAY_INDEX_BY_LABEL[normalizeLabel(label)];
}

/**
 * True when the row means "not open". Matches the German and English words
 * rather than only the exact literal `'Geschlossen'`, so "geschlossen",
 * "Closed" and "zu" all behave.
 */
export function isClosedLabel(time: string): boolean {
  return /geschlossen|closed|\bzu\b|ruhetag/i.test(time.trim());
}

/**
 * Extracts 24h ranges from a human string. Handles the EN DASH actually present
 * in the data, plus hyphen, em dash and "bis"; splits multiple ranges on comma
 * or "&" so a future split lunch/dinner service parses without a code change.
 * Accepts `9:00`, `09:00` and `9.00`.
 */
export function parseRanges(time: string): TimeRange[] {
  if (isClosedLabel(time)) return [];

  return time
    .split(/[,&]|\bund\b/i)
    .map((chunk) => {
      const match = chunk.match(
        /(\d{1,2})[:.](\d{2})\s*(?:[–—-]|bis)\s*(\d{1,2})[:.](\d{2})/i,
      );
      if (!match) return undefined;
      const [, oh, om, ch, cm] = match;
      const pad = (h: string) => h.padStart(2, '0');
      return { opens: `${pad(oh)}:${om}`, closes: `${pad(ch)}:${cm}` };
    })
    .filter((r): r is TimeRange => r !== undefined);
}

export function parseHours(hours: { day: string; time: string }[]): ParsedHours {
  const entries: HoursEntry[] = [];
  const unmapped: { day: string; time: string }[] = [];

  for (const row of hours) {
    const dayIndex = dayIndexFromLabel(row.day);
    if (dayIndex === undefined) {
      unmapped.push(row);
      continue;
    }
    const ranges = parseRanges(row.time);
    entries.push({
      dayIndex,
      // A row with no parseable range is treated as closed even if it doesn't
      // literally say so — "—" or an empty value shouldn't advertise hours.
      closed: isClosedLabel(row.time) || ranges.length === 0,
      ranges,
      rawLabel: row.day,
      rawTime: row.time,
    });
  }

  entries.sort((a, b) => a.dayIndex - b.dayIndex);
  return { entries, unmapped };
}

/**
 * Groups consecutive days that share identical hours. Used by BOTH the visible
 * summary and `openingHoursSpecification`, which is the point — one grouping,
 * so the two can't drift.
 */
export function groupConsecutive(entries: HoursEntry[]): HoursEntry[][] {
  const groups: HoursEntry[][] = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    const prev = last?.[last.length - 1];
    const sameHours =
      prev &&
      prev.closed === entry.closed &&
      prev.ranges.length === entry.ranges.length &&
      prev.ranges.every(
        (r, i) => r.opens === entry.ranges[i].opens && r.closes === entry.ranges[i].closes,
      );

    if (last && sameHours && entry.dayIndex === prev.dayIndex + 1) last.push(entry);
    else groups.push([entry]);
  }

  return groups;
}

/**
 * Human summary, e.g. `Montag–Samstag: 11:00 – 22:00 · Sonntag: Geschlossen`.
 * Renders the authored `rawTime` so CMS wording is preserved verbatim.
 */
export function formatHoursSummary(parsed: ParsedHours): string {
  const parts = groupConsecutive(parsed.entries).map((group) => {
    const label =
      group.length > 1
        ? `${group[0].rawLabel}–${group[group.length - 1].rawLabel}`
        : group[0].rawLabel;
    return `${label}: ${group[0].rawTime}`;
  });

  // Keep any unmapped rows visible to humans even though they're excluded from
  // the structured data — losing them from the page would be worse.
  for (const row of parsed.unmapped) parts.push(`${row.day}: ${row.time}`);

  return parts.join(' · ');
}

/**
 * schema.org `OpeningHoursSpecification[]`. Closed days are emitted explicitly
 * so a crawler learns Sunday is a rest day rather than merely unlisted.
 */
export function toOpeningHoursSpecification(parsed: ParsedHours) {
  return groupConsecutive(parsed.entries).flatMap((group) => {
    const dayOfWeek = group.map((e) => SCHEMA_DAY[e.dayIndex]);

    if (group[0].closed) {
      return [{ '@type': 'OpeningHoursSpecification', dayOfWeek, opens: '00:00', closes: '00:00' }];
    }

    return group[0].ranges.map((range) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens: range.opens,
      closes: range.closes,
    }));
  });
}

/**
 * The payload handed to the client for the "today" widget. Deliberately carries
 * NO human-readable German: labels come from `data-tpl-*` attributes instead, so
 * the inline script stays byte-identical across locales and adding a locale
 * costs zero extra CSP hashes.
 */
export function toClientHours(parsed: ParsedHours) {
  return parsed.entries.map((e) => ({
    d: e.dayIndex,
    closed: e.closed,
    time: e.rawTime,
  }));
}
