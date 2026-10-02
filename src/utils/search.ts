/** Match words regardless of accents, punctuation, case or mathematical scripts. */
export function normalizeSearchText(text: string): string {
  return text.replace(/TT\u0304/gi, "ttbar")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function matchesSearch(text: string, query: string): boolean {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  const normalized = normalizeSearchText(text);
  return tokens.every((token) => normalized.includes(token));
}
