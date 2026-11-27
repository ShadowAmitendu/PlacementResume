import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker using Vite's bundled worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

/** Marker prefix written into document.title before printing. */
export const RSBLD_TITLE_PREFIX = 'RSBLD::';

/**
 * Try to recover the original ResumeData JSON that was embedded in the PDF's
 * document title by the beforeprint hook. Returns the parsed object or null.
 */
export async function tryExtractEmbeddedResumeData(file: File): Promise<unknown | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const meta = await pdf.getMetadata().catch(() => null);
    // PDF.js exposes the document title via metadata info object.
    const title: string =
      (meta?.info as Record<string, unknown>)?.['Title'] as string ?? '';
    if (title.startsWith(RSBLD_TITLE_PREFIX)) {
      const b64 = title.slice(RSBLD_TITLE_PREFIX.length);
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    }
    return null;
  } catch {
    return null;
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let pageText = '';

    for (const item of textContent.items as any[]) {
      if ('str' in item) {
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        pageText += item.str;
        if (currentY !== null) {
          lastY = currentY;
        }
      }
    }
    fullText += pageText.trim() + '\n\n';
  }

  return fullText.trim();
}
