import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { SectionType } from '../../types/resume';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export const AddSectionPanel: React.FC = () => {
  const { addSection } = useResume();
  const [selectedType, setSelectedType] = useState<SectionType>('text');

  const handleAdd = () => {
    addSection(selectedType);
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        Add Section
      </span>
      <div className="flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as SectionType)}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="text">Text Paragraph</option>
          <option value="table">Table</option>
          <option value="list">Bullet List</option>
          <option value="hr">Divider Line</option>
        </select>
        <Button size="sm" onClick={handleAdd} className="flex items-center gap-1 h-9 px-3">
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </Button>
      </div>
    </div>
  );
};
