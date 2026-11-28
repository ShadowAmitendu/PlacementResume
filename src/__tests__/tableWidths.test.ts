import { describe, it, expect } from 'vitest';
import {
  buildEqualColWidths,
  normalizeColWidths,
  moveArrayItem,
  reorderTableColumns,
} from '../utils/tableWidths';

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

  it('reorders table headers, rows, and column widths proportionally', () => {
    const headers = ['Year', 'Qualification', 'Marks'];
    const rows = [
      ['2026', 'B.Tech CSE', '9.1'],
      ['2022', 'Class XII', '95%'],
    ];
    const colWidths = [20, 55, 25];

    const moved = reorderTableColumns(headers, rows, colWidths, 0, 2);
    expect(moved.headers).toEqual(['Qualification', 'Marks', 'Year']);
    expect(moved.rows).toEqual([
      ['B.Tech CSE', '9.1', '2026'],
      ['Class XII', '95%', '2022'],
    ]);
    expect(moved.colWidths).toEqual([55, 25, 20]);
  });

  it('keeps array order unchanged for invalid move indices', () => {
    expect(moveArrayItem(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
    expect(moveArrayItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
