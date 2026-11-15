import React, { useState, useEffect } from 'react';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { Ribbon } from './components/ribbon/Ribbon';
import { ResumeCanvas } from './components/resume/ResumeCanvas';
import { MobileUnsupportedView } from './components/mobile/MobileUnsupportedView';
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

const ResumeAppContent: React.FC = () => {
  const { setZoom } = useResume();
  const [isMobileDismissed, setIsMobileDismissed] = useState(false);
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(true);

  // Detect tablet vs mobile phone on mount and resize
  useEffect(() => {
    const checkDevice = () => {
      const screenW = window.innerWidth;
      // Tablets (iPad, Android Tablet) typically have width >= 640px or tablet user-agent
      const ua = navigator.userAgent.toLowerCase();
      const isTabletUa = /ipad|tablet|(android(?!.*mobile))|silk|playbook/.test(ua);
      setIsTabletOrDesktop(screenW >= 640 || isTabletUa);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

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
    <div className="h-screen w-screen overflow-hidden bg-(--ui-bg) text-(--ui-text) flex flex-col print:bg-white print:h-auto print:w-auto print:overflow-visible print:block print:p-0 print:m-0">
      {/* Mobile Unsupported Screen (Only on phones < 640px; tablets and desktops work fine) */}
      {!isMobileDismissed && !isTabletOrDesktop && (
        <MobileUnsupportedView onDismiss={() => setIsMobileDismissed(true)} />
      )}

      {/* Microsoft Word Style Ribbon Navigation & Controls */}
      <Ribbon />

      {/* Main Document Canvas View (Single scroll container for both vertical & horizontal overflow when zooming) */}
      <main className="flex-1 w-full overflow-auto p-4 sm:p-6 lg:p-8 pb-20 flex flex-col items-center justify-start print:m-0 print:p-0 print:bg-transparent print:h-auto print:overflow-visible print:block">
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
