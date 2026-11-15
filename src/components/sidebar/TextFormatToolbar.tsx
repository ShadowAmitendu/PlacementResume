import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Baseline,
  RemoveFormatting,
  Search,
} from 'lucide-react';

const TEXT_COLORS = [
  { label: 'Black', value: '#000000', bg: '#000000' },
  { label: 'Slate Gray', value: '#4b5563', bg: '#4b5563' },
  { label: 'Navy Blue', value: '#1e40af', bg: '#1e40af' },
  { label: 'Crimson Red', value: '#b91c1c', bg: '#b91c1c' },
  { label: 'Forest Green', value: '#15803d', bg: '#15803d' },
  { label: 'Amber', value: '#d97706', bg: '#d97706' },
  { label: 'Royal Purple', value: '#7c3aed', bg: '#7c3aed' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent', bg: 'transparent' },
  { label: 'Yellow', value: '#fef08a', bg: '#fef08a' },
  { label: 'Green', value: '#bbf7d0', bg: '#bbf7d0' },
  { label: 'Blue', value: '#bae6fd', bg: '#bae6fd' },
  { label: 'Pink', value: '#fbcfe8', bg: '#fbcfe8' },
  { label: 'Purple', value: '#e9d5ff', bg: '#e9d5ff' },
];

const FONT_SIZES = [
  { label: 'Default', value: 'inherit' },
  { label: '9pt (Small)', value: '9pt' },
  { label: '10.5pt (Compact)', value: '10.5pt' },
  { label: '12pt (Regular)', value: '12pt' },
  { label: '14pt (Medium)', value: '14pt' },
  { label: '16pt (Large)', value: '16pt' },
];

export const TextFormatToolbar: React.FC = () => {
  const { setIsFindReplaceModalOpen } = useResume();
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');

  // Prevent toolbar clicks from stealing focus or collapsing selection
  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const formatText = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('unlink', false, undefined);
  };

  const applyTextColor = (color: string) => {
    setActiveTextColor(color);
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    setShowTextColorPicker(false);
  };

  const applyHighlightColor = (color: string) => {
    setActiveHighlightColor(color);
    document.execCommand('styleWithCSS', false, 'true');
    try {
      document.execCommand('hiliteColor', false, color);
    } catch {
      document.execCommand('backColor', false, color);
    }
    setShowHighlightPicker(false);
  };

  const applyFontSize = (fontSize: string) => {
    if (fontSize === 'inherit') {
      document.execCommand('removeFormat', false, undefined);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = fontSize;
    try {
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
    } catch {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '3');
    }
  };

  const adjustFontSize = (direction: 'up' | 'down') => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = direction === 'up' ? '1.18em' : '0.85em';
    try {
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
    } catch {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, direction === 'up' ? '4' : '2');
    }
  };

  const formatCustom = (style: string, className = '') => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    if (style) span.setAttribute('style', style);
    if (className) span.className = className;
    try {
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
    } catch {
      document.execCommand(style ? 'formatBlock' : 'fontName', false, undefined);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Text Formatting
        </span>
        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={() => setIsFindReplaceModalOpen(true)}
          className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
          title="Find & Replace text (Ctrl+F)"
        >
          <Search className="w-3 h-3" />
          <span>Find & Replace</span>
        </button>
      </div>

      {/* Row 1: Core Font Styles & Clear Formatting */}
      <div className="grid grid-cols-5 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('bold')}
          title="Bold (Ctrl+B)"
          className="h-8 p-0"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('italic')}
          title="Italic (Ctrl+I)"
          className="h-8 p-0"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatText('underline')}
          title="Underline (Ctrl+U)"
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
          onClick={clearFormatting}
          title="Clear Formatting (Remove styles)"
          className="h-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Row 2: Font Sizing & Typography Options */}
      <div className="grid grid-cols-5 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => adjustFontSize('up')}
          title="Increase Font Size (A+)"
          className="h-8 p-0 text-xs font-bold"
        >
          A<sup>+</sup>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => adjustFontSize('down')}
          title="Decrease Font Size (A-)"
          className="h-8 p-0 text-xs font-bold"
        >
          A<sup>-</sup>
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
          onClick={() => formatCustom('', 'code-inline')}
          title="Inline Code"
          className="h-8 p-0 font-mono text-xs"
        >
          <Code className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Row 3: Casing & Small Caps */}
      <div className="grid grid-cols-4 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('font-variant:small-caps')}
          title="Small Caps"
          className="h-7 p-0 text-xs font-semibold"
          style={{ fontVariant: 'small-caps' }}
        >
          Sc
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('text-transform:uppercase')}
          title="UPPERCASE"
          className="h-7 p-0 text-xs font-semibold"
        >
          AA
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('text-transform:lowercase')}
          title="lowercase"
          className="h-7 p-0 text-xs font-semibold"
        >
          aa
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={preventBlur}
          onClick={() => formatCustom('text-transform:capitalize')}
          title="Capitalize Words"
          className="h-7 p-0 text-xs font-semibold"
        >
          Aa
        </Button>
      </div>

      {/* Row 4: Font Size Preset Picker */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-semibold text-muted-foreground block">
          Preset Font Size
        </label>
        <select
          defaultValue="inherit"
          onChange={(e) => {
            applyFontSize(e.target.value);
            e.target.value = 'inherit';
          }}
          className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {FONT_SIZES.map((sz) => (
            <option key={sz.value} value={sz.value}>
              {sz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 5: Text Color & Highlight Color Palette */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Text Color Picker */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onMouseDown={preventBlur}
            onClick={() => {
              setShowTextColorPicker((prev) => !prev);
              setShowHighlightPicker(false);
            }}
            title="Text Font Color"
            className="w-full h-8 flex items-center justify-between px-2 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <Baseline className="w-3.5 h-3.5" />
              <span>Color</span>
            </div>
            <div
              className="w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: activeTextColor }}
            />
          </Button>

          {showTextColorPicker && (
            <div className="absolute left-0 bottom-full mb-1 z-30 p-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-md shadow-xl w-48 space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Text Colors
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={preventBlur}
                    onClick={() => applyTextColor(c.value)}
                    title={c.label}
                    className="w-7 h-7 rounded border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.bg }}
                  />
                ))}
              </div>
              <div className="pt-1 flex items-center gap-1.5 border-t border-[var(--ui-border)]">
                <span className="text-[10px] text-muted-foreground">Custom:</span>
                <input
                  type="color"
                  value={activeTextColor}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onMouseDown={preventBlur}
            onClick={() => {
              setShowHighlightPicker((prev) => !prev);
              setShowTextColorPicker(false);
            }}
            title="Highlight Text Color"
            className="w-full h-8 flex items-center justify-between px-2 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <Highlighter className="w-3.5 h-3.5" />
              <span>Highlight</span>
            </div>
            <div
              className="w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: activeHighlightColor }}
            />
          </Button>

          {showHighlightPicker && (
            <div className="absolute right-0 bottom-full mb-1 z-30 p-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-md shadow-xl w-48 space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Highlight Colors
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onMouseDown={preventBlur}
                    onClick={() => applyHighlightColor(h.value)}
                    title={h.label}
                    className={`h-6 rounded border text-[10px] font-medium flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                      h.value === 'transparent'
                        ? 'border-dashed border-neutral-400 text-muted-foreground'
                        : 'border-black/20'
                    }`}
                    style={{ backgroundColor: h.bg }}
                  >
                    {h.label === 'None' ? 'None' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
