export function normalizeKeywords(values: string[]) {
  const out: string[] = [];
  for (const value of values) {
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    if (out.some((item) => item.toLowerCase() === cleaned.toLowerCase()))
      continue;
    out.push(cleaned);
  }
  return out;
}
