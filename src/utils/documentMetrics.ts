/** Exact A4 page height (297mm) at standard CSS 96 DPI. */
export const A4_HEIGHT_PX = Math.round((297 / 25.4) * 96);

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

  let nonPrintChromeHeight = 0;

  sectionsEl.querySelectorAll('.no-print').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = window.getComputedStyle(htmlEl);
    if (style.position === 'absolute' || style.position === 'fixed') return;
    if (style.display === 'none') return;
    const mt = parseFloat(style.marginTop) || 0;
    const mb = parseFloat(style.marginBottom) || 0;
    nonPrintChromeHeight += htmlEl.offsetHeight + mt + mb;
  });

  // Table wrappers reserve top space on screen for the hover column pill (`print:pt-0`)
  sectionsEl.querySelectorAll('.print\\:pt-0').forEach((el) => {
    const style = window.getComputedStyle(el as HTMLElement);
    nonPrintChromeHeight += parseFloat(style.paddingTop) || 0;
  });

  const declNonPrint = declEl
    ? Array.from(declEl.querySelectorAll('.no-print')).reduce((sum, el) => {
        const htmlEl = el as HTMLElement;
        const style = window.getComputedStyle(htmlEl);
        if (style.position === 'absolute' || style.position === 'fixed' || style.display === 'none') {
          return sum;
        }
        return (
          sum +
          htmlEl.offsetHeight +
          (parseFloat(style.marginTop) || 0) +
          (parseFloat(style.marginBottom) || 0)
        );
      }, 0)
    : 0;

  const contentHeight =
    padTop +
    headerEl.offsetHeight +
    sectionsEl.offsetHeight +
    (declEl ? declEl.offsetHeight : 0) +
    padBottom -
    nonPrintChromeHeight -
    declNonPrint;

  return Math.max(0, Math.round(contentHeight));
}
