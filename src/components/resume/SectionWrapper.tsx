import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ReOrderDotsVerticalRegular,
  CopyRegular,
  DeleteRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { SectionData } from '../../types/resume';
import { EditableContent } from './EditableContent';

interface SectionWrapperProps {
  section: SectionData;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ section, children }) => {
  const { duplicateSection, removeSection, updateSection } = useResume();

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`section-block group ${isDragging ? 'sortable-chosen' : ''}`}
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

      {/* Section Title (only if not an HR divider) */}
      {section.type !== 'hr' && (
        <div className="section-title">
          <EditableContent
            tagName="span"
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
