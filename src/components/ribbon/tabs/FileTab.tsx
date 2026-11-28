import React, { useRef } from 'react';
import {
  SaveRegular,
  DeleteRegular,
  ArrowExportRegular,
  ArrowImportRegular,
  PrintRegular,
  DocumentPdfRegular,
  FolderRegular,
  DocumentSparkleRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { RibbonGroup, RibbonActionButton } from '../RibbonGroup';

export const FileTab: React.FC = () => {
  const {
    saveToBrowser,
    clearBrowserSave,
    setIsExportModalOpen,
    importResume,
    setIsPdfAiModalOpen,
    setIsResumesModalOpen,
    setIsTemplatesModalOpen,
    setIsPreflightModalOpen,
    triggerPrintWithPreflight,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importResume(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Resumes & Templates */}
      <RibbonGroup label="Resumes">
        <RibbonActionButton
          icon={<FolderRegular />}
          label="Versions"
          onClick={() => setIsResumesModalOpen(true)}
          title="Manage multiple saved resume versions"
        />
        <RibbonActionButton
          icon={<DocumentSparkleRegular />}
          label="Templates"
          onClick={() => setIsTemplatesModalOpen(true)}
          title="Load a role-based placement or tech CV template"
        />
      </RibbonGroup>

      {/* Storage Group */}
      <RibbonGroup label="Browser storage">
        <RibbonActionButton
          icon={<SaveRegular />}
          label="Save"
          onClick={saveToBrowser}
          title="Save resume to browser storage (Ctrl+S)"
        />
        <RibbonActionButton
          icon={<DeleteRegular />}
          label="Reset"
          onClick={clearBrowserSave}
          title="Reset to default template and clear browser save"
          dangerHover
        />
      </RibbonGroup>

      {/* Project Files & Formats */}
      <RibbonGroup label="Export & import">
        <RibbonActionButton
          icon={<ArrowExportRegular />}
          label="Export"
          onClick={() => setIsExportModalOpen(true)}
          title="Export as .rsbld, Word (.docx), Markdown, or ATS plain text"
        />
        <RibbonActionButton
          icon={<ArrowImportRegular />}
          label="Import"
          onClick={() => fileInputRef.current?.click()}
          title="Import .rsbld, .json, or .pdf file"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".rsbld,.resumeBuilder,.html,.json,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </RibbonGroup>

      {/* Output Group */}
      <RibbonGroup label="Document output">
        <RibbonActionButton
          icon={<CheckmarkCircleRegular />}
          label="Preflight"
          onClick={() => setIsPreflightModalOpen(true)}
          title="Check for placeholders, sample URLs, or page overflow"
        />
        <RibbonActionButton
          icon={<PrintRegular />}
          label="Print / PDF"
          appearance="primary"
          onClick={triggerPrintWithPreflight}
          title="Run preflight check & save PDF (Ctrl+P)"
        />
      </RibbonGroup>

      {/* PDF Extraction */}
      <RibbonGroup label="PDF parser" showDivider={false}>
        <RibbonActionButton
          icon={<DocumentPdfRegular />}
          label="Import PDF"
          onClick={() => setIsPdfAiModalOpen(true)}
          title="Extract data from an existing resume PDF"
        />
      </RibbonGroup>
    </div>
  );
};
