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
  SparkleRegular,
  TargetArrowRegular,
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

type AlignmentCommand = 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull';

const ALIGN_CSS_VALUE: Record<AlignmentCommand, 'left' | 'center' | 'right' | 'justify'> = {
  justifyLeft: 'left',
  justifyCenter: 'center',
  justifyRight: 'right',
  justifyFull: 'justify',
};

function isFocusTintBackground(rawBg: string): boolean {
  const bg = rawBg.replace(/\s+/g, '').toLowerCase();
  return (
    /^rgba\(15,108,189,0\.0(?:8|78\d*)\)$/.test(bg) ||
    /^rgba\(255,255,255,0\.2(?:0*)?\)$/.test(bg)
  );
}

function findEditableAncestor(node: Node | null | undefined): HTMLElement | null {
  if (!node) return null;
  const el = node instanceof HTMLElement ? node : node.parentElement;
  return (el?.closest('.editable-text') as HTMLElement | null) ?? null;
}

function rangeIntersectsNode(range: Range, node: Node): boolean {
  if (node.contains(range.startContainer) || node.contains(range.endContainer)) {
    return true;
  }
  if (typeof range.intersectsNode === 'function') {
    try {
      return range.intersectsNode(node);
    } catch {
      // Fallback below when DOM implementation throws
    }
  }
  const nodeRange = document.createRange();
  nodeRange.selectNodeContents(node);
  return (
    range.compareBoundaryPoints(Range.END_TO_START, nodeRange) <= 0 &&
    range.compareBoundaryPoints(Range.START_TO_END, nodeRange) >= 0
  );
}

function cleanupAlignmentArtifacts(
  editable: HTMLElement,
  preExistingSpans: Set<HTMLSpanElement>
): void {
  // Normalize legacy align="..." attributes into inline style.textAlign
  editable.querySelectorAll('[align]').forEach((node) => {
    const el = node as HTMLElement;
    const alignVal = el.getAttribute('align')?.trim().toLowerCase();
    el.removeAttribute('align');
    if (alignVal && !el.style.textAlign) {
      el.style.textAlign = alignVal;
    }
  });

  const sel = window.getSelection();
  const activeRange =
    sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).commonAncestorContainer)
      ? sel.getRangeAt(0)
      : null;

  let sc: Node | null = activeRange ? activeRange.startContainer : null;
  let so = activeRange ? activeRange.startOffset : 0;
  let ec: Node | null = activeRange ? activeRange.endContainer : null;
  let eo = activeRange ? activeRange.endOffset : 0;
  let unwrappedAny = false;

  editable.querySelectorAll('span').forEach((span) => {
    const isSyntheticSpan = !preExistingSpans.has(span);
    if (span.style.fontFamily) {
      span.style.removeProperty('font-family');
    }
    if (isSyntheticSpan && span.style.fontSize) {
      span.style.removeProperty('font-size');
    }
    if (isFocusTintBackground(span.style.backgroundColor)) {
      span.style.removeProperty('background-color');
    }
    if (!span.getAttribute('style')?.trim()) {
      span.removeAttribute('style');
    }

    if (span.attributes.length === 0 && span.parentNode) {
      const parent = span.parentNode;
      const spanIndex = Array.prototype.indexOf.call(parent.childNodes, span);
      if (sc === span) {
        sc = parent;
        so = spanIndex + so;
      }
      if (ec === span) {
        ec = parent;
        eo = spanIndex + eo;
      }
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
      unwrappedAny = true;
    }
  });

  if (unwrappedAny && sc && ec && sel) {
    try {
      const restored = document.createRange();
      restored.setStart(sc, so);
      restored.setEnd(ec, eo);
      sel.removeAllRanges();
      sel.addRange(restored);
    } catch {
      // Ignore if endpoints cannot be restored
    }
  }
}

