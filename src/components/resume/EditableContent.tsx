import React, { useRef, useLayoutEffect } from 'react';
import { sanitizeRichTextHtml } from '../../utils/sanitize';

interface EditableContentProps {
  html: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'li';
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  transformOnBlur?: (value: string) => string;
}

export const EditableContent: React.FC<EditableContentProps> = ({
  html,
  onChange,
  className = '',
  style,
  tagName: Tag = 'span',
  placeholder,
  onKeyDown,
  transformOnBlur,
}) => {
  const ref = useRef<HTMLElement>(null);
  const lastHtmlRef = useRef(html);

  // Initialize innerHTML synchronously before paint
  useLayoutEffect(() => {
    if (ref.current) {
      const cleanHtml = sanitizeRichTextHtml(html);
      ref.current.innerHTML = cleanHtml;
      lastHtmlRef.current = cleanHtml;
    }
  }, []);

  // Update DOM ONLY when the value was changed externally (e.g. Undo, Redo, File Import)
  useLayoutEffect(() => {
    if (ref.current && html !== lastHtmlRef.current) {
      const cleanHtml = sanitizeRichTextHtml(html);
      ref.current.innerHTML = cleanHtml;
      lastHtmlRef.current = cleanHtml;
    }
  }, [html]);

  const handleInput = () => {
    if (!ref.current) return;
    let currentHtml = ref.current.innerHTML;

    // Clean up empty browser artifacts so :empty:before placeholder activates
    if (currentHtml === '<br>' || currentHtml === '<div><br></div>' || currentHtml.trim() === '') {
      currentHtml = '';
      ref.current.innerHTML = '';
    }

    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  const handleBlur = () => {
    if (!ref.current) return;
    let currentHtml = ref.current.innerHTML;
    if (currentHtml === '<br>' || currentHtml === '<div><br></div>' || currentHtml.trim() === '') {
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
    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const lines = text.split(/\r?\n/);
    const frag = document.createDocumentFragment();
    lines.forEach((line, i) => {
      if (i > 0) frag.appendChild(document.createElement('br'));
      frag.appendChild(document.createTextNode(line));
    });

    const lastNode = frag.lastChild;
    range.insertNode(frag);
    if (lastNode) {
      const afterRange = document.createRange();
      afterRange.setStartAfter(lastNode);
      afterRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(afterRange);
    }

    if (ref.current) {
      lastHtmlRef.current = ref.current.innerHTML;
      onChange(ref.current.innerHTML);
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      onPaste={handlePaste}
      className={`editable-text ${className}`}
      style={style}
      data-placeholder={placeholder}
    />
  );
};
