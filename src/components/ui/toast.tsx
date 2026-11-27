import React, { useEffect, useId } from 'react';
import {
  Toaster,
  Toast as FluentToast,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';
import { useResume } from '../../context/ResumeContext';

export const Toast: React.FC = () => {
  const { toast } = useResume();
  const toasterId = useId();
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    if (toast.show && toast.message) {
      dispatchToast(
        <FluentToast>
          <ToastTitle>{toast.message}</ToastTitle>
        </FluentToast>,
        { timeout: 2200, intent: 'info' }
      );
    }
  }, [toast.id, toast.show, toast.message, dispatchToast]);

  return <Toaster toasterId={toasterId} position="bottom" />;
};
