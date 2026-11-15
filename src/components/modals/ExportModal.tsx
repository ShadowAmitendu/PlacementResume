import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

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
    <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary shrink-0" />
            <DialogTitle>Export Resume</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block">
            File Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExport();
              }}
              placeholder="my_resume"
              className="flex-1 px-3 py-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface2)] text-[var(--ui-text)] text-sm focus:outline-none transition-colors"
              autoFocus
            />
            <span className="text-xs text-[var(--ui-text-dim)] font-mono">.resumeBuilder</span>
          </div>
          <p className="text-[11px] text-[var(--ui-text-dim)]">
            Downloads a .resumeBuilder file you can import back anytime.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
