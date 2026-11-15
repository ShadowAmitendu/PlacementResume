import React, { useEffect } from 'react';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { ResumeCanvas } from './components/resume/ResumeCanvas';
import { LinkModal } from './components/modals/LinkModal';
import { ExportModal } from './components/modals/ExportModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AlertModal } from './components/modals/AlertModal';
import { FindReplaceModal } from './components/modals/FindReplaceModal';
import { SignatureModal } from './components/modals/SignatureModal';
import { Toast } from './components/ui/toast';
import { Menu } from 'lucide-react';

const ResumeAppContent: React.FC = () => {
  const { setIsMobileSidebarOpen, setZoom } = useResume();

  // Auto-fit zoom on mount for smaller screens
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      const availableWidth = window.innerWidth - 32;
      const resumeWidth = 794;
      const fitScale = Math.max(0.4, Math.min(1, Math.round((availableWidth / resumeWidth) * 100) / 100));
      setZoom(fitScale);
    }
  }, [setZoom]);

  return (
    <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)] flex">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(true)}
        aria-label="Toggle Sidebar"
        className="fixed bottom-6 right-6 z-40 lg:hidden p-3.5 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-primary/90 cursor-pointer no-print flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <main className="flex-1 lg:ml-72 min-h-screen p-4 sm:p-8 pb-16 flex flex-col items-center justify-start overflow-x-hidden">
        <ResumeCanvas />
      </main>

      {/* Modals & Notifications */}
      <LinkModal />
      <ExportModal />
      <FindReplaceModal />
      <SignatureModal />
      <ConfirmModal />
      <AlertModal />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ResumeProvider>
      <ResumeAppContent />
    </ResumeProvider>
  );
};

export default App;
