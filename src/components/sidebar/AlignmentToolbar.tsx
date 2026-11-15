import React from 'react';
import { Button } from '../ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export const AlignmentToolbar: React.FC = () => {
  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const node = sel.anchorNode;
    const editable = node instanceof HTMLElement ? node.closest('[contenteditable="true"]') : node?.parentElement?.closest('[contenteditable="true"]');
    if (editable instanceof HTMLElement) {
      editable.style.textAlign = align;
    } else {
      document.execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`, false, undefined);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        Alignment
      </span>
      <div className="grid grid-cols-4 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('left')}
          title="Align Left"
          className="h-8 p-0"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('center')}
          title="Align Center"
          className="h-8 p-0"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('right')}
          title="Align Right"
          className="h-8 p-0"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('justify')}
          title="Justify"
          className="h-8 p-0"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
