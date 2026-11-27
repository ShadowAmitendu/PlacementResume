import React, { useRef, useLayoutEffect } from 'react';
import { sanitizeRichTextHtml } from '../../utils/sanitize';

interface EditableContentProps {
  html: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'li';
  placeholder?: string;
  singleLine?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  transformOnBlur?: (value: string) => string;
}

function isElementEmpty(el: HTMLElement): boolean {
  return (
    !el.querySelector('img, svg') &&
    (el.textContent || '').replace(/[\u200B\u00A0\s]/g, '') === ''
  );
}

export const EditableContent: React.FC<EditableContentProps> = ({
  html,
  onChange,
  className = '',
  style,
  tagName: Tag = 'span',
  placeholder,
  singleLine = false,
  onKeyDown,
  transformOnBlur,
}) => {
  const ref = useRef<HTMLElement>(null);
  const initializedRef = useRef(false);
  const lastHtmlRef = useRef(html);

  // Initialize innerHTML once on mount and update DOM only when changed externally (e.g. Undo, Redo, Import)
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (!initializedRef.current || html !== lastHtmlRef.current) {
      const cleanHtml = sanitizeRichTextHtml(html);
      ref.current.innerHTML = cleanHtml;
      lastHtmlRef.current = cleanHtml;
      initializedRef.current = true;
    }
  }, [html]);

  const readNormalizedHtml = (): string => {
    if (!ref.current) return '';
    if (isElementEmpty(ref.current)) {
      ref.current.innerHTML = '';
      return '';
    }
    const currentHtml = ref.current.innerHTML;
    return currentHtml === '' ? '' : sanitizeRichTextHtml(currentHtml);
  };

  const handleInput = () => {
    if (!ref.current) return;
    const cleanHtml = readNormalizedHtml();
    lastHtmlRef.current = cleanHtml;
    onChange(cleanHtml);
  };

  const handleBlur = () => {
    if (!ref.current) return;
    let currentHtml = ref.current.innerHTML;
    if (isElementEmpty(ref.current)) {
      currentHtml = '';
      ref.current.innerHTML = '';
    }
    if (transformOnBlur && currentHtml) {
      const transformed = sanitizeRichTextHtml(transformOnBlur(ref.current.textContent || ''));
      if (transformed !== currentHtml) {
        currentHtml = transformed;
        ref.current.innerHTML = transformed;
      }
    }
    const cleanHtml = currentHtml === '' ? '' : sanitizeRichTextHtml(currentHtml);
    if (cleanHtml !== lastHtmlRef.current) {
      lastHtmlRef.current = cleanHtml;
      onChange(cleanHtml);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    if (!ref.current) return;

    const rawText = e.clipboardData?.getData('text/plain');
    if (!rawText) return;

    const normalized = rawText.replace(/\r\n?/g, '\n');
    const preparedText = singleLine ? normalized.replace(/\n+/g, ' ') : normalized;

    const sel = window.getSelection();
    const activeEl = document.activeElement;
    const isFocusedInside =
      activeEl === ref.current || (activeEl instanceof Node && ref.current.contains(activeEl));
    const hasRangeInside =
      !!sel && sel.rangeCount > 0 && ref.current.contains(sel.getRangeAt(0).commonAncestorContainer);

    let insertedByExecCommand = false;
    if ((isFocusedInside || hasRangeInside) && typeof document.execCommand === 'function') {
      try {
        insertedByExecCommand = document.execCommand('insertText', false, preparedText);
      } catch {
        insertedByExecCommand = false;
      }
    }

    if (insertedByExecCommand) {
      const cleanHtml = readNormalizedHtml();
      if (cleanHtml !== lastHtmlRef.current) {
        lastHtmlRef.current = cleanHtml;
        onChange(cleanHtml);
      }
      return;
    }

    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;
    range.deleteContents();

    const frag = document.createDocumentFragment();
    if (singleLine) {
      frag.appendChild(document.createTextNode(preparedText));
    } else {
      const lines = preparedText.split('\n');
      if (Tag === 'div' && lines.length > 1) {
        lines.forEach((line, i) => {
          if (i === 0) {
            if (line) frag.appendChild(document.createTextNode(line));
          } else {
            const div = document.createElement('div');
            if (line) {
              div.appendChild(document.createTextNode(line));
            } else {
              div.appendChild(document.createElement('br'));
            }
            frag.appendChild(div);
          }
        });
      } else {
        lines.forEach((line, i) => {
          if (i > 0) frag.appendChild(document.createElement('br'));
          if (line || i === 0) frag.appendChild(document.createTextNode(line));
        });
      }
    }

    const lastNode = frag.lastChild;
    range.insertNode(frag);
    if (lastNode) {
      const afterRange = document.createRange();
      afterRange.setStartAfter(lastNode);
      afterRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(afterRange);
    }

    handleInput();
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={`editable-text ${className}`}
      style={style}
      data-placeholder={placeholder}
    />
  );
};
