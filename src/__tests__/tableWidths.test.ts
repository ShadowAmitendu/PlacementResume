import { describe, it, expect } from 'vitest';
import { buildEqualColWidths, normalizeColWidths } from '../utils/tableWidths';

describe('tableWidths', () => {
  it('builds equal column widths summing to 100', () => {
    expect(buildEqualColWidths(0)).toEqual([]);
    expect(buildEqualColWidths(1)).toEqual([100]);
    expect(buildEqualColWidths(2)).toEqual([50, 50]);
    expect(buildEqualColWidths(3)).toEqual([33.3, 33.3, 33.4]);
    expect(buildEqualColWidths(4)).toEqual([25, 25, 25, 25]);
  });

  it('normalizes arbitrary width arrays to sum to 100', () => {
    const norm3 = normalizeColWidths([33.3, 33.3, 33.3]);
    expect(norm3.reduce((a, b) => Math.round((a + b) * 10) / 10, 0)).toBe(100);

    const norm2 = normalizeColWidths([70, 130]);
    expect(norm2).toEqual([35, 65]);
  });

  it('falls back to equal widths when totals are zero or non-finite', () => {
    expect(normalizeColWidths([0, 0])).toEqual([50, 50]);
    expect(normalizeColWidths([NaN, -5, 0])).toEqual([33.3, 33.3, 33.4]);
  });
});
