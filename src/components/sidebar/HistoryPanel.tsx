import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '../ui/button';

export const HistoryPanel: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useResume();

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        History
      </span>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="flex items-center justify-center gap-1.5 h-9"
        >
          <Undo2 className="w-4 h-4" />
          <span>Undo</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="flex items-center justify-center gap-1.5 h-9"
        >
          <Redo2 className="w-4 h-4" />
          <span>Redo</span>
        </Button>
      </div>
    </div>
  );
};
