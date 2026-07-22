export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshteinWithin(a: string, b: string, maxDistance: number): number {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const cur = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = cur[j];
  }
  return prev[b.length];
}

/**
 * True when `query` plausibly refers to the entity described by `fields`:
 * at least half of its meaningful terms (length >= 3) match a field word by
 * substring (either direction) or a single-edit typo. Used to accept or
 * reject the TOP hit of a ranked search when resolving a free-text
 * reference to exactly one entity — rankedSearch alone returns weak
 * last-resort matches that are fine for a picker list but wrong to act on.
 */
export function isConfidentMatch(
  query: string,
  fields: Array<string | undefined>,
): boolean {
  const terms = normalizeSearchText(query)
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  if (terms.length === 0) return false;
  const words = fields
    .filter((f): f is string => Boolean(f))
    .flatMap((f) => normalizeSearchText(f).split(/\s+/))
    .filter(Boolean);
  const hits = terms.filter((term) =>
    words.some(
      (word) =>
        word.includes(term) ||
        (term.includes(word) && word.length >= 3) ||
        levenshteinWithin(word, term, 1) <= 1,
    ),
  );
  return hits.length >= Math.ceil(terms.length / 2);
}

function isOrderedSubsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

export function rankedSearch<T>(
  items: readonly T[],
  query: string,
  getFields: (item: T) => Array<string | undefined>,
  limit = items.length,
): T[] {
  const q = normalizeSearchText(query);
  if (!q) return [...items].slice(0, limit);
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const fields = getFields(item)
      .filter((field): field is string => Boolean(field))
      .map(normalizeSearchText)
      .filter(Boolean);
    let score = -1;
    for (const field of fields) {
      const words = field.split(/\s+/);
      if (field === q) score = Math.max(score, 140);
      if (field.startsWith(q)) score = Math.max(score, 120);
      if (words.some((word) => word.startsWith(q))) score = Math.max(score, 100);
      if (field.includes(q)) score = Math.max(score, 78);

      const allTermsHit = terms.every((term) =>
        words.some((word) => word.startsWith(term) || word.includes(term))
      );
      if (allTermsHit) score = Math.max(score, 72);

      for (const term of terms) {
        const typoHit = words.some((word) => {
          if (word.length < 4 || term.length < 4) return false;
          const prefix = word.slice(0, Math.max(term.length, 4));
          if (levenshteinWithin(prefix, term, 1) <= 1) return true;
          return (
            word[0] === term[0] &&
            word.length >= term.length &&
            word.length - term.length <= 3 &&
            isOrderedSubsequence(term, word)
          );
        });
        if (typoHit) score = Math.max(score, 56);
      }
    }
    if (score >= 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((row) => row.item);
}
