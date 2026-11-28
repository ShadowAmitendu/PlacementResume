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

/**
 * Moves an element from `fromIndex` to `toIndex` without mutating the source array.
 */
export function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Reorders a table column (headers, rows, and proportional colWidths) from `fromIndex` to `toIndex`.
 */
export function reorderTableColumns(
  headers: string[] | undefined,
  rows: string[][],
  colWidths: number[] | undefined,
  fromIndex: number,
  toIndex: number,
  isProfile = false
): {
  headers?: string[];
  rows: string[][];
  colWidths?: number[];
} {
  const colCount = headers?.length || rows[0]?.length || 0;
  if (
    colCount <= 1 ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= colCount ||
    toIndex >= colCount
  ) {
    return { headers, rows, colWidths };
  }

  const nextHeaders = headers ? moveArrayItem(headers, fromIndex, toIndex) : undefined;
  const nextRows = rows.map((row) => moveArrayItem(row, fromIndex, toIndex));

  const baseWidths =
    colWidths && colWidths.length === colCount
      ? colWidths
      : isProfile && colCount === 2
      ? [35, 65]
      : buildEqualColWidths(colCount);
  const nextColWidths = normalizeColWidths(moveArrayItem(baseWidths, fromIndex, toIndex));

  return {
    headers: nextHeaders,
    rows: nextRows,
    colWidths: nextColWidths,
  };
}
