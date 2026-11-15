import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export const AlertModal: React.FC = () => {
  const { alertDialog, closeAlert } = useResume();

  return (
    <Dialog open={alertDialog.isOpen} onOpenChange={(open) => !open && closeAlert()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{alertDialog.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground py-2 leading-relaxed">
          {alertDialog.message}
        </p>

        <DialogFooter className="flex justify-end">
          <Button size="sm" onClick={closeAlert}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
