import React, { useMemo } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  WarningRegular,
  InfoRegular,
  PrintRegular,
  ContractDownLeftRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { runResumePreflight } from '../../utils/resumePreflight';

export const PreflightModal: React.FC = () => {
  const {
    isPreflightModalOpen,
    setIsPreflightModalOpen,
    resumeData,
    canvasPageCount,
    tightenToOnePage,
  } = useResume();

  const issues = useMemo(
    () => (isPreflightModalOpen ? runResumePreflight(resumeData, canvasPageCount) : []),
    [isPreflightModalOpen, resumeData, canvasPageCount]
  );

  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const hasPaginationIssue = issues.some((i) => i.category === 'pagination');

  const handlePrintNow = () => {
    setIsPreflightModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  return (
    <Dialog
      open={isPreflightModalOpen}
      onOpenChange={(_, data) => setIsPreflightModalOpen(data.open)}
    >
      <DialogSurface
        style={{
          maxWidth: 'min(520px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsPreflightModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              {warningCount > 0 ? (
                <WarningRegular style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
              ) : (
                <CheckmarkCircleRegular style={{ color: tokens.colorPaletteGreenForeground1 }} />
              )}
              <span>Pre-Export Preflight Check</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              {issues.length === 0 ? (
                <div
                  className="p-3 rounded-md border flex items-center gap-2.5 text-xs"
                  style={{
                    backgroundColor: tokens.colorPaletteGreenBackground1,
                    borderColor: tokens.colorPaletteGreenBorder1,
                    color: tokens.colorNeutralForeground1,
                  }}
                >
                  <CheckmarkCircleRegular
                    fontSize={20}
                    style={{ color: tokens.colorPaletteGreenForeground1 }}
                  />
                  <div>
                    <strong className="block text-sm">Your resume passed all readiness checks!</strong>
                    <span>No sample placeholders, blank links, or unexpected page spills found.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span style={{ color: tokens.colorNeutralForeground2 }}>
                      Review these items before sharing your PDF:
                    </span>
                    <Badge
                      appearance="tint"
                      color={warningCount > 0 ? 'warning' : 'informative'}
                      size="small"
                    >
                      {issues.length} item{issues.length === 1 ? '' : 's'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                    {issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-2.5 rounded-md border flex items-start gap-2 text-xs"
                        style={{
                          backgroundColor: tokens.colorNeutralBackground2,
                          borderColor: tokens.colorNeutralStroke1,
                        }}
                      >
                        {issue.severity === 'warning' ? (
                          <WarningRegular
                            fontSize={16}
                            className="shrink-0 mt-0.5"
                            style={{ color: tokens.colorPaletteMarigoldForeground1 }}
                          />
                        ) : (
                          <InfoRegular
                            fontSize={16}
                            className="shrink-0 mt-0.5"
                            style={{ color: tokens.colorBrandForeground1 }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span
                            className="font-semibold block"
                            style={{ color: tokens.colorNeutralForeground1 }}
                          >
                            {issue.title}
                          </span>
                          <span style={{ color: tokens.colorNeutralForeground3 }}>
                            {issue.detail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasPaginationIssue && (
                    <Button
                      appearance="outline"
                      size="small"
                      icon={<ContractDownLeftRegular />}
                      onClick={() => tightenToOnePage()}
                    >
                      Tighten Spacing &amp; Margins for 1-Page Fit
                    </Button>
                  )}
                </>
              )}
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsPreflightModalOpen(false)}>
              Back to Edit
            </Button>
            <Button
              appearance="primary"
              icon={<PrintRegular />}
              onClick={handlePrintNow}
            >
              {issues.length > 0 ? 'Print / PDF Anyway' : 'Print / Save PDF'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