function ensureBlockAlignment(
  editable: HTMLElement,
  alignValue: 'left' | 'center' | 'right' | 'justify'
): void {
  const sel = window.getSelection();
  const range =
    sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).commonAncestorContainer)
      ? sel.getRangeAt(0)
      : null;

  const blockChildren = Array.from(editable.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && (child.tagName === 'DIV' || child.tagName === 'P')
  );

  if (blockChildren.length > 0) {
    const targeted = range
      ? blockChildren.filter((block) => rangeIntersectsNode(range, block))
      : blockChildren;
    if (targeted.length > 0) {
      targeted.forEach((block) => {
        block.style.textAlign = alignValue;
      });
      return;
    }
    // If selection sits in direct inline nodes alongside block siblings, only fall through when no blocks
    if (!range) {
      blockChildren.forEach((block) => {
        block.style.textAlign = alignValue;
      });
      return;
    }
  }

  if (!editable.firstChild) return;
  const saved = range
    ? {
        sc: range.startContainer,
        so: range.startOffset,
        ec: range.endContainer,
        eo: range.endOffset,
      }
    : null;

  const wrapper = document.createElement('div');
  wrapper.style.textAlign = alignValue;

  if (blockChildren.length > 0 && range) {
    // Wrap only the contiguous non-block run containing the range start
    let anchor: Node = range.startContainer;
    while (anchor.parentNode && anchor.parentNode !== editable) {
      anchor = anchor.parentNode;
    }
    let startNode: Node | null = anchor;
    while (
      startNode.previousSibling &&
      !(
        startNode.previousSibling instanceof HTMLElement &&
        (startNode.previousSibling.tagName === 'DIV' ||
          startNode.previousSibling.tagName === 'P')
      )
    ) {
      startNode = startNode.previousSibling;
    }
    const nodesToWrap: Node[] = [];
    let cur: Node | null = startNode;
    while (
      cur &&
      !(
        cur instanceof HTMLElement &&
        (cur.tagName === 'DIV' || cur.tagName === 'P')
      )
    ) {
      nodesToWrap.push(cur);
      cur = cur.nextSibling;
    }
    if (nodesToWrap.length === 0) return;
    editable.insertBefore(wrapper, nodesToWrap[0]);
    nodesToWrap.forEach((n) => wrapper.appendChild(n));
  } else {
    while (editable.firstChild) {
      wrapper.appendChild(editable.firstChild);
    }
    editable.appendChild(wrapper);
  }

  if (saved && sel) {
    try {
      const restored = document.createRange();
      if (saved.sc === editable) {
        restored.setStart(wrapper, Math.min(saved.so, wrapper.childNodes.length));
      } else {
        restored.setStart(saved.sc, saved.so);
      }
      if (saved.ec === editable) {
        restored.setEnd(wrapper, Math.min(saved.eo, wrapper.childNodes.length));
      } else {
        restored.setEnd(saved.ec, saved.eo);
      }
      sel.removeAllRanges();
      sel.addRange(restored);
    } catch {
      // Ignore if range endpoints were invalidated
    }
  }
}

