/**
 * Builds equal percentage column widths in tenths summing to exactly 100.
 */
export function buildEqualColWidths(colCount: number): number[] {
  if (colCount <= 0) return [];
  const base = Math.floor((1000 / colCount)) / 10;
  const widths = Array<number>(colCount).fill(base);
  const sumExceptLast = Math.round(base * (colCount - 1) * 10) / 10;
  widths[colCount - 1] = Math.round((100 - sumExceptLast) * 10) / 10;
  return widths;
}

/**
 * Normalizes column width percentages in tenths so the total is exactly 100.
 */
export function normalizeColWidths(widths: number[]): number[] {
  if (widths.length === 0) return [];
  const total = widths.reduce((sum, w) => sum + (Number.isFinite(w) && w > 0 ? w : 0), 0);
  if (total <= 0) return buildEqualColWidths(widths.length);

  const normalized = widths.map((w) =>
    Math.max(1, Math.round(((Math.max(0, w) / total) * 100) * 10) / 10)
  );
  const sumExceptLast = normalized
    .slice(0, -1)
    .reduce((sum, w) => Math.round((sum + w) * 10) / 10, 0);
  normalized[normalized.length - 1] = Math.max(
    1,
    Math.round((100 - sumExceptLast) * 10) / 10
  );
  return normalized;
}
