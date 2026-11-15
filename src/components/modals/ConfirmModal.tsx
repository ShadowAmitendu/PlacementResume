import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useResume();

  return (
    <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && closeConfirm()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground py-2 leading-relaxed">
          {confirmDialog.message}
        </p>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={confirmDialog.onConfirm}>
            {confirmDialog.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
