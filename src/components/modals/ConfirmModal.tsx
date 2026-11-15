import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useResume();

  return (
    <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && closeConfirm()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <DialogTitle>{confirmDialog.title || 'Confirmation'}</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-(--ui-text) py-2 leading-relaxed">
          {confirmDialog.message}
        </p>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={confirmDialog.onConfirm}>
            {confirmDialog.confirmLabel || 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
