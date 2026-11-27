import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  tokens,
} from '@fluentui/react-components';
import { ArrowDownloadRegular, DismissRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, exportResume, resumeData } = useResume();
  const [fileName, setFileName] = useState('my_resume');

  useEffect(() => {
    if (isExportModalOpen) {
      const name = resumeData.header.fullName.replace(/^\[|\]$/g, '').trim();
      if (name && name !== 'Your Full Name') {
        setFileName(`${name} Resume`);
      } else {
        setFileName('My_Resume');
      }
    }
  }, [isExportModalOpen, resumeData.header.fullName]);

  const handleExport = () => {
    exportResume(fileName);
  };

  return (
    <Dialog
      open={isExportModalOpen}
      onOpenChange={(_, data) => setIsExportModalOpen(data.open)}
    >
      <DialogSurface style={{ maxWidth: 420 }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsExportModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <ArrowDownloadRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Export resume project</span>
            </span>
          </DialogTitle>
          <DialogContent>
            <div className="py-1 space-y-2">
              <Field
                label="File name"
                hint="Saves a .resumeBuilder backup file that you can import later."
              >
                <Input
                  value={fileName}
                  onChange={(_, data) => setFileName(data.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExport();
                  }}
                  placeholder="my_resume"
                  contentAfter={
                    <span
                      className="text-xs font-mono"
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      .resumeBuilder
                    </span>
                  }
                  autoFocus
                />
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              icon={<ArrowDownloadRegular />}
              onClick={handleExport}
            >
              Export
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
