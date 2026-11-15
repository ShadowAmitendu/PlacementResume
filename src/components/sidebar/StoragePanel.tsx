import React, { useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Save, Trash2, Download, Upload, FileDown, Sparkles } from 'lucide-react';

export const StoragePanel: React.FC = () => {
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
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        Save &amp; Export
      </span>

      <div className="space-y-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={clearBrowserSave}
          className="w-full justify-start text-xs h-9 gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Browser Save</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={saveToBrowser}
          className="w-full justify-start text-xs h-9 gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save to Browser</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="w-full justify-start text-xs h-9 gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .resumeBuilder</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPdfAiModalOpen(true)}
          className="w-full justify-start text-xs h-9 gap-2 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Upload Old Resume (PDF AI)</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-start text-xs h-9 gap-2"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import File</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".resbuild,.resumeBuilder,.html,.json,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="pt-2">
          <Button
            size="sm"
            onClick={() => window.print()}
            className="w-full justify-center text-xs h-10 gap-2 bg-primary text-primary-foreground font-semibold shadow-md"
          >
            <FileDown className="w-4 h-4" />
            <span>Download as PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
