import React, { useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import {
  Save,
  Trash2,
  Download,
  Upload,
  Printer,
  FileDown,
  Sparkles,
} from 'lucide-react';

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
    <div className="flex items-stretch h-full gap-2 sm:gap-3 py-1 px-2 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Save & Browser Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={saveToBrowser}
            title="Save to browser localStorage (Ctrl+S)"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Save className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Save</span>
          </button>

          <button
            type="button"
            onClick={clearBrowserSave}
            title="Clear browser storage and reset to default resume template"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-destructive cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Reset</span>
          </button>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Browser Storage
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Export & Backup Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Export resume project backup file (.resumeBuilder)"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Export Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import an existing .resumeBuilder, .json, or .pdf file"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Import File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".resbuild,.resumeBuilder,.html,.json,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Backup &amp; Files
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Print / PDF Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={() => window.print()}
            title="Print or Save as PDF (Ctrl+P)"
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs transition-colors active:scale-95 font-semibold"
          >
            <div className="flex items-center gap-1.5">
              <Printer className="w-4 h-4" />
              <span className="text-xs">Print / Save PDF</span>
            </div>
            <span className="text-[9px] opacity-80 mt-0.5">High-res vector output</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Advanced Export options"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-(--ui-surface3) text-foreground flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Options...</span>
          </button>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Print &amp; Export
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── AI Assistant Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center my-auto">
          <button
            type="button"
            onClick={() => setIsPdfAiModalOpen(true)}
            title="Import and parse an existing PDF resume using Gemini AI"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition-colors active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight">AI Resume Parser</span>
              <span className="text-[10px] opacity-80 leading-tight">Import from old PDF</span>
            </div>
          </button>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          AI Tools
        </span>
      </div>
    </div>
  );
};
