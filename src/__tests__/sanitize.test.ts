import { describe, it, expect } from 'vitest';
import {
  createUniqueId,
  escapeHtml,
  sanitizeLinkUrl,
  sanitizeRichTextHtml,
} from '../utils/sanitize';

describe('sanitize utilities', () => {
  it('escapes HTML special characters in plain text', () => {
    expect(escapeHtml('C++ <vector> & "STL"')).toBe('C++ &lt;vector&gt; &amp; &quot;STL&quot;');
  });

  it('blocks unsafe link schemes and normalizes bare domains', () => {
    expect(sanitizeLinkUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeLinkUrl('java\nscript:alert(1)')).toBe('#');
    expect(sanitizeLinkUrl('data:text/html,<script>')).toBe('#');
    expect(sanitizeLinkUrl('github.com/octocat')).toBe('https://github.com/octocat');
    expect(sanitizeLinkUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeLinkUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('strips scripts and event handlers while preserving safe inline formatting', () => {
    const dirty =
      '<b>Bold</b> <span class="code-inline evil" style="color: #111; background-image: url(x)" onclick="alert(1)">code</span>' +
      '<img src=x onerror="alert(1)"><script>evil()</script><a href="javascript:alert(1)">bad</a>';
    const clean = sanitizeRichTextHtml(dirty);
    expect(clean).toContain('<b>Bold</b>');
    expect(clean).toContain('class="code-inline"');
    expect(clean).toContain('style="color: #111"');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('url(');
    expect(clean).toContain('href="#"');
  });

  it('generates distinct IDs across rapid calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => createUniqueId('sec')));
    expect(ids.size).toBe(20);
  });

  it('preserves text-align inline styles across alignment modes', () => {
    for (const align of ['left', 'center', 'right', 'justify']) {
      const html = `<div style="text-align: ${align}">Aligned text</div>`;
      expect(sanitizeRichTextHtml(html)).toBe(html);
    }
  });

  it('converts legacy align attributes and <center> tags into text-align styles', () => {
    expect(sanitizeRichTextHtml('<div align="justify">Justified</div>')).toBe(
      '<div style="text-align: justify">Justified</div>'
    );
    expect(sanitizeRichTextHtml('<p align="right">Right</p>')).toBe(
      '<p style="text-align: right">Right</p>'
    );
    expect(sanitizeRichTextHtml('<h2 align="center">Heading</h2>')).toBe(
      '<h2 style="text-align: center">Heading</h2>'
    );
    expect(sanitizeRichTextHtml('<li align="left">Item</li>')).toBe(
      '<li style="text-align: left">Item</li>'
    );
    expect(sanitizeRichTextHtml('<center>Centered</center>')).toBe(
      '<div style="text-align: center">Centered</div>'
    );
    expect(sanitizeRichTextHtml('<center style="color: #111">Styled</center>')).toBe(
      '<div style="color: #111; text-align: center">Styled</div>'
    );
    // Explicit inline text-align takes precedence over legacy align attribute
    expect(sanitizeRichTextHtml('<div align="left" style="text-align: right">Keep</div>')).toBe(
      '<div style="text-align: right">Keep</div>'
    );
  });

  it('strips leaked focus background highlights while preserving real highlight colors', () => {
    const leaked = sanitizeRichTextHtml(
      '<span style="background-color: rgba(15, 108, 189, 0.08); color: #111">Focused</span>' +
        '<span style="background-color: rgba(255, 255, 255, 0.2)">Header Focus</span>'
    );
    expect(leaked).toBe('<span style="color: #111">Focused</span><span>Header Focus</span>');

    const realHighlight = sanitizeRichTextHtml(
      '<span style="background-color: #fef08a">Highlighted</span>'
    );
    expect(realHighlight).toBe('<span style="background-color: #fef08a">Highlighted</span>');
  });
});
