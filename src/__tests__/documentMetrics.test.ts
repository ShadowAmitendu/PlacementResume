import { describe, it, expect } from 'vitest';
import { A4_HEIGHT_PX, htmlToPlainText } from '../utils/documentMetrics';

describe('documentMetrics', () => {
  it('defines A4_HEIGHT_PX matching CSS 297mm at 96 DPI', () => {
    expect(A4_HEIGHT_PX).toBe(1123);
  });

  it('strips markup and decodes HTML entities for word counts', () => {
    const html = '<strong>Languages:</strong>&nbsp;C++ &amp; TypeScript &lt;STL&gt;';
    expect(htmlToPlainText(html)).toBe('Languages: C++ & TypeScript <STL>');
  });
});
