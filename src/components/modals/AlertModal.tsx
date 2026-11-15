import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

export const AlertModal: React.FC = () => {
  const { alertDialog, closeAlert } = useResume();

  return (
    <Dialog open={alertDialog.isOpen} onOpenChange={(open) => !open && closeAlert()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <DialogTitle>{alertDialog.title || 'Notice'}</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-[var(--ui-text)] py-2 leading-relaxed">
          {alertDialog.message}
        </p>

        <DialogFooter>
          <Button size="sm" onClick={closeAlert} className="min-w-20">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
