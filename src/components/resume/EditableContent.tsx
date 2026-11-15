import React, { useRef, useEffect } from 'react';

interface EditableContentProps {
  html: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'span' | 'div' | 'p' | 'h1' | 'th' | 'td' | 'li';
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export const EditableContent: React.FC<EditableContentProps> = ({
  html,
  onChange,
  className = '',
  style,
  tagName: Tag = 'span',
  placeholder,
  onKeyDown,
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
    const currentHtml = ref.current.innerHTML;
    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  const handleBlur = () => {
    if (!ref.current) return;
    const currentHtml = ref.current.innerHTML;
    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      className={`editable-text ${className}`}
      style={style}
      data-placeholder={placeholder}
    />
  );
};
