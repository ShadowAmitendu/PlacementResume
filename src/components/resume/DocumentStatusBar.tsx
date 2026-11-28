import React, { useMemo } from 'react';
import { Button, Badge, Tooltip, tokens } from '@fluentui/react-components';
import {
  SearchRegular,
  ZoomInRegular,
  ZoomOutRegular,
  DocumentRegular,
  ContractDownLeftRegular,
  TargetArrowRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { A4_HEIGHT_PX, MIN_ZOOM, MAX_ZOOM, extractResumePlainText } from '../../utils/documentMetrics';

interface DocumentStatusBarProps {
  wrapperHeight: number;
  isAutoFit?: boolean;
  pageCount?: number;
  activePage?: number;
}

export const DocumentStatusBar: React.FC<DocumentStatusBarProps> = ({
  wrapperHeight,
  isAutoFit,
  pageCount,
  activePage = 1,
}) => {
  const {
    resumeData,
    setZoom,
    setIsFindReplaceModalOpen,
    setIsPreflightModalOpen,
    setIsJdMatcherModalOpen,
    tightenToOnePage,
  } = useResume();
  const { zoom, margin, lineHeight } = resumeData.meta;

  const { wordCount, charCount, hiddenCount } = useMemo(() => {
    const trimmed = extractResumePlainText(resumeData, { includeHidden: false }).trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = trimmed.replace(/\s+/g, '').length;
    const hidden = resumeData.sections.filter((s) => s.hidden).length;

    return { wordCount: words, charCount: chars, hiddenCount: hidden };
  }, [resumeData]);

  const estimatedPages = pageCount ?? Math.max(1, Math.ceil(wrapperHeight / A4_HEIGHT_PX));
  const clampedActivePage = Math.max(1, Math.min(estimatedPages, activePage));
  const isOnePageFit = wrapperHeight > 0 && estimatedPages === 1;

  const handleZoomChange = (delta: number) => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((prev + delta) * 10) / 10)));
  };

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 min-h-8 sm:min-h-7 py-0.5 px-2 sm:px-4 flex items-center justify-between text-[11px] select-none no-print gap-1.5 sm:gap-2"
      style={{
        backgroundColor: tokens.colorNeutralBackground2,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        color: tokens.colorNeutralForeground2,
        paddingBottom: 'max(2px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Left: Document Metrics */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-none min-w-0 shrink">
        <span
          className="flex items-center gap-1 font-medium shrink-0"
          style={{ color: tokens.colorNeutralForeground1 }}
        >
          <DocumentRegular fontSize={13} />
          <span>
            Page {clampedActivePage} of {estimatedPages}
          </span>
        </span>

        <span style={{ color: tokens.colorNeutralStroke1 }}>|</span>

        <span className="shrink-0 tabular-nums">
          <strong style={{ color: tokens.colorNeutralForeground1, fontWeight: 600 }}>
            {wordCount}
          </strong>{' '}
          words
        </span>

        <span
          className="hidden sm:inline"
          style={{ color: tokens.colorNeutralStroke1 }}
        >
          |
        </span>

        <span className="hidden sm:inline shrink-0 tabular-nums">
          <strong style={{ color: tokens.colorNeutralForeground1, fontWeight: 600 }}>
            {charCount}
          </strong>{' '}
          characters
        </span>

        {hiddenCount > 0 && (
          <>
            <span className="hidden sm:inline" style={{ color: tokens.colorNeutralStroke1 }}>
              |
            </span>
            <span className="hidden sm:inline shrink-0" style={{ color: tokens.colorNeutralForeground3 }}>
              {hiddenCount} hidden
            </span>
          </>
        )}

        {wrapperHeight > 0 && (
          <>
            <span
              className="hidden md:inline"
              style={{ color: tokens.colorNeutralStroke1 }}
            >
              |
            </span>
            <Tooltip
              content={
                isOnePageFit
                  ? isAutoFit
                    ? 'Vertical spacing compressed automatically to keep signature on 1 page'
                    : 'Content fits within 1 A4 page'
                  : 'Content exceeds 1 page. Click Tighten or adjust spacing.'
              }
              relationship="description"
            >
              <span className="hidden md:inline-flex items-center gap-1 shrink-0">
                <Badge
                  appearance="tint"
                  size="small"
                  color={isOnePageFit ? 'success' : 'warning'}
                >
                  {isOnePageFit
                    ? isAutoFit
                      ? '1-Page Fit (Auto)'
                      : '1-Page Fit'
                    : `${estimatedPages} Pages`}
                </Badge>
                {!isOnePageFit && (
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<ContractDownLeftRegular />}
                    onClick={tightenToOnePage}
                    title="Tighten margins and line spacing for 1-page fit"
                    style={{ height: 22, fontSize: 10, padding: '0 6px' }}
                  >
                    Tighten
                  </Button>
                )}
              </span>
            </Tooltip>
          </>
        )}

        <span
          className="hidden xl:inline text-[11px] shrink-0"
          style={{ color: tokens.colorNeutralForeground3 }}
        >
          Margins: <span className="capitalize">{margin || 'normal'}</span>, Spacing:{' '}
          <span className="capitalize">{lineHeight || 'normal'}</span>
        </span>
      </div>

      {/* Right: Quick Tools, Find & Zoom */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <div className="hidden sm:flex items-center gap-0.5">
          <Button
            appearance="subtle"
            size="small"
            aria-label="Preflight check"
            icon={<CheckmarkCircleRegular />}
            onClick={() => setIsPreflightModalOpen(true)}
            title="Check for placeholders, broken links, or overflow before printing"
            style={{ minWidth: 'auto', height: 24, fontSize: 11 }}
          >
            <span className="hidden md:inline">Check</span>
          </Button>

          <Button
            appearance="subtle"
            size="small"
            aria-label="JD keyword matcher"
            icon={<TargetArrowRegular />}
            onClick={() => setIsJdMatcherModalOpen(true)}
            title="Compare resume keywords against a Job Description"
            style={{ minWidth: 'auto', height: 24, fontSize: 11 }}
          >
            <span className="hidden md:inline">JD Match</span>
          </Button>
        </div>

        <Button
          appearance="subtle"
          size="small"
          aria-label="Find and replace"
          icon={<SearchRegular />}
          onClick={() => setIsFindReplaceModalOpen(true)}
          title="Find and replace (Ctrl+F)"
          style={{ minWidth: 'auto', height: 24, fontSize: 11 }}
        >
          <span className="hidden sm:inline">Find</span>
        </Button>

        <span style={{ color: tokens.colorNeutralStroke1 }}>|</span>

        <Tooltip content="Zoom out" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            aria-label="Zoom out"
            icon={<ZoomOutRegular />}
            disabled={zoom <= MIN_ZOOM}
            onClick={() => handleZoomChange(-0.1)}
            style={{ minWidth: 26, height: 24 }}
          />
        </Tooltip>

        <Button
          appearance="subtle"
          size="small"
          onClick={() => setZoom(1.0)}
          title="Reset zoom to 100%"
          style={{ minWidth: 40, height: 24, fontSize: 11, fontFamily: 'monospace' }}
        >
          {Math.round(zoom * 100)}%
        </Button>

        <Tooltip content="Zoom in" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            aria-label="Zoom in"
            icon={<ZoomInRegular />}
            disabled={zoom >= MAX_ZOOM}
            onClick={() => handleZoomChange(0.1)}
            style={{ minWidth: 26, height: 24 }}
          />
        </Tooltip>
      </div>
    </footer>
  );
};
