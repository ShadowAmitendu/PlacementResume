import React, { useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { TextSectionData, ListSectionData, TableSectionData } from '../../types/resume';
import { Search, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface DocumentStatusBarProps {
  wrapperHeight: number;
  isAutoFit?: boolean;
}

export const DocumentStatusBar: React.FC<DocumentStatusBarProps> = ({ wrapperHeight, isAutoFit }) => {
  const { resumeData, setZoom, setIsFindReplaceModalOpen } = useResume();
  const { zoom, margin, lineHeight } = resumeData.meta;

  // Calculate live word count and character count
  const { wordCount, charCount } = useMemo(() => {
    let fullText = '';
    const append = (str?: string | null) => {
      if (str) {
        // Strip any HTML tags to count only plain words
        const plain = str.replace(/<[^>]*>/g, ' ');
        fullText += ' ' + plain;
      }
    };

    // Header
    append(resumeData.header.fullName);
    append(resumeData.header.degreeTitle);
    append(resumeData.header.universityCompany);
    append(resumeData.header.email);
    append(resumeData.header.phone);
    append(resumeData.header.location);
    resumeData.header.links.forEach((l) => append(l.text));

    // Sections
    resumeData.sections.forEach((sec) => {
      append(sec.title);
      if (sec.type === 'text') {
        append((sec as TextSectionData).content);
      } else if (sec.type === 'list') {
        (sec as ListSectionData).items.forEach((item) => append(item));
      } else if (sec.type === 'table') {
        const t = sec as TableSectionData;
        t.headers?.forEach((h) => append(h));
        t.rows.forEach((row) => row.forEach((cell) => append(cell)));
      }
    });

    // Declaration
    append(resumeData.declaration.text);
    append(resumeData.declaration.date);
    append(resumeData.declaration.place);

    const trimmed = fullText.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = trimmed.replace(/\s+/g, '').length;

    return { wordCount: words, charCount: chars };
  }, [resumeData]);

  // A4 page height at 96 DPI is approximately 1122px (297mm)
  const A4_HEIGHT_PX = 1122;
  const estimatedPages = Math.max(1, Math.ceil(wrapperHeight / A4_HEIGHT_PX));
  const isOnePageFit = wrapperHeight > 0 && wrapperHeight <= A4_HEIGHT_PX + 20;

  const handleZoomChange = (delta: number) => {
    const next = Math.max(0.4, Math.min(2.0, Math.round((zoom + delta) * 10) / 10));
    setZoom(next);
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 lg:left-72 z-30 bg-[var(--ui-surface)] border-t border-[var(--ui-border)] px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between text-[11px] text-[var(--ui-text-dim)] shadow-md select-none no-print backdrop-blur-xs gap-2">
      {/* Left: Document Metrics (Word-style) */}
      <div className="flex items-center gap-2 sm:gap-3 flex-nowrap overflow-x-auto py-0.5 shrink">
        <span className="flex items-center gap-1 font-medium text-foreground shrink-0">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Page 1 of {estimatedPages}</span>
        </span>

        <span className="text-[var(--ui-border)] shrink-0">|</span>

        <span className="shrink-0">
          <strong className="font-semibold text-foreground">{wordCount}</strong> words
        </span>

        <span className="hidden sm:inline text-[var(--ui-border)] shrink-0">|</span>

        <span className="hidden sm:inline shrink-0">
          <strong className="font-semibold text-foreground">{charCount}</strong> characters
        </span>

        <span className="hidden md:inline text-[var(--ui-border)] shrink-0">|</span>

        {/* Fit Badge */}
        {wrapperHeight > 0 && (
          <span
            className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
              isOnePageFit
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
            title={
              isOnePageFit
                ? isAutoFit
                  ? 'Spacing automatically optimized to keep signature fitted on 1 page'
                  : 'Document fits on a standard single A4 page'
                : 'Content exceeds 1 page. Adjust margins or line spacing if 1-page fit is desired.'
            }
          >
            {isOnePageFit ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>{isAutoFit ? '1-Page Fit (Auto-Fit)' : '1-Page Fit'}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>Multi-Page ({estimatedPages} Pages)</span>
              </>
            )}
          </span>
        )}

        {/* Margin & Spacing quick labels */}
        <span className="hidden lg:inline text-[10px] text-muted-foreground shrink-0">
          Margins: <span className="capitalize">{margin || 'normal'}</span> &bull; Spacing:{' '}
          <span className="capitalize">{lineHeight || 'normal'}</span>
        </span>
      </div>

      {/* Right: Tools & Zoom */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Find & Replace trigger */}
        <button
          type="button"
          onClick={() => setIsFindReplaceModalOpen(true)}
          title="Find & Replace (Ctrl+F)"
          className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded hover:bg-[var(--ui-surface2)] text-foreground hover:text-primary transition-colors cursor-pointer text-xs touch-manipulation"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Find</span>
        </button>

        <span className="text-[var(--ui-border)]">|</span>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => handleZoomChange(-0.1)}
            disabled={zoom <= 0.4}
            title="Zoom Out"
            className="p-1 sm:p-1.5 rounded hover:bg-[var(--ui-surface2)] text-foreground hover:text-primary disabled:opacity-40 cursor-pointer touch-manipulation active:scale-90"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
            className="px-1 sm:px-1.5 py-0.5 rounded hover:bg-[var(--ui-surface2)] font-mono text-[11px] sm:text-xs font-semibold text-foreground cursor-pointer touch-manipulation"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => handleZoomChange(0.1)}
            disabled={zoom >= 2.0}
            title="Zoom In"
            className="p-1 sm:p-1.5 rounded hover:bg-[var(--ui-surface2)] text-foreground hover:text-primary disabled:opacity-40 cursor-pointer touch-manipulation active:scale-90"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