export const HomeTab: React.FC = () => {
  const {
    resumeData,
    setFont,
    undo,
    redo,
    canUndo,
    canRedo,
    setIsFindReplaceModalOpen,
    setIsJdMatcherModalOpen,
    openRewriteModal,
    showToast,
  } = useResume();

  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [textPopoverOpen, setTextPopoverOpen] = useState(false);
  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState(false);

  // Preserves text selection inside contenteditable before dropdown interaction shifts focus
  const savedRangeRef = useRef<Range | null>(null);
  const lastEditableRef = useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const editable = findEditableAncestor(e.target as Node);
      if (editable) {
        lastEditableRef.current = editable;
      }
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  const captureSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!findEditableAncestor(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = (clearAfter = true) => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      if (clearAfter) {
        savedRangeRef.current = null;
      }
    }
  };

  const notifyEditableInput = (node: Node | null | undefined) => {
    const editable = findEditableAncestor(node);
    if (editable) {
      editable.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const getActiveEditableElement = (): HTMLElement | null => {
    const activeEditable = findEditableAncestor(document.activeElement);
    if (activeEditable) return activeEditable;
    const sel = window.getSelection();
    return findEditableAncestor(sel?.anchorNode);
  };

  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const formatText = (cmd: string) => {
    const editable = getActiveEditableElement();
    if (!editable) return;
    if (typeof document.execCommand === 'function') {
      document.execCommand(cmd, false, undefined);
    }
    notifyEditableInput(editable);
  };

  const clearFormatting = () => {
    const editable = getActiveEditableElement();
    if (!editable) return;
    if (typeof document.execCommand === 'function') {
      document.execCommand('removeFormat', false, undefined);
      document.execCommand('unlink', false, undefined);
    }
    notifyEditableInput(editable);
  };

  const applyTextColor = (color: string, closePopover = true) => {
    setActiveTextColor(color);
    restoreSelection(closePopover);
    const editable = getActiveEditableElement();
    if (editable && typeof document.execCommand === 'function') {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, color);
      if (!closePopover) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const nextRange = sel.getRangeAt(0);
          if (findEditableAncestor(nextRange.commonAncestorContainer)) {
            savedRangeRef.current = nextRange.cloneRange();
          }
        }
      }
      notifyEditableInput(editable);
    }
    if (closePopover) {
      setTextPopoverOpen(false);
    }
  };

  const applyHighlightColor = (color: string) => {
    setActiveHighlightColor(color);
    restoreSelection(true);
    const editable = getActiveEditableElement();
    if (editable && typeof document.execCommand === 'function') {
      document.execCommand('styleWithCSS', false, 'true');
      try {
        document.execCommand('hiliteColor', false, color);
      } catch {
        document.execCommand('backColor', false, color);
      }
      notifyEditableInput(editable);
    }
    setHighlightPopoverOpen(false);
  };

  const wrapSelectionInSpan = (configureSpan: (span: HTMLSpanElement) => void) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!findEditableAncestor(range.commonAncestorContainer)) return false;
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
    restoreSelection(true);
    const editable = getActiveEditableElement();
    if (!editable) return;
    if (fontSize === 'inherit') {
      if (typeof document.execCommand === 'function') {
        document.execCommand('removeFormat', false, undefined);
      }
      notifyEditableInput(editable);
      return;
    }
    if (!wrapSelectionInSpan((span) => { span.style.fontSize = fontSize; })) {
      if (typeof document.execCommand === 'function') {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('fontSize', false, '3');
      }
      notifyEditableInput(editable);
    }
  };

  const adjustFontSize = (direction: 'up' | 'down') => {
    const size = direction === 'up' ? '1.18em' : '0.85em';
    if (!wrapSelectionInSpan((span) => { span.style.fontSize = size; })) {
      const editable = getActiveEditableElement();
      if (!editable) return;
      if (typeof document.execCommand === 'function') {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('fontSize', false, direction === 'up' ? '4' : '2');
      }
      notifyEditableInput(editable);
    }
  };

  const formatCustom = (style: string, className = '') => {
    if (
      !wrapSelectionInSpan((span) => {
        if (style) span.setAttribute('style', style);
        if (className) span.className = className;
      })
    ) {
      const editable = getActiveEditableElement();
      if (!editable) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!findEditableAncestor(range.commonAncestorContainer)) return;

      if (typeof document.execCommand === 'function') {
        document.execCommand('styleWithCSS', false, 'true');
      }

      const span = document.createElement('span');
      if (style) span.setAttribute('style', style);
      if (className) span.className = className;
      const zwsp = document.createTextNode('\u200B');
      span.appendChild(zwsp);
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.setStart(zwsp, 1);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      notifyEditableInput(editable);
    }
  };

  const formatAlignment = (alignment: AlignmentCommand) => {
    const editable = getActiveEditableElement();
    if (!editable) return;

    const tag = editable.tagName;
    const isBlockHost =
      tag === 'DIV' || tag === 'P' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'LI';
    if (!isBlockHost || tag !== 'DIV') return;

    const alignValue = ALIGN_CSS_VALUE[alignment];
    const preExistingSpans = new Set(Array.from(editable.querySelectorAll('span')));
    let executed = false;
    if (typeof document.execCommand === 'function') {
      document.execCommand('styleWithCSS', false, 'true');
      executed = document.execCommand(alignment, false, undefined);
    }

    cleanupAlignmentArtifacts(editable, preExistingSpans);

    if (!executed || (alignment === 'justifyLeft' && editable.closest('td, th'))) {
      ensureBlockAlignment(editable, alignValue);
    }

    notifyEditableInput(editable);
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
              onOpenChange={(_, data) => {
                setTextPopoverOpen(data.open);
                if (!data.open) savedRangeRef.current = null;
              }}
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
                      onChange={(e) => applyTextColor(e.target.value, false)}
                      className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </PopoverSurface>
            </Popover>

            {/* Highlight Color Popover */}
            <Popover
              open={highlightPopoverOpen}
              onOpenChange={(_, data) => {
                setHighlightPopoverOpen(data.open);
                if (!data.open) savedRangeRef.current = null;
              }}
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

      {/* Editing & Smart Assistants */}
      <RibbonGroup label="Editing & ATS" showDivider={false}>
        <RibbonActionButton
          icon={<SearchRegular />}
          label="Find"
          onClick={() => setIsFindReplaceModalOpen(true)}
          title="Find and replace text across the resume (Ctrl+F)"
        />
        <RibbonActionButton
          icon={<SparkleRegular />}
          label="Rewrite"
          onMouseDown={preventBlur}
          onClick={() => {
            const targetEl = getActiveEditableElement() || lastEditableRef.current;
            if (!targetEl || !document.body.contains(targetEl)) {
              showToast('Click any paragraph, bullet, or cell first, then click Rewrite');
              return;
            }
            const plain = (targetEl.textContent || '').trim();
            openRewriteModal({
              title: 'Rewrite & Tighten Focused Text',
              initialText: plain,
              onApply: (rewritten) => {
                targetEl.textContent = rewritten;
                targetEl.dispatchEvent(new Event('input', { bubbles: true }));
              },
            });
          }}
          title="Rewrite or tighten the selected bullet or paragraph"
        />
        <RibbonActionButton
          icon={<TargetArrowRegular />}
          label="JD Match"
          onClick={() => setIsJdMatcherModalOpen(true)}
          title="Compare resume against a Job Description for ATS keywords"
        />
      </RibbonGroup>
    </div>
  );
};
