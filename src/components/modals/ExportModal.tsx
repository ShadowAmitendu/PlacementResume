import React, { useState, useEffect, useMemo } from 'react';
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
  Textarea,
  Badge,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowDownloadRegular,
  CopyRegular,
  CheckmarkRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import {
  exportResumeToDocxBlob,
  exportResumeToMarkdown,
  exportResumeToPlainText,
} from '../../utils/exporters';

type ExportFormat = 'rsbld' | 'docx' | 'md' | 'txt';

const FORMAT_OPTIONS: Array<{
  id: ExportFormat;
  ext: string;
  label: string;
  desc: string;
}> = [
  {
    id: 'rsbld',
    ext: '.rsbld',
    label: 'Project Backup',
    desc: 'Lossless editable PlacementResume project file',
  },
  {
    id: 'docx',
    ext: '.docx',
    label: 'Word Document',
    desc: 'Native Microsoft Word / Google Docs compatible file',
  },
  {
    id: 'md',
    ext: '.md',
    label: 'Markdown',
    desc: 'Clean GitHub / Notion / portfolio markdown text',
  },
  {
    id: 'txt',
    ext: '.txt',
    label: 'ATS Plain Text',
    desc: 'Linear reading order for portal forms & clipboard paste',
  },
];

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, exportResume, resumeData, showToast } =
    useResume();
  const [fileName, setFileName] = useState('my_resume');
  const [format, setFormat] = useState<ExportFormat>('rsbld');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isExportModalOpen) {
      const name = resumeData.header.fullName.replace(/^\[|\]$/g, '').trim();
      if (name && name !== 'Your Full Name') {
        setFileName(`${name} Resume`);
      } else {
        setFileName('My_Resume');
      }
      setCopied(false);
    }
  }, [isExportModalOpen, resumeData.header.fullName]);

  const plainPreview = useMemo(() => {
    if (!isExportModalOpen) return '';
    if (format === 'md') return exportResumeToMarkdown(resumeData);
    if (format === 'txt') return exportResumeToPlainText(resumeData);
    return '';
  }, [isExportModalOpen, format, resumeData]);

  const triggerDownload = (blob: Blob, extension: string) => {
    const cleanName = fileName.trim() || 'my_resume';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanName}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
    showToast(`Exported as ${cleanName}${extension}`);
  };

  const handleExport = () => {
    if (format === 'rsbld') {
      exportResume(fileName);
      return;
    }
    if (format === 'docx') {
      const blob = exportResumeToDocxBlob(resumeData);
      triggerDownload(blob, '.docx');
      return;
    }
    if (format === 'md') {
      const md = exportResumeToMarkdown(resumeData);
      triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8' }), '.md');
      return;
    }
    const txt = exportResumeToPlainText(resumeData);
    triggerDownload(new Blob([txt], { type: 'text/plain;charset=utf-8' }), '.txt');
  };

  const handleCopyPlain = async () => {
    const text = format === 'md' ? exportResumeToMarkdown(resumeData) : exportResumeToPlainText(resumeData);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied resume text to clipboard');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Clipboard write blocked; download the file instead');
    }
  };

  const activeOpt = FORMAT_OPTIONS.find((f) => f.id === format) || FORMAT_OPTIONS[0];

  return (
    <Dialog
      open={isExportModalOpen}
      onOpenChange={(_, data) => setIsExportModalOpen(data.open)}
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
                onClick={() => setIsExportModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <ArrowDownloadRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Export Resume</span>
            </span>
          </DialogTitle>
          <DialogContent>
            <div className="py-1 space-y-3">
              <Field label="Export format">
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {FORMAT_OPTIONS.map((opt) => {
                    const selected = format === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormat(opt.id)}
                        className="p-2 rounded-md border text-left cursor-pointer transition-colors"
                        style={{
                          backgroundColor: selected
                            ? tokens.colorBrandBackground2
                            : tokens.colorNeutralBackground2,
                          borderColor: selected
                            ? tokens.colorBrandStroke1
                            : tokens.colorNeutralStroke1,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: tokens.colorNeutralForeground1 }}
                          >
                            {opt.label}
                          </span>
                          <Badge appearance={selected ? 'filled' : 'outline'} size="small">
                            {opt.ext}
                          </Badge>
                        </div>
                        <span
                          className="text-[10px] block mt-0.5 leading-snug"
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="File name" hint={activeOpt.desc}>
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
                      {activeOpt.ext}
                    </span>
                  }
                  autoFocus
                />
              </Field>

              {(format === 'txt' || format === 'md') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: tokens.colorNeutralForeground2 }}
                    >
                      ATS / Text Reading Order Preview
                    </span>
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
                      onClick={handleCopyPlain}
                    >
                      {copied ? 'Copied' : 'Copy Text'}
                    </Button>
                  </div>
                  <Textarea
                    value={plainPreview}
                    readOnly
                    rows={6}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 11 }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            {(format === 'txt' || format === 'md') && (
              <Button
                appearance="outline"
                icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
                onClick={handleCopyPlain}
              >
                Copy
              </Button>
            )}
            <Button
              appearance="primary"
              icon={<ArrowDownloadRegular />}
              onClick={handleExport}
            >
              Download {activeOpt.ext}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
