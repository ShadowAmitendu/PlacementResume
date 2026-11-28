import {
  ResumeData,
  TextSectionData,
  ListSectionData,
  TableSectionData,
  EntriesSectionData,
  KeyValueSectionData,
} from '../types/resume';

/** Exact A4 page height (297mm) at standard CSS 96 DPI. */
export const A4_HEIGHT_PX = Math.round((297 / 25.4) * 96);

/** Visual gap in pixels between stacked A4 pages on screen. */
export const PAGE_GAP_PX = 24;

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 2.0;

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * Converts editable HTML markup to decoded plain text for accurate word/char metrics.
 */
export function htmlToPlainText(html?: string | null): string {
  if (!html) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\u00a0/g, ' ');
  }
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (m) => ENTITY_MAP[m] ?? ' ');
}

/**
 * Sums the layout height of in-flow `.no-print` chrome and `print:pt-0` padding inside an element.
 */
export function measureNonPrintHeight(root: HTMLElement): number {
  let chrome = 0;

  root.querySelectorAll('.no-print').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = window.getComputedStyle(htmlEl);
    if (style.position === 'absolute' || style.position === 'fixed') return;
    if (style.display === 'none') return;
    const mt = parseFloat(style.marginTop) || 0;
    const mb = parseFloat(style.marginBottom) || 0;
    chrome += htmlEl.offsetHeight + mt + mb;
  });

  // Table wrappers reserve top space on screen for the hover column pill (`print:pt-0`)
  if (root.classList.contains('print:pt-0')) {
    const style = window.getComputedStyle(root);
    chrome += parseFloat(style.paddingTop) || 0;
  }
  root.querySelectorAll('.print\\:pt-0').forEach((el) => {
    const style = window.getComputedStyle(el as HTMLElement);
    chrome += parseFloat(style.paddingTop) || 0;
  });

  return chrome;
}

/**
 * Measures resume height excluding in-flow `.no-print` toolbars and print-stripped padding.
 */
export function measurePrintableResumeHeight(wrapper: HTMLElement): number {
  const headerEl = wrapper.querySelector('.header') as HTMLElement | null;
  const sectionsEl = wrapper.querySelector('#sortable-sections') as HTMLElement | null;
  const declEl = wrapper.querySelector('#declarationSection') as HTMLElement | null;

  if (!headerEl || !sectionsEl) {
    return wrapper.offsetHeight;
  }

  const wrapperStyle = window.getComputedStyle(wrapper);
  const padTop = parseFloat(wrapperStyle.paddingTop) || 0;
  const padBottom = parseFloat(wrapperStyle.paddingBottom) || 0;

  const nonPrintChromeHeight = measureNonPrintHeight(sectionsEl);
  const declNonPrint = declEl ? measureNonPrintHeight(declEl) : 0;

  let pushedMarginHeight = 0;
  sectionsEl.querySelectorAll<HTMLElement>('[data-page-push]').forEach((el) => {
    pushedMarginHeight += parseFloat(el.dataset.pagePush || '0') || 0;
  });

  const contentHeight =
    padTop +
    headerEl.offsetHeight +
    sectionsEl.offsetHeight +
    (declEl ? declEl.offsetHeight : 0) +
    padBottom -
    nonPrintChromeHeight -
    declNonPrint -
    pushedMarginHeight;

  return Math.max(0, Math.round(contentHeight));
}

/**
 * Extracts linear plain text from a resume across all printable sections.
 */
export function extractResumePlainText(
  data: ResumeData,
  options: { includeHidden?: boolean } = {}
): string {
  const parts: string[] = [];
  const push = (htmlOrText?: string | null) => {
    if (!htmlOrText) return;
    const plain = htmlToPlainText(htmlOrText).replace(/\s+/g, ' ').trim();
    if (plain) parts.push(plain);
  };

  push(data.header.fullName);
  push(data.header.degreeTitle);
  push(data.header.universityCompany);
  push(data.header.email);
  push(data.header.phone);
  push(data.header.location);
  data.header.links.forEach((l) => push(l.text));

  data.sections.forEach((sec) => {
    if (sec.hidden && !options.includeHidden) return;
    push(sec.title);
    if (sec.type === 'text') {
      push((sec as TextSectionData).content);
    } else if (sec.type === 'list') {
      (sec as ListSectionData).items.forEach((item) => push(item));
    } else if (sec.type === 'table') {
      const t = sec as TableSectionData;
      t.headers?.forEach((h) => push(h));
      t.rows.forEach((row) => row.forEach((cell) => push(cell)));
    } else if (sec.type === 'entries') {
      (sec as EntriesSectionData).entries.forEach((entry) => {
        push(entry.heading);
        push(entry.subheading);
        push(entry.dateRange);
        push(entry.location);
        entry.bullets.forEach((b) => push(b));
      });
    } else if (sec.type === 'keyvalue') {
      (sec as KeyValueSectionData).pairs.forEach((pair) => {
        push(pair.label);
        push(pair.value);
      });
    }
  });

  if (data.meta.showDeclaration) {
    push(data.declaration.text);
    push(data.declaration.date);
    push(data.declaration.place);
  }

  return parts.join(' ');
}
