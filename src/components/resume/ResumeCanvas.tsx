import React, { useRef, useState, useEffect } from 'react';
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
import { DeclarationSection } from './DeclarationSection';
import { DocumentStatusBar } from './DocumentStatusBar';
import {
  SectionData,
  TextSectionData,
  TableSectionData,
  ListSectionData,
} from '../../types/resume';

export const ResumeCanvas: React.FC = () => {
  const { resumeData, reorderSections } = useResume();
  const { zoom, tableStyle, showLinkIcons } = resumeData.meta;
  const sections = resumeData.sections;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState<number>(0);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(false);

  useEffect(() => {
    const updateHeightAndFit = () => {
      if (!wrapperRef.current) return;
      const wrapper = wrapperRef.current;
      setWrapperHeight(wrapper.offsetHeight);

      const fitEnabled = resumeData.meta.fitSignatureToPage ?? true;
      if (!fitEnabled) {
        setIsAutoFit(false);
        return;
      }

      const headerEl = wrapper.querySelector('.header') as HTMLElement | null;
      const sectionsEl = wrapper.querySelector('#sortable-sections') as HTMLElement | null;
      const declEl = wrapper.querySelector('#declarationSection') as HTMLElement | null;

      if (headerEl && sectionsEl) {
        const style = window.getComputedStyle(wrapper);
        const padTop = parseFloat(style.paddingTop) || 0;
        const padBottom = parseFloat(style.paddingBottom) || 0;
        const headerHeight = headerEl.offsetHeight;
        const sectionsHeight = sectionsEl.offsetHeight;
        const declHeight = declEl ? declEl.offsetHeight : 0;

        const totalContentHeight = padTop + headerHeight + sectionsHeight + declHeight + padBottom;
        const A4_HEIGHT_PX = 1122;

        const overflow = totalContentHeight - A4_HEIGHT_PX;
        setIsAutoFit((prev) => {
          if (prev) {
            return totalContentHeight <= A4_HEIGHT_PX && totalContentHeight > A4_HEIGHT_PX - 85;
          } else {
            return overflow > 0 && overflow <= 85;
          }
        });
      }
    };

    updateHeightAndFit();
    const timer = setTimeout(updateHeightAndFit, 80);
    window.addEventListener('resize', updateHeightAndFit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeightAndFit);
    };
  }, [sections, resumeData]);

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
      case 'hr':
        return <DividerSection />;
      default:
        return null;
    }
  };

  const wrapperClasses = [
    'resume-wrapper',
    !showLinkIcons ? 'links-no-icons' : '',
    isAutoFit ? 'auto-fit-page' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        id="resumeContainer"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          marginBottom: zoom < 1 && wrapperHeight ? `${wrapperHeight * (zoom - 1)}px` : undefined,
        }}
      >
        <div className="print-border" />

        <div
          ref={wrapperRef}
          className={wrapperClasses}
          data-table-style={tableStyle}
          data-margin={resumeData.meta.margin || 'normal'}
          data-line-height={resumeData.meta.lineHeight || 'normal'}
          id="resumeWrapper"
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

      <DocumentStatusBar wrapperHeight={wrapperHeight} isAutoFit={isAutoFit} />
    </>
  );
};
