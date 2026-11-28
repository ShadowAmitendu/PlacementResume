import React, { useMemo } from 'react';
import { Button, Badge, Tooltip, tokens } from '@fluentui/react-components';
import {
  SearchRegular,
  ZoomInRegular,
  ZoomOutRegular,
  DocumentRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { TextSectionData, ListSectionData, TableSectionData } from '../../types/resume';
import { A4_HEIGHT_PX, MIN_ZOOM, MAX_ZOOM, htmlToPlainText } from '../../utils/documentMetrics';

interface DocumentStatusBarProps {
  wrapperHeight: number;
  isAutoFit?: boolean;
}

export const DocumentStatusBar: React.FC<DocumentStatusBarProps> = ({
  wrapperHeight,
  isAutoFit,
}) => {
  const { resumeData, setZoom, setIsFindReplaceModalOpen } = useResume();
  const { zoom, margin, lineHeight } = resumeData.meta;

  const { wordCount, charCount } = useMemo(() => {
    let fullText = '';
    const append = (str?: string | null) => {
      if (str) {
        const plain = htmlToPlainText(str);
        fullText += ' ' + plain;
      }
    };

    append(resumeData.header.fullName);
    append(resumeData.header.degreeTitle);
    append(resumeData.header.universityCompany);
    append(resumeData.header.email);
    append(resumeData.header.phone);
    append(resumeData.header.location);
    resumeData.header.links.forEach((l) => append(l.text));

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

    append(resumeData.declaration.text);
    append(resumeData.declaration.date);
    append(resumeData.declaration.place);

    const trimmed = fullText.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = trimmed.replace(/\s+/g, '').length;

    return { wordCount: words, charCount: chars };
  }, [resumeData]);

  const estimatedPages = Math.max(1, Math.ceil(wrapperHeight / A4_HEIGHT_PX));
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
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap overflow-x-auto scrollbar-none min-w-0 shrink">
        <span
          className="flex items-center gap-1 font-medium shrink-0"
          style={{ color: tokens.colorNeutralForeground1 }}
        >
          <DocumentRegular fontSize={13} />
          <span>Page 1 of {estimatedPages}</span>
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
                  : 'Content exceeds 1 page. Adjust margins or spacing for a 1-page fit.'
              }
              relationship="description"
            >
              <span className="hidden md:inline-flex shrink-0">
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
              </span>
            </Tooltip>
          </>
        )}

        <span
          className="hidden lg:inline text-[11px] shrink-0"
          style={{ color: tokens.colorNeutralForeground3 }}
        >
          Margins: <span className="capitalize">{margin || 'normal'}</span>, Spacing:{' '}
          <span className="capitalize">{lineHeight || 'normal'}</span>
        </span>
      </div>

      {/* Right: Find & Zoom */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
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
