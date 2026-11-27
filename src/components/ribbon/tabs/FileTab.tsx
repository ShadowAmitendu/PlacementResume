import React, { useRef } from 'react';
import {
  SaveRegular,
  DeleteRegular,
  ArrowExportRegular,
  ArrowImportRegular,
  PrintRegular,
  DocumentPdfRegular,
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

      {/* Project Files Group */}
      <RibbonGroup label="Backup & import">
        <RibbonActionButton
          icon={<ArrowExportRegular />}
          label="Export"
          onClick={() => setIsExportModalOpen(true)}
          title="Download project backup (.resumeBuilder)"
        />
        <RibbonActionButton
          icon={<ArrowImportRegular />}
          label="Import"
          onClick={() => fileInputRef.current?.click()}
          title="Import .resumeBuilder, .json, or .pdf file"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".resbuild,.resumeBuilder,.html,.json,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </RibbonGroup>

      {/* Output Group */}
      <RibbonGroup label="Document output">
        <RibbonActionButton
          icon={<PrintRegular />}
          label="Print / PDF"
          appearance="primary"
          onClick={() => window.print()}
          title="Open system print dialog to save PDF (Ctrl+P)"
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
