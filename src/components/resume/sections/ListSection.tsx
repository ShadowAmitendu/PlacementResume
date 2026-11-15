import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { ListSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';
import { Plus, X } from 'lucide-react';

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
    } else if (e.key === 'Backspace' && (!section.items[index] || section.items[index].trim() === '')) {
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
          <li key={index} className="group/item relative mb-0.5">
            <EditableContent
              tagName="span"
              html={item}
              onChange={(val) => handleItemChange(index, val)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder="[Skill / List item]"
              className="inline-block"
            />
            {section.items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive p-0.5 rounded no-print transition-opacity ml-2 inline-flex items-center align-middle cursor-pointer"
                title="Remove item"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </li>
        ))}
      </ListTag>

      <div className="flex items-center justify-between pl-5 -mt-1 mb-2 no-print pr-2 text-xs">
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add list item</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-(--ui-surface2) px-2 py-0.5 rounded border border-(--ui-border)">
          <span className="font-medium mr-1 text-[10px] uppercase">Format:</span>
          <button
            type="button"
            onClick={() => updateSection(section.id, { listType: 'bullet' })}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[11px] ${
              !isNumbered
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
            title="Bulleted list"
          >
            • Bullet
          </button>
          <button
            type="button"
            onClick={() => updateSection(section.id, { listType: 'numbered' })}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[11px] ${
              isNumbered
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
            title="Numbered list"
          >
            1. Numbered
          </button>
        </div>
      </div>
    </div>
  );
};
