import React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  tokens,
} from '@fluentui/react-components';
import { WarningRegular, DismissRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useResume();

  return (
    <Dialog
      open={confirmDialog.isOpen}
      onOpenChange={(_, data) => {
        if (!data.open) closeConfirm();
      }}
    >
      <DialogSurface style={{ maxWidth: 'min(400px, calc(100vw - 24px))', width: '100%', maxHeight: '90dvh', overflowY: 'auto' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={closeConfirm}
              />
            }
          >
            <span className="flex items-center gap-2">
              <WarningRegular style={{ color: tokens.colorPaletteRedForeground1 }} />
              <span>{confirmDialog.title || 'Confirm action'}</span>
            </span>
          </DialogTitle>
          <DialogContent>
            <p className="text-sm leading-relaxed py-1" style={{ color: tokens.colorNeutralForeground1 }}>
              {confirmDialog.message}
            </p>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={confirmDialog.onConfirm}
              style={{
                backgroundColor: tokens.colorPaletteRedBackground3,
                color: tokens.colorNeutralForegroundOnBrand,
              }}
            >
              {confirmDialog.confirmLabel || 'Delete'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
