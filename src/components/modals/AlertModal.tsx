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
import { InfoRegular, DismissRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';

export const AlertModal: React.FC = () => {
  const { alertDialog, closeAlert } = useResume();

  return (
    <Dialog
      open={alertDialog.isOpen}
      onOpenChange={(_, data) => {
        if (!data.open) closeAlert();
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
                onClick={closeAlert}
              />
            }
          >
            <span className="flex items-center gap-2">
              <InfoRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{alertDialog.title || 'Notice'}</span>
            </span>
          </DialogTitle>
          <DialogContent>
            <p className="text-sm leading-relaxed py-1" style={{ color: tokens.colorNeutralForeground1 }}>
              {alertDialog.message}
            </p>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={closeAlert}>
              OK
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
