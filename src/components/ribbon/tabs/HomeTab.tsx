import React, { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { FONT_OPTIONS } from '../../../constants/themes';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Baseline,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Search,
} from 'lucide-react';

const TEXT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Slate Gray', value: '#4b5563' },
  { label: 'Navy Blue', value: '#1e40af' },
  { label: 'Crimson Red', value: '#b91c1c' },
  { label: 'Forest Green', value: '#15803d' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Royal Purple', value: '#7c3aed' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bae6fd' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Purple', value: '#e9d5ff' },
];

const FONT_SIZES = [
  { label: 'Size', value: 'inherit' },
  { label: '9pt', value: '9pt' },
  { label: '10.5pt', value: '10.5pt' },
  { label: '12pt', value: '12pt' },
  { label: '14pt', value: '14pt' },
  { label: '16pt', value: '16pt' },
];

export const HomeTab: React.FC = () => {
  const {
    resumeData,
    setFont,
    undo,
    redo,
    canUndo,
    canRedo,
    setIsFindReplaceModalOpen,
  } = useResume();

  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');

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

  const formatAlignment = (alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') => {
    document.execCommand(alignment, false, undefined);
  };

  return (
    <div className="flex items-stretch h-full gap-1.5 sm:gap-2.5 py-1 px-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Undo / History Group ── */}
      <div className="flex flex-col items-center justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1 my-auto">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="fluent-btn w-12 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground disabled:opacity-30 cursor-pointer transition-colors"
          >
            <Undo2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] mt-1 font-medium leading-none">Undo</span>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className="fluent-btn w-12 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground disabled:opacity-30 cursor-pointer transition-colors"
          >
            <Redo2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] mt-1 font-medium leading-none">Redo</span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none">
          Undo
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Font Group (Two-Row Microsoft Word Layout) ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex flex-col gap-1.5 my-auto">
          {/* Row 1: Font Family, Size Preset, Sizing Actions */}
          <div className="flex items-center gap-1.5">
            <select
              value={resumeData.meta.font}
              onChange={(e) => setFont(e.target.value)}
              title="Resume Font Family"
              className="h-6 text-xs px-2 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none focus:border-primary w-38 sm:w-44 truncate shadow-2xs transition-colors"
            >
              {FONT_OPTIONS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              defaultValue="inherit"
              onChange={(e) => {
                applyFontSize(e.target.value);
                e.target.value = 'inherit';
              }}
              title="Font Size"
              className="h-6 text-xs px-1.5 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none focus:border-primary w-16 shadow-2xs transition-colors"
            >
              {FONT_SIZES.map((sz) => (
                <option key={sz.value} value={sz.value}>
                  {sz.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-0.5 border-l border-(--ui-border) pl-1">
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={() => adjustFontSize('up')}
                title="Increase Font Size (A+)"
                className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground text-xs font-bold cursor-pointer"
              >
                A<sup>+</sup>
              </button>
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={() => adjustFontSize('down')}
                title="Decrease Font Size (A-)"
                className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground text-xs font-bold cursor-pointer"
              >
                A<sup>-</sup>
              </button>
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={clearFormatting}
                title="Clear Formatting"
                className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Inline Styles */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('bold')}
              title="Bold (Ctrl+B)"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('italic')}
              title="Italic (Ctrl+I)"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('underline')}
              title="Underline (Ctrl+U)"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('strikeThrough')}
              title="Strikethrough"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('subscript')}
              title="Subscript (X₂)"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground text-[11px] font-semibold cursor-pointer"
            >
              X₂
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatText('superscript')}
              title="Superscript (X²)"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground text-[11px] font-semibold cursor-pointer"
            >
              X²
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatCustom('', 'code-inline')}
              title="Inline Code"
              className="fluent-btn w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-(--ui-border) mx-0.5" />

            {/* Font Color dropdown button */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={() => {
                  setShowTextColorPicker((prev) => !prev);
                  setShowHighlightPicker(false);
                }}
                title="Font Color"
                className="fluent-btn w-7 h-6 flex flex-col items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
              >
                <Baseline className="w-3.5 h-3.5" />
                <span
                  className="w-4 h-1 rounded-full mt-0.5 shadow-2xs"
                  style={{ backgroundColor: activeTextColor }}
                />
              </button>

              {showTextColorPicker && (
                <div className="absolute left-0 top-full mt-1.5 z-50 p-2.5 bg-(--ui-surface) border border-(--ui-border) rounded-lg shadow-xl w-48 space-y-2 animate-fluent-flyout">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Text Color
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onMouseDown={preventBlur}
                        onClick={() => applyTextColor(c.value)}
                        title={c.label}
                        className="fluent-btn w-5 h-5 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <div className="pt-1.5 flex items-center gap-1.5 border-t border-(--ui-border)">
                    <span className="text-[10px] text-muted-foreground">Custom:</span>
                    <input
                      type="color"
                      value={activeTextColor}
                      onChange={(e) => applyTextColor(e.target.value)}
                      className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Highlight Color dropdown button */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={preventBlur}
                onClick={() => {
                  setShowHighlightPicker((prev) => !prev);
                  setShowTextColorPicker(false);
                }}
                title="Highlight Color"
                className="fluent-btn w-7 h-6 flex flex-col items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span
                  className="w-4 h-1 rounded-full mt-0.5 shadow-2xs"
                  style={{ backgroundColor: activeHighlightColor }}
                />
              </button>

              {showHighlightPicker && (
                <div className="absolute left-0 top-full mt-1.5 z-50 p-2.5 bg-(--ui-surface) border border-(--ui-border) rounded-lg shadow-xl w-48 space-y-2 animate-fluent-flyout">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Highlight Color
                  </span>
                  <div className="grid grid-cols-6 gap-1">
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onMouseDown={preventBlur}
                        onClick={() => applyHighlightColor(c.value)}
                        title={c.label}
                        className="fluent-btn w-5 h-5 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Small caps button */}
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => formatCustom('font-variant:small-caps')}
              title="Small Caps"
              className="fluent-btn px-1.5 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground text-[10px] font-bold cursor-pointer"
              style={{ fontVariant: 'small-caps' }}
            >
              Sc
            </button>
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Font
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Paragraph Group (Fluent 2x2 Grid) ── */}
      <div className="flex flex-col items-center justify-between shrink-0 px-1 py-0.5">
        <div className="grid grid-cols-2 gap-1 my-auto">
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => formatAlignment('justifyLeft')}
            title="Align Left (Ctrl+L)"
            className="fluent-btn w-7 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => formatAlignment('justifyCenter')}
            title="Center (Ctrl+E)"
            className="fluent-btn w-7 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => formatAlignment('justifyRight')}
            title="Align Right (Ctrl+R)"
            className="fluent-btn w-7 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={() => formatAlignment('justifyFull')}
            title="Justify (Ctrl+J)"
            className="fluent-btn w-7 h-6 flex items-center justify-center rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none">
          Paragraph
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Editing Group (Tall Fluent Find & Replace Button) ── */}
      <div className="flex flex-col items-center justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center my-auto">
          <button
            type="button"
            onClick={() => setIsFindReplaceModalOpen(true)}
            title="Find & Replace text across entire resume (Ctrl+F)"
            className="fluent-btn w-16 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="text-[10px] mt-1 font-medium leading-none text-center">
              Find &amp; Replace
            </span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none">
          Editing
        </span>
      </div>
    </div>
  );
};
