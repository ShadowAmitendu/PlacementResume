import { describe, it, expect } from 'vitest';
import { A4_HEIGHT_PX, PAGE_GAP_PX, htmlToPlainText, measurePrintableResumeHeight } from '../utils/documentMetrics';

describe('documentMetrics', () => {
  it('defines A4_HEIGHT_PX matching CSS 297mm at 96 DPI', () => {
    expect(A4_HEIGHT_PX).toBe(1123);
    expect(PAGE_GAP_PX).toBe(24);
  });

  it('strips markup and decodes HTML entities for word counts', () => {
    const html = '<strong>Languages:</strong>&nbsp;C++ &amp; TypeScript &lt;STL&gt;';
    expect(htmlToPlainText(html)).toBe('Languages: C++ & TypeScript <STL>');
  });

  it('subtracts temporary page-push spacers from measured printable height', () => {
    const wrapper = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'header';
    const sections = document.createElement('div');
    sections.id = 'sortable-sections';
    const pushed = document.createElement('div');
    pushed.className = 'section-block has-page-push';
    pushed.dataset.pagePush = '160';
    sections.appendChild(pushed);
    wrapper.appendChild(header);
    wrapper.appendChild(sections);

    Object.defineProperty(sections, 'offsetHeight', { value: 660 });
    expect(measurePrintableResumeHeight(wrapper)).toBe(500);
  });
});
