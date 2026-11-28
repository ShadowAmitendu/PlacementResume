import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { FluentProvider, Button, tokens } from '@fluentui/react-components';
import { EyeOffRegular } from '@fluentui/react-icons';
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
const ResumesModal = lazy(() =>
  import('./components/modals/ResumesModal').then((m) => ({ default: m.ResumesModal }))
);
const TemplatesModal = lazy(() =>
  import('./components/modals/TemplatesModal').then((m) => ({ default: m.TemplatesModal }))
);
const PreflightModal = lazy(() =>
  import('./components/modals/PreflightModal').then((m) => ({ default: m.PreflightModal }))
);
const JdMatcherModal = lazy(() =>
  import('./components/modals/JdMatcherModal').then((m) => ({ default: m.JdMatcherModal }))
);
const BulletRewriteModal = lazy(() =>
  import('./components/modals/BulletRewriteModal').then((m) => ({ default: m.BulletRewriteModal }))
);

const ResumeAppContent: React.FC = () => {
  const { setResponsiveZoom, isDarkMode, isPrintPreview, setIsPrintPreview } = useResume();
  const lastWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isPageReady, setIsPageReady] = useState(false);

  // Responsive zoom fit
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

  // Wait until web fonts and initial A4 layout complete before dismissing the preloader
  useEffect(() => {
    let cancelled = false;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;

    const finishLoading = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setIsPageReady(true);
          const preloader = document.getElementById('app-preloader');
          if (preloader) {
            preloader.classList.add('is-loaded');
            removeTimer = setTimeout(() => {
              preloader.remove();
            }, 280);
          }
        });
      });
    };

    const maxWaitTimer = setTimeout(finishLoading, 2000);
    const waitForReady = async () => {
      try {
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => {
            window.addEventListener('load', () => resolve(), { once: true });
          });
        }
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // Proceed cleanly even if fonts API fails offline
      }
      clearTimeout(maxWaitTimer);
      finishLoading();
    };

    waitForReady();

    return () => {
      cancelled = true;
      clearTimeout(maxWaitTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, []);

  // ESC exits clean print preview mode
  useEffect(() => {
    if (!isPrintPreview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPrintPreview(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPrintPreview, setIsPrintPreview]);

  return (
    <FluentProvider theme={isDarkMode ? wordDarkTheme : wordLightTheme}>
      <div
        className={`app-shell h-dvh w-full overflow-hidden flex flex-col print:bg-white print:h-auto print:w-auto print:overflow-visible print:block print:p-0 print:m-0 ${
          isPageReady ? 'app-root-ready' : 'app-root-hidden'
        } ${isPrintPreview ? 'is-print-preview' : ''}`}
        style={{
          backgroundColor: tokens.colorNeutralBackground3,
          color: tokens.colorNeutralForeground1,
        }}
      >
        {!isPrintPreview && <Ribbon />}

        {isPrintPreview && (
          <div
            className="fixed top-3 right-4 z-50 no-print flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border"
            style={{
              backgroundColor: tokens.colorNeutralBackground1,
              borderColor: tokens.colorNeutralStroke1,
            }}
          >
            <span className="text-xs font-medium" style={{ color: tokens.colorNeutralForeground2 }}>
              Clean Print Preview
            </span>
            <Button
              size="small"
              appearance="primary"
              icon={<EyeOffRegular />}
              onClick={() => setIsPrintPreview(false)}
            >
              Exit Preview
            </Button>
          </div>
        )}

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
            <ResumesModal />
            <TemplatesModal />
            <PreflightModal />
            <JdMatcherModal />
            <BulletRewriteModal />
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
