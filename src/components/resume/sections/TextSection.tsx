import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { TextSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';

interface TextSectionProps {
  section: TextSectionData;
}

export const TextSection: React.FC<TextSectionProps> = ({ section }) => {
  const { updateSection } = useResume();

  return (
    <p className="section-text">
      <EditableContent
        html={section.content}
        onChange={(val) => updateSection(section.id, { content: val })}
        placeholder="Enter your paragraph text here..."
      />
    </p>
  );
};
