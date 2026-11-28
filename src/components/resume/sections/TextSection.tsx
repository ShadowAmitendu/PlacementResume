import React from 'react';
import { SparkleRegular } from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { TextSectionData } from '../../../types/resume';
import { sanitizeRichTextHtml } from '../../../utils/sanitize';
import { htmlToPlainText } from '../../../utils/documentMetrics';
import { EditableContent } from '../EditableContent';

interface TextSectionProps {
  section: TextSectionData;
}

export const TextSection: React.FC<TextSectionProps> = ({ section }) => {
  const { updateSection, openRewriteModal } = useResume();

  return (
    <div className="relative group/textsec">
      <EditableContent
        tagName="div"
        html={section.content}
        onChange={(val) => updateSection(section.id, { content: val })}
        placeholder="Enter your paragraph text here..."
        className="section-text block w-full"
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          openRewriteModal({
            title: `Rewrite "${htmlToPlainText(section.title).replace(/:$/, '') || 'Paragraph'}"`,
            initialText: htmlToPlainText(section.content),
            onApply: (rewritten) =>
              updateSection(section.id, { content: sanitizeRichTextHtml(rewritten) }),
          })
        }
        className="list-remove-btn absolute right-0 top-0 text-neutral-500 hover:text-blue-700 bg-white/90 border border-neutral-200 px-1.5 py-0.5 rounded no-print inline-flex items-center gap-1 cursor-pointer text-[10px] font-sans shadow-2xs"
        title="Rewrite or tighten paragraph"
      >
        <SparkleRegular fontSize={11} />
        <span>Rewrite</span>
      </button>
    </div>
  );
};
