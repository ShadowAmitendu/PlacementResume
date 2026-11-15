import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResume } from '../../context/ResumeContext';
import { SectionData } from '../../types/resume';
import { EditableContent } from './EditableContent';
import { GripVertical, Copy, Trash2 } from 'lucide-react';

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
          className="drag-handle cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </span>
        <button
          type="button"
          onClick={() => duplicateSection(section.id)}
          title="Duplicate section"
          className="p-1 hover:bg-neutral-200 rounded"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => removeSection(section.id)}
          title="Delete section"
          className="btn-danger-small p-1 rounded"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Section Title (only if not an HR divider) */}
      {section.type !== 'hr' && (
        <div className="section-title">
          <EditableContent
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
