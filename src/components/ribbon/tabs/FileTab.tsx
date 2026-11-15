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
    <div className="flex items-stretch h-full gap-1.5 sm:gap-2.5 py-1 px-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Save & Browser Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1 my-auto">
          <button
            type="button"
            onClick={saveToBrowser}
            title="Save to browser localStorage (Ctrl+S)"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-[#0f6cbd] dark:text-[#2886de] flex items-center justify-center">
              <Save className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Save</span>
          </button>

          <button
            type="button"
            onClick={clearBrowserSave}
            title="Clear browser storage and reset to default template"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-destructive cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Reset</span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Browser Save
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Export & Backup Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1 my-auto">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Export resume project backup file (.resumeBuilder)"
            className="fluent-btn w-16 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none text-center">Export Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import an existing .resumeBuilder, .json, or .pdf file"
            className="fluent-btn w-14 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none text-center">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".resbuild,.resumeBuilder,.html,.json,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Files &amp; Backup
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Print / PDF Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={() => window.print()}
            title="Print or Save as PDF (Ctrl+P)"
            className="fluent-btn h-14 px-3 flex flex-col items-center justify-center rounded-md bg-[#0f6cbd] dark:bg-[#2886de] text-white hover:brightness-105 active:scale-95 cursor-pointer shadow-xs transition-all font-semibold"
          >
            <Printer className="w-4 h-4 mb-1" />
            <span className="text-xs leading-none">Print / Save PDF</span>
            <span className="text-[9px] opacity-80 mt-0.5">High-res vector</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Advanced Export options"
            className="fluent-btn w-14 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-foreground flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Options...</span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Print &amp; Export
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── AI Assistant Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center my-auto">
          <button
            type="button"
            onClick={() => setIsPdfAiModalOpen(true)}
            title="Import and parse an existing PDF resume using Gemini AI"
            className="h-14 px-3 flex items-center gap-2.5 rounded-md border border-[#0f6cbd]/40 dark:border-[#2886de]/40 bg-[#0f6cbd]/10 dark:bg-[#2886de]/20 hover:bg-[#0f6cbd]/15 dark:hover:bg-[#2886de]/25 text-[#0f6cbd] dark:text-[#2886de] cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <Sparkles className="w-5 h-5" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight">AI Resume Parser</span>
              <span className="text-[10px] opacity-80 leading-tight">Import from old PDF</span>
            </div>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          AI Tools
        </span>
      </div>
    </div>
  );
};
