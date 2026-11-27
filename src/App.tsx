import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FluentProvider, tokens } from '@fluentui/react-components';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { wordLightTheme, wordDarkTheme } from './styles/fluentTheme';
import { Ribbon } from './components/ribbon/Ribbon';
import { ResumeCanvas } from './components/resume/ResumeCanvas';
import { MobileUnsupportedView } from './components/mobile/MobileUnsupportedView';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AlertModal } from './components/modals/AlertModal';
import { Toast } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const LinkModal = lazy(() =>
  import('./components/modals/LinkModal').then((m) => ({ default: m.LinkModal }))
);
const ExportModal = lazy(() =>
  import('./components/modals/ExportModal').then((m) => ({ default: m.ExportModal }))
);
const FindReplaceModal = lazy(() =>
  import('./components/modals/FindReplaceModal').then((m) => ({ default: m.FindReplaceModal }))
);
const SignatureModal = lazy(() =>
  import('./components/modals/SignatureModal').then((m) => ({ default: m.SignatureModal }))
);
const PdfAiImportModal = lazy(() =>
  import('./components/modals/PdfAiImportModal').then((m) => ({ default: m.PdfAiImportModal }))
);
const ImageCropModal = lazy(() =>
  import('./components/modals/ImageCropModal').then((m) => ({ default: m.ImageCropModal }))
);

const ResumeAppContent: React.FC = () => {
  const { setResponsiveZoom, isDarkMode } = useResume();
  const [isMobileDismissed, setIsMobileDismissed] = useState(false);
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const shortestSide = Math.min(screenW, screenH);
      const ua = navigator.userAgent.toLowerCase();
      const isTabletUa = /ipad|tablet|(android(?!.*mobile))|silk|playbook/.test(ua);
      setIsTabletOrDesktop(isTabletUa || (screenW >= 640 && shortestSide >= 520));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const calculateFitZoom = () => {
      const screenW = window.innerWidth;
      if (screenW <= 1024) {
        const sidePadding = screenW < 640 ? 16 : 32;
        const availableW = Math.max(280, screenW - sidePadding);
        const RESUME_WIDTH_PX = 794;
        const fitScale = Math.max(
          0.35,
          Math.min(1.0, Math.round((availableW / RESUME_WIDTH_PX) * 100) / 100)
        );
        setResponsiveZoom(fitScale);
      } else {
        setResponsiveZoom(null);
      }
    };

    calculateFitZoom();

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
  }, [setResponsiveZoom]);

  return (
    <FluentProvider theme={isDarkMode ? wordDarkTheme : wordLightTheme}>
      <div
        className="app-shell h-screen w-screen overflow-hidden flex flex-col print:bg-white print:h-auto print:w-auto print:overflow-visible print:block print:p-0 print:m-0"
        style={{
          backgroundColor: tokens.colorNeutralBackground3,
          color: tokens.colorNeutralForeground1,
        }}
      >
        {!isMobileDismissed && !isTabletOrDesktop && (
          <MobileUnsupportedView onDismiss={() => setIsMobileDismissed(true)} />
        )}

        <Ribbon />

        <main
          className="flex-1 w-full overflow-auto p-4 sm:p-6 lg:p-8 pb-20 flex flex-col items-center justify-start print:m-0 print:p-0 print:bg-transparent print:h-auto print:overflow-visible print:block"
          style={{ backgroundColor: tokens.colorNeutralBackground3 }}
        >
          <ErrorBoundary>
            <ResumeCanvas />
          </ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Suspense fallback={null}>
            <LinkModal />
            <ExportModal />
            <FindReplaceModal />
            <SignatureModal />
            <PdfAiImportModal />
            <ImageCropModal />
          </Suspense>
          <ConfirmModal />
          <AlertModal />
          <Toast />
        </ErrorBoundary>
      </div>
    </FluentProvider>
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
