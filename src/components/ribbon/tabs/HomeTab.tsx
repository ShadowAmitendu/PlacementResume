import React, { useState, useRef } from 'react';
import {
  Dropdown,
  Option,
  OptionGroup,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  SwatchPicker,
  ColorSwatch,
  Button,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowUndoRegular,
  ArrowRedoRegular,
  TextBoldRegular,
  TextItalicRegular,
  TextUnderlineRegular,
  TextStrikethroughRegular,
  TextSubscriptRegular,
  TextSuperscriptRegular,
  CodeRegular,
  TextColorRegular,
  HighlightRegular,
  EraserRegular,
  TextAlignLeftRegular,
  TextAlignCenterRegular,
  TextAlignRightRegular,
  TextAlignJustifyRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { FONT_OPTIONS } from '../../../constants/themes';
import { RibbonGroup, RibbonActionButton } from '../RibbonGroup';

const TEXT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Slate Gray', value: '#4b5563' },
  { label: 'Navy Blue', value: '#1e40af' },
  { label: 'Crimson Red', value: '#b91c1c' },
  { label: 'Forest Green', value: '#15803d' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Purple', value: '#7c3aed' },
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
  { label: 'Default', value: 'inherit' },
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

  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [textPopoverOpen, setTextPopoverOpen] = useState(false);
  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState(false);

  // Preserves text selection inside contenteditable before dropdown interaction shifts focus
  const savedRangeRef = useRef<Range | null>(null);

  const captureSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      savedRangeRef.current = null;
    }
  };

  const notifyEditableInput = (node: Node | null | undefined) => {
    const el = node instanceof HTMLElement ? node : node?.parentElement;
    const editable = el?.closest('.editable-text');
    if (editable) {
      editable.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const getActiveEditableElement = (): Element | null => {
    const active = document.activeElement;
    if (active?.classList.contains('editable-text')) return active;
    const sel = window.getSelection();
    const anchorEl =
      sel?.anchorNode instanceof HTMLElement
        ? sel.anchorNode
        : sel?.anchorNode?.parentElement;
    return anchorEl?.closest('.editable-text') ?? null;
  };

  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const formatText = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    notifyEditableInput(getActiveEditableElement());
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('unlink', false, undefined);
    notifyEditableInput(getActiveEditableElement());
  };

  const applyTextColor = (color: string) => {
    setActiveTextColor(color);
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    notifyEditableInput(getActiveEditableElement());
    setTextPopoverOpen(false);
  };

  const applyHighlightColor = (color: string) => {
    setActiveHighlightColor(color);
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    try {
      document.execCommand('hiliteColor', false, color);
    } catch {
      document.execCommand('backColor', false, color);
    }
    notifyEditableInput(getActiveEditableElement());
    setHighlightPopoverOpen(false);
  };

  const wrapSelectionInSpan = (configureSpan: (span: HTMLSpanElement) => void) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    configureSpan(span);
    try {
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      notifyEditableInput(span);
      return true;
    } catch {
      return false;
    }
  };

  const applyFontSize = (fontSize: string) => {
    restoreSelection();
    if (fontSize === 'inherit') {
      document.execCommand('removeFormat', false, undefined);
      notifyEditableInput(getActiveEditableElement());
      return;
    }
    if (!wrapSelectionInSpan((span) => { span.style.fontSize = fontSize; })) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '3');
      notifyEditableInput(getActiveEditableElement());
    }
  };

  const adjustFontSize = (direction: 'up' | 'down') => {
    const size = direction === 'up' ? '1.18em' : '0.85em';
    if (!wrapSelectionInSpan((span) => { span.style.fontSize = size; })) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, direction === 'up' ? '4' : '2');
      notifyEditableInput(getActiveEditableElement());
    }
  };

  const formatCustom = (style: string, className = '') => {
    if (
      !wrapSelectionInSpan((span) => {
        if (style) span.setAttribute('style', style);
        if (className) span.className = className;
      })
    ) {
      document.execCommand(style ? 'formatBlock' : 'fontName', false, undefined);
      notifyEditableInput(getActiveEditableElement());
    }
  };

  const formatAlignment = (
    alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull'
  ) => {
    document.execCommand(alignment, false, undefined);
    notifyEditableInput(getActiveEditableElement());
  };

  const selectedFontLabel =
    FONT_OPTIONS.flatMap((g) => g.options).find((o) => o.value === resumeData.meta.font)
      ?.label || 'Select font';

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Undo Group */}
      <RibbonGroup label="History">
        <RibbonActionButton
          icon={<ArrowUndoRegular />}
          label="Undo"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        />
        <RibbonActionButton
          icon={<ArrowRedoRegular />}
          label="Redo"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        />
      </RibbonGroup>

      {/* Font Group */}
      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1">
          {/* Row 1: Font Dropdown, Size Dropdown, Step & Clear */}
          <div className="flex items-center gap-1">
            <Dropdown
              aria-label="Resume font family"
              size="small"
              value={selectedFontLabel}
              selectedOptions={[resumeData.meta.font]}
              onOptionSelect={(_, data) => {
                if (data.optionValue) setFont(data.optionValue);
              }}
              style={{ minWidth: 165, maxWidth: 180 }}
            >
              {FONT_OPTIONS.map((group) => (
                <OptionGroup key={group.group} label={group.group}>
                  {group.options.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </OptionGroup>
              ))}
            </Dropdown>

            <Dropdown
              aria-label="Selection font size"
              size="small"
              placeholder="Size"
              selectedOptions={[]}
              onMouseDown={captureSelection}
              onOptionSelect={(_, data) => {
                if (data.optionValue) applyFontSize(data.optionValue);
              }}
              style={{ minWidth: 74, maxWidth: 82 }}
            >
              {FONT_SIZES.map((sz) => (
                <Option key={sz.value} value={sz.value}>
                  {sz.label}
                </Option>
              ))}
            </Dropdown>

            <Toolbar size="small" style={{ padding: 0, gap: 1 }}>
              <ToolbarDivider />
              <Tooltip content="Increase font size" relationship="label">
                <ToolbarButton
                  aria-label="Increase font size"
                  onMouseDown={preventBlur}
                  onClick={() => adjustFontSize('up')}
                  style={{ minWidth: 26, fontSize: 12, fontWeight: 600 }}
                >
                  A+
                </ToolbarButton>
              </Tooltip>
              <Tooltip content="Decrease font size" relationship="label">
                <ToolbarButton
                  aria-label="Decrease font size"
                  onMouseDown={preventBlur}
                  onClick={() => adjustFontSize('down')}
                  style={{ minWidth: 26, fontSize: 12, fontWeight: 600 }}
                >
                  A-
                </ToolbarButton>
              </Tooltip>
              <Tooltip content="Clear formatting" relationship="label">
                <ToolbarButton
                  aria-label="Clear formatting"
                  icon={<EraserRegular />}
                  onMouseDown={preventBlur}
                  onClick={clearFormatting}
                />
              </Tooltip>
            </Toolbar>
          </div>

          {/* Row 2: Inline Styles & Color Popovers */}
          <Toolbar size="small" style={{ padding: 0, gap: 1 }}>
            <Tooltip content="Bold (Ctrl+B)" relationship="label">
              <ToolbarButton
                aria-label="Bold"
                icon={<TextBoldRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('bold')}
              />
            </Tooltip>
            <Tooltip content="Italic (Ctrl+I)" relationship="label">
              <ToolbarButton
                aria-label="Italic"
                icon={<TextItalicRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('italic')}
              />
            </Tooltip>
            <Tooltip content="Underline (Ctrl+U)" relationship="label">
              <ToolbarButton
                aria-label="Underline"
                icon={<TextUnderlineRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('underline')}
              />
            </Tooltip>
            <Tooltip content="Strikethrough" relationship="label">
              <ToolbarButton
                aria-label="Strikethrough"
                icon={<TextStrikethroughRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('strikeThrough')}
              />
            </Tooltip>
            <Tooltip content="Subscript" relationship="label">
              <ToolbarButton
                aria-label="Subscript"
                icon={<TextSubscriptRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('subscript')}
              />
            </Tooltip>
            <Tooltip content="Superscript" relationship="label">
              <ToolbarButton
                aria-label="Superscript"
                icon={<TextSuperscriptRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatText('superscript')}
              />
            </Tooltip>
            <Tooltip content="Inline code" relationship="label">
              <ToolbarButton
                aria-label="Inline code"
                icon={<CodeRegular />}
                onMouseDown={preventBlur}
                onClick={() => formatCustom('', 'code-inline')}
              />
            </Tooltip>

            <ToolbarDivider />

            {/* Text Color Popover */}
            <Popover
              open={textPopoverOpen}
              onOpenChange={(_, data) => setTextPopoverOpen(data.open)}
              trapFocus={false}
            >
              <PopoverTrigger disableButtonEnhancement>
                <ToolbarButton
                  aria-label="Font color"
                  title="Font color"
                  onMouseDown={(e) => {
                    preventBlur(e);
                    captureSelection();
                  }}
                  style={{ flexDirection: 'column', gap: 1, minWidth: 28 }}
                >
                  <TextColorRegular fontSize={15} />
                  <span
                    className="w-3.5 h-[2.5px] rounded-full"
                    style={{ backgroundColor: activeTextColor }}
                  />
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverSurface style={{ padding: 10 }}>
                <div className="space-y-2">
                  <span
                    className="text-[11px] font-semibold block"
                    style={{ color: tokens.colorNeutralForeground2 }}
                  >
                    Font color
                  </span>
                  <SwatchPicker
                    aria-label="Text color palette"
                    size="extra-small"
                    shape="circular"
                    selectedValue={activeTextColor}
                    onSelectionChange={(_, data) => applyTextColor(data.selectedValue)}
                  >
                    {TEXT_COLORS.map((c) => (
                      <ColorSwatch
                        key={c.value}
                        value={c.value}
                        color={c.value}
                        aria-label={c.label}
                      />
                    ))}
                  </SwatchPicker>
                  <div
                    className="pt-1.5 flex items-center justify-between text-[11px]"
                    style={{
                      borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
                      color: tokens.colorNeutralForeground2,
                    }}
                  >
                    <span>Custom color</span>
                    <input
                      type="color"
                      value={activeTextColor}
                      onChange={(e) => applyTextColor(e.target.value)}
                      className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </PopoverSurface>
            </Popover>

            {/* Highlight Color Popover */}
            <Popover
              open={highlightPopoverOpen}
              onOpenChange={(_, data) => setHighlightPopoverOpen(data.open)}
              trapFocus={false}
            >
              <PopoverTrigger disableButtonEnhancement>
                <ToolbarButton
                  aria-label="Highlight color"
                  title="Text highlight color"
                  onMouseDown={(e) => {
                    preventBlur(e);
                    captureSelection();
                  }}
                  style={{ flexDirection: 'column', gap: 1, minWidth: 28 }}
                >
                  <HighlightRegular fontSize={15} />
                  <span
                    className="w-3.5 h-[2.5px] rounded-full"
                    style={{ backgroundColor: activeHighlightColor }}
                  />
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverSurface style={{ padding: 10 }}>
                <div className="space-y-2">
                  <span
                    className="text-[11px] font-semibold block"
                    style={{ color: tokens.colorNeutralForeground2 }}
                  >
                    Highlight color
                  </span>
                  <SwatchPicker
                    aria-label="Highlight color palette"
                    size="extra-small"
                    shape="circular"
                    selectedValue={activeHighlightColor}
                    onSelectionChange={(_, data) => applyHighlightColor(data.selectedValue)}
                  >
                    {HIGHLIGHT_COLORS.map((c) => (
                      <ColorSwatch
                        key={c.value}
                        value={c.value}
                        color={c.value === 'transparent' ? '#ffffff' : c.value}
                        aria-label={c.label}
                      />
                    ))}
                  </SwatchPicker>
                  <Button
                    appearance="subtle"
                    size="small"
                    onMouseDown={preventBlur}
                    onClick={() => applyHighlightColor('transparent')}
                    style={{ width: '100%', fontSize: 11 }}
                  >
                    No highlight
                  </Button>
                </div>
              </PopoverSurface>
            </Popover>

            <Tooltip content="Small caps" relationship="label">
              <ToolbarButton
                aria-label="Small caps"
                onMouseDown={preventBlur}
                onClick={() => formatCustom('font-variant:small-caps')}
                style={{ fontVariant: 'small-caps', fontSize: 11, fontWeight: 600 }}
              >
                Sc
              </ToolbarButton>
            </Tooltip>
          </Toolbar>
        </div>
      </RibbonGroup>

      {/* Paragraph Alignment Group */}
      <RibbonGroup label="Paragraph">
        <div className="grid grid-cols-2 gap-0.5">
          <Tooltip content="Align left" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              aria-label="Align left"
              icon={<TextAlignLeftRegular />}
              onMouseDown={preventBlur}
              onClick={() => formatAlignment('justifyLeft')}
              style={{ minWidth: 26, height: 24, padding: 0 }}
            />
          </Tooltip>
          <Tooltip content="Center" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              aria-label="Center"
              icon={<TextAlignCenterRegular />}
              onMouseDown={preventBlur}
              onClick={() => formatAlignment('justifyCenter')}
              style={{ minWidth: 26, height: 24, padding: 0 }}
            />
          </Tooltip>
          <Tooltip content="Align right" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              aria-label="Align right"
              icon={<TextAlignRightRegular />}
              onMouseDown={preventBlur}
              onClick={() => formatAlignment('justifyRight')}
              style={{ minWidth: 26, height: 24, padding: 0 }}
            />
          </Tooltip>
          <Tooltip content="Justify" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              aria-label="Justify"
              icon={<TextAlignJustifyRegular />}
              onMouseDown={preventBlur}
              onClick={() => formatAlignment('justifyFull')}
              style={{ minWidth: 26, height: 24, padding: 0 }}
            />
          </Tooltip>
        </div>
      </RibbonGroup>

      {/* Editing Group */}
      <RibbonGroup label="Editing" showDivider={false}>
        <RibbonActionButton
          icon={<SearchRegular />}
          label="Find"
          onClick={() => setIsFindReplaceModalOpen(true)}
          title="Find and replace text across the resume (Ctrl+F)"
        />
      </RibbonGroup>
    </div>
  );
};
