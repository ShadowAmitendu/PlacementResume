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

  return (
    <div className="relative">
      <ul className="skills-list">
        {section.items.map((item, index) => (
          <li key={index} className="group/item flex items-center gap-1.5">
            <div className="flex-1">
              <EditableContent
                html={item}
                onChange={(val) => handleItemChange(index, val)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="[Skill / List item]"
              />
            </div>
            {section.items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive p-0.5 rounded no-print transition-opacity"
                title="Remove item"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-start pl-5 -mt-1 mb-2 no-print">
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add list item</span>
        </button>
      </div>
    </div>
  );
};
