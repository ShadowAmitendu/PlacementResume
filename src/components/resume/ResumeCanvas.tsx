import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useResume } from '../../context/ResumeContext';
import { ResumeHeader } from './ResumeHeader';
import { SectionWrapper } from './SectionWrapper';
import { TextSection } from './sections/TextSection';
import { TableSection } from './sections/TableSection';
import { ListSection } from './sections/ListSection';
import { DividerSection } from './sections/DividerSection';
import { EntriesSection } from './sections/EntriesSection';
import { KeyValueSection } from './sections/KeyValueSection';
import { DeclarationSection } from './DeclarationSection';
import { DocumentStatusBar } from './DocumentStatusBar';
import {
  A4_HEIGHT_PX,
  PAGE_GAP_PX,
  measureNonPrintHeight,
  measurePrintableResumeHeight,
} from '../../utils/documentMetrics';
import {
  SectionData,
  TextSectionData,
  TableSectionData,
  ListSectionData,
  EntriesSectionData,
  KeyValueSectionData,
} from '../../types/resume';

function applyPagePush(el: HTMLElement, pushPx: number): boolean {
  const prev = parseFloat(el.dataset.pagePush || '0') || 0;
  if (pushPx > 0) {
    if (prev !== pushPx) {
      el.classList.add('has-page-push');
      el.style.setProperty('--page-push', `${pushPx}px`);
      el.dataset.pagePush = String(pushPx);
      return true;
    }
    return false;
  }
  if (prev !== 0 || el.classList.contains('has-page-push')) {
    el.classList.remove('has-page-push');
    el.style.removeProperty('--page-push');
    delete el.dataset.pagePush;
    return true;
  }
  return false;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function paginateResumeLayout(wrapper: HTMLElement, keepSinglePageFit: boolean): number[] {
  const headerEl = wrapper.querySelector('.header') as HTMLElement | null;
  const sectionsEl = wrapper.querySelector('#sortable-sections') as HTMLElement | null;
  const declEl = wrapper.querySelector('#declarationSection') as HTMLElement | null;
  if (!sectionsEl) return [A4_HEIGHT_PX];

  const sectionEls = Array.from(sectionsEl.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );

  if (keepSinglePageFit) {
    for (const el of sectionEls) {
      applyPagePush(el, 0);
    }
    return [A4_HEIGHT_PX];
  }

  const style = window.getComputedStyle(wrapper);
  const padTop = parseFloat(style.paddingTop) || 0;
  const padBottom = parseFloat(style.paddingBottom) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 2;
  const borderBottom = parseFloat(style.borderBottomWidth) || 2;

  const usablePrintableHeight = Math.max(
    200,
    A4_HEIGHT_PX - padTop - padBottom - borderTop - borderBottom
  );

  const headerBottom = headerEl ? headerEl.offsetTop + headerEl.offsetHeight : padTop + borderTop;
  const sheetHeights: number[] = [];
  let currentSheetTop = 0;
  let usedPrintableOnPage = Math.max(0, headerBottom - padTop - borderTop) + 4;
  let lastScreenBottomOnPage = headerBottom;
  let prevCumulativePush = 0;
  let newCumulativePush = 0;

  for (const el of sectionEls) {
    if (el.classList.contains('is-section-hidden')) {
      applyPagePush(el, 0);
      continue;
    }

    const prevPush = parseFloat(el.dataset.pagePush || '0') || 0;
    const elNaturalTop = el.offsetTop - prevCumulativePush - prevPush;
    const elScreenHeight = el.offsetHeight;
    const elNonPrint = measureNonPrintHeight(el);
    const elPrintableHeight = Math.max(0, elScreenHeight - elNonPrint);
    const candidateScreenTop = elNaturalTop + newCumulativePush;

    let nextPush = 0;
    const fitsSinglePage = elPrintableHeight <= usablePrintableHeight;
    const forcePageBreak = el.dataset.pageBreakBefore === 'true' && usedPrintableOnPage > 10;

    if (
      forcePageBreak ||
      (fitsSinglePage &&
        usedPrintableOnPage > 0 &&
        usedPrintableOnPage + elPrintableHeight > usablePrintableHeight)
    ) {
      const sheetH = Math.max(
        A4_HEIGHT_PX,
        Math.ceil(lastScreenBottomOnPage + padBottom + borderBottom - currentSheetTop)
      );
      sheetHeights.push(sheetH);
      currentSheetTop += sheetH + PAGE_GAP_PX;
      usedPrintableOnPage = 0;
      const targetScreenTop = currentSheetTop + padTop + borderTop;
      nextPush = Math.max(0, Math.round(targetScreenTop - candidateScreenTop));
    } else if (
      !fitsSinglePage &&
      usablePrintableHeight - usedPrintableOnPage < 140 &&
      usedPrintableOnPage > 180
    ) {
      const sheetH = Math.max(
        A4_HEIGHT_PX,
        Math.ceil(lastScreenBottomOnPage + padBottom + borderBottom - currentSheetTop)
      );
      sheetHeights.push(sheetH);
      currentSheetTop += sheetH + PAGE_GAP_PX;
      usedPrintableOnPage = 0;
      const targetScreenTop = currentSheetTop + padTop + borderTop;
      nextPush = Math.max(0, Math.round(targetScreenTop - candidateScreenTop));
    }

    applyPagePush(el, nextPush);
    prevCumulativePush += prevPush;
    newCumulativePush += nextPush;
    usedPrintableOnPage += elPrintableHeight + 5;
    lastScreenBottomOnPage = Math.max(
      lastScreenBottomOnPage,
      candidateScreenTop + nextPush + elScreenHeight
    );

    if (!fitsSinglePage && usedPrintableOnPage > usablePrintableHeight) {
      while (usedPrintableOnPage > usablePrintableHeight && sheetHeights.length < 20) {
        sheetHeights.push(A4_HEIGHT_PX);
        currentSheetTop += A4_HEIGHT_PX + PAGE_GAP_PX;
        usedPrintableOnPage -= usablePrintableHeight;
      }
      lastScreenBottomOnPage = Math.max(
        lastScreenBottomOnPage,
        currentSheetTop + padTop + borderTop + usedPrintableOnPage
      );
    }
  }

  if (declEl && declEl.offsetHeight > 0) {
    const declNonPrint = measureNonPrintHeight(declEl);
    const declPrintable = Math.max(0, declEl.offsetHeight - declNonPrint);
    if (usedPrintableOnPage + 8 + declPrintable > usablePrintableHeight) {
      const sheetH = Math.max(
        A4_HEIGHT_PX,
        Math.ceil(lastScreenBottomOnPage + padBottom + borderBottom - currentSheetTop)
      );
      sheetHeights.push(sheetH);
      currentSheetTop += sheetH + PAGE_GAP_PX;
      lastScreenBottomOnPage = currentSheetTop + padTop + borderTop + declEl.offsetHeight;
    } else {
      lastScreenBottomOnPage += 8 + declEl.offsetHeight;
    }
  }

  const finalSheetH = Math.max(
    A4_HEIGHT_PX,
    Math.ceil(lastScreenBottomOnPage + padBottom + borderBottom - currentSheetTop)
  );
  sheetHeights.push(finalSheetH);

  return sheetHeights;
}

export const ResumeCanvas: React.FC = () => {
  const { resumeData, reorderSections, isPrintPreview, setCanvasPageCount } = useResume();
  const { zoom, tableStyle, showLinkIcons } = resumeData.meta;
  const sections = resumeData.sections;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState<number>(794);
  const [wrapperHeight, setWrapperHeight] = useState<number>(0);
  const [printableHeight, setPrintableHeight] = useState<number>(0);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(false);
  const isAutoFitRef = useRef<boolean>(false);
  isAutoFitRef.current = isAutoFit;
  const [sheetHeights, setSheetHeights] = useState<number[]>([A4_HEIGHT_PX]);
  const [activePage, setActivePage] = useState<number>(1);
  const pageCount = sheetHeights.length;

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (wrapper.offsetWidth > 0) setWrapperWidth(wrapper.offsetWidth);
    if (wrapper.offsetHeight > 0) setWrapperHeight(wrapper.offsetHeight);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let isUpdating = false;
    let rafId: number | null = null;

    const updateHeightAndFit = () => {
      if (isUpdating) return;
      isUpdating = true;
      try {
        if (wrapper.offsetWidth > 0) {
          setWrapperWidth((prev) => (prev !== wrapper.offsetWidth ? wrapper.offsetWidth : prev));
        }

        const fitEnabled = resumeData.meta.fitSignatureToPage ?? true;

        // Evaluate baseline un-compressed height deterministically so auto-fit never oscillates
        wrapper.classList.remove('auto-fit-page');
        const naturalPrintable = measurePrintableResumeHeight(wrapper);
        const naturalOverflow = naturalPrintable - A4_HEIGHT_PX;

        let computedAutoFit = false;
        let displayPrintable = naturalPrintable;
        if (fitEnabled && naturalOverflow > 0 && naturalOverflow <= 120) {
          wrapper.classList.add('auto-fit-page');
          const fittedPrintable = measurePrintableResumeHeight(wrapper);
          if (fittedPrintable <= A4_HEIGHT_PX + 2) {
            computedAutoFit = true;
            displayPrintable = fittedPrintable;
          } else {
            wrapper.classList.remove('auto-fit-page');
          }
        }

        setPrintableHeight((prev) => (prev !== displayPrintable ? displayPrintable : prev));

        if (computedAutoFit !== isAutoFitRef.current) {
          isAutoFitRef.current = computedAutoFit;
          setIsAutoFit(computedAutoFit);
        }

        const hasManualBreak = sections.some((s) => !s.hidden && s.pageBreakBefore);
        const keepSingle = !hasManualBreak && (computedAutoFit || naturalOverflow <= 0);
        const nextSheets = paginateResumeLayout(wrapper, keepSingle);
        setSheetHeights((prev) => (arraysEqual(prev, nextSheets) ? prev : nextSheets));
        setCanvasPageCount(nextSheets.length);

        const expectedMinHeight =
          nextSheets.length > 1
            ? nextSheets.reduce((sum, h) => sum + h, 0) + (nextSheets.length - 1) * PAGE_GAP_PX
            : 0;
        const measuredHeight = Math.max(wrapper.offsetHeight, expectedMinHeight);
        setWrapperHeight((prev) => (prev !== measuredHeight ? measuredHeight : prev));
      } finally {
        isUpdating = false;
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateHeightAndFit();
      });
    };

    updateHeightAndFit();
    const timer = setTimeout(updateHeightAndFit, 80);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(scheduleUpdate);
      observer.observe(wrapper);
    }

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) scheduleUpdate();
      });
    }

    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [sections, resumeData, isPrintPreview, setCanvasPageCount]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateActivePageFromPoint = (clientY: number) => {
      const rect = wrapper.getBoundingClientRect();
      const relY = (clientY - rect.top) / (zoom || 1);
      let cursor = 0;
      let page = sheetHeights.length;
      for (let i = 0; i < sheetHeights.length; i += 1) {
        const end = cursor + sheetHeights[i] + PAGE_GAP_PX * 0.5;
        if (relY <= end) {
          page = i + 1;
          break;
        }
        cursor += sheetHeights[i] + PAGE_GAP_PX;
      }
      setActivePage((prev) => (prev !== page ? page : prev));
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      updateActivePageFromPoint(r.top + Math.min(r.height / 2, 24));
    };

    const mainEl = wrapper.closest('main');
    const handleScroll = () => {
      if (!mainEl) return;
      const mainRect = mainEl.getBoundingClientRect();
      updateActivePageFromPoint(mainRect.top + mainRect.height * 0.35);
    };

    wrapper.addEventListener('focusin', handleFocusIn);
    mainEl?.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      wrapper.removeEventListener('focusin', handleFocusIn);
      mainEl?.removeEventListener('scroll', handleScroll);
    };
  }, [sheetHeights, zoom]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(arrayMove(sections, oldIndex, newIndex));
      }
    }
  };

  const renderSectionContent = (section: SectionData) => {
    switch (section.type) {
      case 'text':
        return <TextSection section={section as TextSectionData} />;
      case 'table':
        return <TableSection section={section as TableSectionData} />;
      case 'list':
        return <ListSection section={section as ListSectionData} />;
      case 'entries':
        return <EntriesSection section={section as EntriesSectionData} />;
      case 'keyvalue':
        return <KeyValueSection section={section as KeyValueSectionData} />;
      case 'hr':
        return <DividerSection />;
      default:
        return null;
    }
  };

  const isMultipage = pageCount > 1;
  const pagedTotalHeight = isMultipage
    ? sheetHeights.reduce((sum, h) => sum + h, 0) + (pageCount - 1) * PAGE_GAP_PX
    : wrapperHeight;

  const wrapperClasses = [
    'resume-wrapper',
    !showLinkIcons ? 'links-no-icons' : '',
    isAutoFit ? 'auto-fit-page' : '',
    isMultipage ? 'is-multipage' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const scaledWidth = wrapperWidth && zoom ? Math.round(wrapperWidth * zoom) : undefined;
  const scaledHeight = pagedTotalHeight && zoom ? Math.round(pagedTotalHeight * zoom) : undefined;

  return (
    <>
      <div
        className="resume-zoom-stage mx-auto mb-5 overflow-visible print:p-0 print:m-0 print:block print:w-full print:h-auto"
        style={{
          width: scaledWidth ? `${scaledWidth}px` : 'fit-content',
          height: scaledHeight ? `${scaledHeight}px` : undefined,
        }}
      >
        <div
          id="resumeContainer"
          className="fluent-canvas-zoom"
          style={{
            width: wrapperWidth ? `${wrapperWidth}px` : undefined,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="print-border" />

          {isMultipage && (
            <div className="resume-pages-backdrop no-print" aria-hidden="true">
              {sheetHeights.map((sheetH, pageIdx) => (
                <div
                  key={pageIdx}
                  className="resume-page-sheet"
                  style={{
                    height: `${sheetH}px`,
                    marginBottom: pageIdx < pageCount - 1 ? `${PAGE_GAP_PX}px` : 0,
                  }}
                >
                  <span className="resume-page-badge">
                    Page {pageIdx + 1} of {pageCount}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            ref={wrapperRef}
            className={wrapperClasses}
            data-table-style={tableStyle}
            data-margin={resumeData.meta.margin || 'normal'}
            data-line-height={resumeData.meta.lineHeight || 'normal'}
            id="resumeWrapper"
            style={
              isMultipage
                ? ({ '--multipage-height': `${pagedTotalHeight}px` } as React.CSSProperties)
                : undefined
            }
          >
            <ResumeHeader />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div id="sortable-sections">
                  {sections.map((section) => (
                    <SectionWrapper key={section.id} section={section}>
                      {renderSectionContent(section)}
                    </SectionWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <DeclarationSection />
          </div>
        </div>
      </div>

      <DocumentStatusBar
        wrapperHeight={printableHeight || wrapperHeight}
        isAutoFit={isAutoFit}
        pageCount={pageCount}
        activePage={activePage}
      />
    </>
  );
};
