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
import { PdfAiImportModal } from './components/modals/PdfAiImportModal';
import { ImageCropModal } from './components/modals/ImageCropModal';
import { Toast } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Menu, Undo2, Redo2, Save, Printer } from 'lucide-react';

const ResumeAppContent: React.FC = () => {
  const {
    setIsMobileSidebarOpen,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    saveToBrowser,
  } = useResume();

  // Responsive auto-fit zoom on mount and window resize / orientation change
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const calculateFitZoom = () => {
      const screenW = window.innerWidth;
      if (screenW <= 1024) {
        // Leave comfortable breathing room on sides (16px total on phone, 32px on tablet)
        const sidePadding = screenW < 640 ? 16 : 32;
        const availableW = Math.max(280, screenW - sidePadding);
        const RESUME_WIDTH_PX = 794;
        const fitScale = Math.max(0.35, Math.min(1.0, Math.round((availableW / RESUME_WIDTH_PX) * 100) / 100));
        setZoom(fitScale);
      }
    };

    // Calculate on initial mount
    if (window.innerWidth <= 1024) {
      calculateFitZoom();
    }

    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(calculateFitZoom, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [setZoom]);

  return (
    <div className="min-h-screen bg-(--ui-bg) text-(--ui-text) flex flex-col lg:flex-row print:bg-white print:min-h-0 print:block print:p-0 print:m-0">
      {/* Mobile & Tablet Sticky Top Bar */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 h-13 bg-(--ui-surface) border-b border-(--ui-border) px-3 sm:px-4 flex items-center justify-between no-print shadow-xs backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open controls sidebar"
            className="p-2 rounded-lg bg-(--ui-surface2) hover:bg-(--ui-surface3) text-foreground transition-colors cursor-pointer flex items-center justify-center active:scale-95 touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm tracking-wide text-foreground leading-tight">
              PlacementResume
            </span>
            <span className="text-[10px] text-(--ui-text-dim) leading-tight hidden sm:inline">
              Interactive Resume Editor
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
            className="p-1.5 sm:p-2 rounded-md hover:bg-(--ui-surface2) text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-95 touch-manipulation"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo"
            className="p-1.5 sm:p-2 rounded-md hover:bg-(--ui-surface2) text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-95 touch-manipulation"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={saveToBrowser}
            aria-label="Save to browser"
            title="Save to browser"
            className="p-1.5 sm:p-2 rounded-md hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95 touch-manipulation"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print or save as PDF"
            title="Print / Save PDF"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold cursor-pointer shadow-xs transition-colors active:scale-95 touch-manipulation"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <main className="flex-1 lg:ml-72 min-h-screen p-2 sm:p-6 lg:p-8 pb-20 flex flex-col items-center justify-start overflow-x-hidden print:m-0 print:p-0 print:bg-transparent print:min-h-0 print:block">
        <ErrorBoundary>
          <ResumeCanvas />
        </ErrorBoundary>
      </main>

      {/* Modals & Notifications */}
      <ErrorBoundary>
        <LinkModal />
        <ExportModal />
        <FindReplaceModal />
        <SignatureModal />
        <PdfAiImportModal />
        <ImageCropModal />
        <ConfirmModal />
        <AlertModal />
        <Toast />
      </ErrorBoundary>
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
