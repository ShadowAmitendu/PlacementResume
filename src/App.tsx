import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { FluentProvider, tokens } from '@fluentui/react-components';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { wordLightTheme, wordDarkTheme } from './styles/fluentTheme';
import { Ribbon } from './components/ribbon/Ribbon';
import { ResumeCanvas } from './components/resume/ResumeCanvas';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AlertModal } from './components/modals/AlertModal';
import { Toast } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MIN_ZOOM } from './utils/documentMetrics';

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
  const lastWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const calculateFitZoom = () => {
      const screenW = window.innerWidth;
      lastWidthRef.current = screenW;
      if (screenW <= 1024) {
        const sidePadding = screenW < 640 ? 20 : 52;
        const availableW = Math.max(240, screenW - sidePadding);
        const RESUME_WIDTH_PX = 794;
        const fitScale = Math.max(
          MIN_ZOOM,
          Math.min(1.0, Math.round((availableW / RESUME_WIDTH_PX) * 100) / 100)
        );
        setResponsiveZoom(fitScale);
      } else {
        setResponsiveZoom(null);
      }
    };

    calculateFitZoom();

    const handleWidthResize = () => {
      // Ignore height-only resizes (e.g. mobile virtual keyboard opening)
      if (window.innerWidth === lastWidthRef.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(calculateFitZoom, 100);
    };

    const handleOrientation = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(calculateFitZoom, 150);
    };

    window.addEventListener('resize', handleWidthResize);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleWidthResize);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, [setResponsiveZoom]);

  return (
    <FluentProvider theme={isDarkMode ? wordDarkTheme : wordLightTheme}>
      <div
        className="app-shell h-dvh w-full overflow-hidden flex flex-col print:bg-white print:h-auto print:w-auto print:overflow-visible print:block print:p-0 print:m-0"
        style={{
          backgroundColor: tokens.colorNeutralBackground3,
          color: tokens.colorNeutralForeground1,
        }}
      >
        <Ribbon />

        <main
          className="flex-1 w-full overflow-auto touch-pan-x touch-pan-y px-2 py-3 sm:px-4 sm:py-5 lg:p-8 pb-16 sm:pb-20 print:m-0 print:p-0 print:bg-transparent print:h-auto print:overflow-visible print:block"
          style={{
            backgroundColor: tokens.colorNeutralBackground3,
            WebkitOverflowScrolling: 'touch',
          }}
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
