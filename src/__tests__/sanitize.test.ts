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
});
