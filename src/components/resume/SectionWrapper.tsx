import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ReOrderDotsVerticalRegular,
  CopyRegular,
  DeleteRegular,
  EyeRegular,
  EyeOffRegular,
  DocumentPageBreakRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { SectionData } from '../../types/resume';
import { htmlToPlainText } from '../../utils/documentMetrics';
import { EditableContent } from './EditableContent';

interface SectionWrapperProps {
  section: SectionData;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ section, children }) => {
  const {
    duplicateSection,
    removeSection,
    updateSection,
    toggleSectionHidden,
    toggleSectionPageBreak,
  } = useResume();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  if (section.hidden) {
    const plainTitle = htmlToPlainText(section.title).replace(/:$/, '').trim() || 'Divider / Untitled';
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`section-block is-section-hidden no-print ${isDragging ? 'sortable-chosen' : ''}`}
      >
        <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded border border-dashed border-neutral-300 bg-neutral-100/80 text-neutral-600 text-xs font-sans">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder hidden section"
              className="cursor-grab text-neutral-500 hover:text-neutral-800 inline-flex items-center"
              title="Drag to reorder"
            >
              <ReOrderDotsVerticalRegular fontSize={14} />
            </span>
            <EyeOffRegular fontSize={13} className="shrink-0" />
            <span className="truncate font-medium">
              Hidden in print/PDF: {plainTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => toggleSectionHidden(section.id)}
              className="px-2 py-0.5 rounded bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
              title="Show section on resume"
            >
              <EyeRegular fontSize={12} />
              <span>Show</span>
            </button>
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              className="p-1 rounded hover:bg-red-50 text-red-700 cursor-pointer inline-flex items-center"
              title="Delete section permanently"
            >
              <DeleteRegular fontSize={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-page-break-before={section.pageBreakBefore ? 'true' : undefined}
      className={`section-block group ${isDragging ? 'sortable-chosen' : ''} ${
        section.pageBreakBefore ? 'has-page-break-before' : ''
      }`}
    >
      {/* Controls on hover */}
      <div className="block-controls no-print">
        <span
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder section"
          aria-roledescription="sortable"
          className="drag-handle"
          title="Drag to reorder"
        >
          <ReOrderDotsVerticalRegular fontSize={14} />
        </span>
        <button
          type="button"
          onClick={() => toggleSectionPageBreak(section.id)}
          className={section.pageBreakBefore ? 'is-active' : ''}
          title={
            section.pageBreakBefore
              ? 'Remove manual page break before section'
              : 'Start this section on a new page'
          }
          aria-label="Toggle page break before section"
        >
          <DocumentPageBreakRegular fontSize={14} />
        </button>
        <button
          type="button"
          onClick={() => toggleSectionHidden(section.id)}
          title="Hide section (exclude from PDF/print without deleting)"
          aria-label="Hide section"
        >
          <EyeOffRegular fontSize={14} />
        </button>
        <button
          type="button"
          onClick={() => duplicateSection(section.id)}
          title="Duplicate section"
        >
          <CopyRegular fontSize={14} />
        </button>
        <button
          type="button"
          onClick={() => removeSection(section.id)}
          title="Delete section"
          className="btn-danger-small"
        >
          <DeleteRegular fontSize={14} />
        </button>
      </div>

      {section.pageBreakBefore && (
        <div className="manual-page-break-indicator no-print">
          <span>Page break before section</span>
        </div>
      )}

      {/* Section Title (only if not an HR divider) */}
      {section.type !== 'hr' && (
        <div className="section-title">
          <EditableContent
            tagName="span"
            singleLine
            html={section.title}
            onChange={(val) => updateSection(section.id, { title: val })}
            placeholder="Section Title"
          />
        </div>
      )}

      {/* Section Content */}
      {children}
    </div>
  );
};
