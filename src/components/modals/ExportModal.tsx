import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

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
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Export Resume</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExport();
            }}
            placeholder="my_resume"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
