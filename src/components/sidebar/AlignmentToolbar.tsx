import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export const AlignmentToolbar: React.FC = () => {
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('[contenteditable="true"]')) {
        lastFocusedRef.current = target.closest('[contenteditable="true"]') as HTMLElement;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (lastFocusedRef.current) {
      lastFocusedRef.current.style.textAlign = align;
    }
    const cmd = align === 'justify' ? 'justifyFull' : `justify${align.charAt(0).toUpperCase() + align.slice(1)}`;
    document.execCommand(cmd, false, undefined);
  };

  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
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
          onMouseDown={preventBlur}
          onClick={() => handleAlign('left')}
          title="Align Left"
          className="h-8 p-0"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => handleAlign('center')}
          title="Align Center"
          className="h-8 p-0"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => handleAlign('right')}
          title="Align Right"
          className="h-8 p-0"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
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
