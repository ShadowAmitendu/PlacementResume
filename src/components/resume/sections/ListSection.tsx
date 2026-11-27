import React from 'react';
import {
  AddRegular,
  DismissRegular,
  TextBulletListLtrRegular,
  TextNumberListLtrRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { ListSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';

interface ListSectionProps {
  section: ListSectionData;
}

export const ListSection: React.FC<ListSectionProps> = ({ section }) => {
  const { updateSection } = useResume();
  const isNumbered = section.listType === 'numbered';

  const handleItemChange = (index: number, val: string) => {
    const updated = [...section.items];
    updated[index] = val;
    updateSection(section.id, { items: updated });
  };

  const handleAddItem = (afterIndex?: number) => {
    const updated = [...section.items];
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : updated.length;
    updated.splice(insertAt, 0, '[New item]');
    updateSection(section.id, { items: updated });
  };

  const handleRemoveItem = (index: number) => {
    if (section.items.length <= 1) return;
    const updated = section.items.filter((_, idx) => idx !== index);
    updateSection(section.id, { items: updated });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(index);
    } else if (
      e.key === 'Backspace' &&
      (!section.items[index] || section.items[index].trim() === '')
    ) {
      if (section.items.length > 1) {
        e.preventDefault();
        handleRemoveItem(index);
      }
    }
  };

  const ListTag = isNumbered ? 'ol' : 'ul';
  const listClass = isNumbered ? 'skills-list-numbered' : 'skills-list';

  return (
    <div className="relative">
      <ListTag className={listClass}>
        {section.items.map((item, index) => (
          <li key={index} className="list-row-item relative mb-0.5">
            <EditableContent
              tagName="span"
              html={item}
              onChange={(val) => handleItemChange(index, val)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder="[List item]"
              className="inline-block"
            />
            {section.items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="list-remove-btn text-neutral-500 hover:text-red-700 p-0.5 rounded no-print ml-1.5 inline-flex items-center align-middle cursor-pointer"
                title="Remove item"
              >
                <DismissRegular fontSize={12} />
              </button>
            )}
          </li>
        ))}
      </ListTag>

      <div className="flex items-center justify-between pl-5 -mt-1 mb-2 no-print pr-2 text-xs font-sans">
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="text-neutral-600 hover:text-neutral-950 flex items-center gap-1 font-medium cursor-pointer"
          style={{ fontSize: 11 }}
        >
          <AddRegular fontSize={12} />
          <span>Add item</span>
        </button>

        <div className="flex items-center gap-0.5 p-0.5 rounded bg-neutral-100 border border-neutral-200">
          <button
            type="button"
            onClick={() => updateSection(section.id, { listType: 'bullet' })}
            className={`px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 text-[11px] transition-colors ${
              !isNumbered
                ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Bulleted list"
          >
            <TextBulletListLtrRegular fontSize={12} />
            <span>Bullets</span>
          </button>
          <button
            type="button"
            onClick={() => updateSection(section.id, { listType: 'numbered' })}
            className={`px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 text-[11px] transition-colors ${
              isNumbered
                ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Numbered list"
          >
            <TextNumberListLtrRegular fontSize={12} />
            <span>Numbered</span>
          </button>
        </div>
      </div>
    </div>
  );
};
