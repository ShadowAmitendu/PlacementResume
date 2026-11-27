const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'STRIKE',
  'SUB',
  'SUP',
  'SPAN',
  'BR',
  'DIV',
  'P',
  'H1',
  'H2',
  'H3',
  'A',
  'UL',
  'OL',
  'LI',
  'FONT',
]);

const ALIGNABLE_TAGS = new Set(['DIV', 'P', 'H1', 'H2', 'H3', 'LI']);
const VALID_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify']);

const FOCUS_HIGHLIGHT_LEAK_RE =
  /^rgba\(\s*(?:15\s*,\s*108\s*,\s*189\s*,\s*0?\.08|255\s*,\s*255\s*,\s*255\s*,\s*0?\.20?|255\s*,\s*255\s*,\s*255\s*,\s*0?\.14|0\s*,\s*0\s*,\s*0\s*,\s*0?\.045)\s*\)$/i;

const ALLOWED_CLASSES = new Set(['code-inline']);

const SAFE_STYLE_PROPS = new Set([
  'font-size',
  'font-variant',
  'font-weight',
  'font-style',
  'font-family',
  'text-decoration',
  'text-decoration-line',
  'text-align',
  'color',
  'background-color',
]);

let idCounter = 0;

/**
 * Generates a collision-free unique identifier with a readable prefix.
 */
export function createUniqueId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/**
 * Escapes HTML metacharacters in plain text before embedding inside markup strings.
 */
export function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and normalizes link URLs, blocking script or data URIs.
 */
export function sanitizeLinkUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed || trimmed === '#') return '#';
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (/^(javascript|vbscript|data):/i.test(normalized)) {
    return '#';
  }
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function sanitizeStyleAttribute(rawStyle: string): string {
  const safeDeclarations: string[] = [];
  for (const part of rawStyle.split(';')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim().toLowerCase();
    const val = part.slice(colonIdx + 1).trim();
    if (!SAFE_STYLE_PROPS.has(prop) || !val) continue;
    if (/url\s*\(|expression\s*\(|@import|-moz-binding/i.test(val)) continue;
    if (prop === 'background-color' && FOCUS_HIGHLIGHT_LEAK_RE.test(val)) continue;
    safeDeclarations.push(`${prop}: ${val}`);
  }
  return safeDeclarations.join('; ');
}

function sanitizeNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent || '');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toUpperCase();

  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'OBJECT' || tag === 'EMBED') {
    return null;
  }

  const isCenter = tag === 'CENTER';
  if (!isCenter && !ALLOWED_TAGS.has(tag)) {
    const frag = doc.createDocumentFragment();
    el.childNodes.forEach((child) => {
      const sanitizedChild = sanitizeNode(child, doc);
      if (sanitizedChild) frag.appendChild(sanitizedChild);
    });
    return frag;
  }

  const cleanEl = doc.createElement(isCenter ? 'div' : el.tagName.toLowerCase());

  const styleAttr = el.getAttribute('style');
  let cleanStyle = styleAttr ? sanitizeStyleAttribute(styleAttr) : '';

  if (isCenter) {
    if (!/(?:^|;)\s*text-align\s*:/i.test(cleanStyle)) {
      cleanStyle = cleanStyle ? `${cleanStyle}; text-align: center` : 'text-align: center';
    }
  } else if (ALIGNABLE_TAGS.has(tag)) {
    const alignAttr = el.getAttribute('align')?.trim().toLowerCase();
    if (alignAttr && VALID_ALIGN_VALUES.has(alignAttr) && !/(?:^|;)\s*text-align\s*:/i.test(cleanStyle)) {
      cleanStyle = cleanStyle ? `${cleanStyle}; text-align: ${alignAttr}` : `text-align: ${alignAttr}`;
    }
  }

  if (cleanStyle) {
    cleanEl.setAttribute('style', cleanStyle);
  }

  const classAttr = el.getAttribute('class');
  if (classAttr) {
    const kept = classAttr
      .split(/\s+/)
      .filter((token) => ALLOWED_CLASSES.has(token));
    if (kept.length > 0) cleanEl.setAttribute('class', kept.join(' '));
  }

  if (tag === 'A') {
    const href = el.getAttribute('href');
    cleanEl.setAttribute('href', sanitizeLinkUrl(href || '#'));
    cleanEl.setAttribute('rel', 'noopener noreferrer');
  }

  if (tag === 'FONT') {
    const color = el.getAttribute('color');
    if (color && !/url\s*\(|expression\s*\(/i.test(color)) {
      cleanEl.setAttribute('color', color);
    }
  }

  el.childNodes.forEach((child) => {
    const sanitizedChild = sanitizeNode(child, doc);
    if (sanitizedChild) cleanEl.appendChild(sanitizedChild);
  });

  return cleanEl;
}

/**
 * Strips disallowed elements, event handlers, and unsafe URLs from editable HTML.
 */
export function sanitizeRichTextHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return escapeHtml(html);
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = parsed.body.firstElementChild;
  if (!root) return '';

  const outContainer = parsed.createElement('div');
  root.childNodes.forEach((child) => {
    const cleanChild = sanitizeNode(child, parsed);
    if (cleanChild) outContainer.appendChild(cleanChild);
  });
  return outContainer.innerHTML;
}
