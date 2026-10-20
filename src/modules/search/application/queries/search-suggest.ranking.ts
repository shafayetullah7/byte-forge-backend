export type SearchSuggestItemType = 'plant' | 'shop';

export type SearchSuggestCandidate = {
  type: SearchSuggestItemType;
  slug: string;
  name: string;
  subtitle?: string;
  image?: { id: string; url: string } | null;
};

function normalizeForMatch(value: string): string {
  return value.trim().toLowerCase();
}

/** Lower score = better match. */
export function scoreSearchMatch(
  query: string,
  name: string,
  slug: string,
): number {
  const q = normalizeForMatch(query);
  const n = normalizeForMatch(name);
  const s = normalizeForMatch(slug);
  if (n.startsWith(q) || s.startsWith(q)) return 0;
  if (n.includes(q) || s.includes(q)) return 1;
  return 2;
}

export function rankSearchSuggestItems(
  query: string,
  candidates: SearchSuggestCandidate[],
  limit: number,
): SearchSuggestCandidate[] {
  return [...candidates]
    .sort((a, b) => {
      const scoreA = scoreSearchMatch(query, a.name, a.slug);
      const scoreB = scoreSearchMatch(query, b.name, b.slug);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    })
    .slice(0, limit);
}
