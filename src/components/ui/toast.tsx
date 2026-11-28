import React, { useEffect, useId } from 'react';
import {
  Toaster,
  Toast as FluentToast,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';
import { useResume } from '../../context/ResumeContext';

const SINGLE_TOAST_ID = 'active-status-toast';

export const Toast: React.FC = () => {
  const { toast } = useResume();
  const toasterId = useId();
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId);

  useEffect(() => {
    if (toast.show && toast.message) {
      dismissAllToasts();
      dispatchToast(
        <FluentToast>
          <ToastTitle>{toast.message}</ToastTitle>
        </FluentToast>,
        { toastId: SINGLE_TOAST_ID, timeout: 1800, intent: 'info' }
      );
    }
  }, [toast.id, toast.show, toast.message, dispatchToast, dismissAllToasts]);

  return <Toaster toasterId={toasterId} position="bottom" />;
};
