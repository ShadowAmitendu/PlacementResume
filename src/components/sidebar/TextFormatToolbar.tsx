import React from 'react';
import { Button } from '../ui/button';
import { Bold, Italic, Underline, Strikethrough, Code } from 'lucide-react';

export const TextFormatToolbar: React.FC = () => {
  const formatText = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
  };

  const formatCustom = (style: string, className = '') => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    if (style) span.setAttribute('style', style);
    if (className) span.className = className;
    try {
      range.surroundContents(span);
    } catch {
      document.execCommand(style ? 'formatBlock' : 'fontName', false, undefined);
    }
  };

  // Prevent button from stealing focus from the highlighted text
  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        Text Formatting
      </span>
      <div className="grid grid-cols-5 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('bold')}
          title="Bold"
          className="h-8 p-0"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('italic')}
          title="Italic"
          className="h-8 p-0"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('underline')}
          title="Underline"
          className="h-8 p-0"
        >
          <Underline className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('strikeThrough')}
          title="Strikethrough"
          className="h-8 p-0"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('superscript')}
          title="Superscript"
          className="h-8 p-0 text-xs font-semibold"
        >
          X²
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('subscript')}
          title="Subscript"
          className="h-8 p-0 text-xs font-semibold"
        >
          X₂
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('font-variant:small-caps')}
          title="Small Caps"
          className="h-8 p-0 text-xs font-semibold"
          style={{ fontVariant: 'small-caps' }}
        >
          Sc
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('text-transform:uppercase')}
          title="All Caps"
          className="h-8 p-0 text-xs font-semibold"
        >
          AA
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('', 'code-inline')}
          title="Inline Code"
          className="col-span-2 h-8 flex items-center justify-center gap-1 text-xs font-mono"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Code</span>
        </Button>
      </div>
    </div>
  );
};
