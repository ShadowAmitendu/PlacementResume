import React, { useRef, useEffect } from 'react';

interface EditableContentProps {
  html: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'span' | 'div' | 'p' | 'h1' | 'th' | 'td' | 'li';
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}

export const EditableContent: React.FC<EditableContentProps> = ({
  html,
  onChange,
  className = '',
  style,
  tagName: Tag = 'span',
  placeholder,
  onKeyDown,
  children,
}) => {
  const ref = useRef<HTMLElement>(null);
  const lastHtmlRef = useRef(html);

  // Initialize innerHTML on mount
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = html;
      lastHtmlRef.current = html;
    }
  }, []);

  // Update DOM ONLY when the value was changed externally (e.g. Undo, Redo, File Import)
  useEffect(() => {
    if (ref.current && html !== lastHtmlRef.current) {
      ref.current.innerHTML = html;
      lastHtmlRef.current = html;
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
    >
      {children}
    </Tag>
  );
};
