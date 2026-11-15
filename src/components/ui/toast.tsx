import React from 'react';
import { useResume } from '../../context/ResumeContext';

export const Toast: React.FC = () => {
  const { toast } = useResume();

  if (!toast.show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded-lg text-sm shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2"
    >
      {toast.message}
    </div>
  );
};
