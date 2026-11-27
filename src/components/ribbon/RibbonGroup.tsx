import React from 'react';
import { Button, Divider, Tooltip, tokens } from '@fluentui/react-components';

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

/**
 * Standard Microsoft Word ribbon command group with centered controls,
 * subtle bottom group caption, and optional vertical divider.
 */
export const RibbonGroup: React.FC<RibbonGroupProps> = ({
  label,
  children,
  showDivider = true,
}) => {
  return (
    <>
      <div className="flex flex-col items-center justify-between shrink-0 h-full px-1.5 py-0.5">
        <div className="flex items-center gap-1 my-auto">{children}</div>
        <span
          className="text-[10px] leading-none select-none tracking-tight pb-0.5"
          style={{ color: tokens.colorNeutralForeground3 }}
        >
          {label}
        </span>
      </div>
      {showDivider && (
        <Divider
          vertical
          style={{
            height: 52,
            alignSelf: 'center',
            flexGrow: 0,
            margin: '0 2px',
          }}
        />
      )}
    </>
  );
};

interface RibbonActionButtonProps {
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  appearance?: 'subtle' | 'primary' | 'outline';
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  dangerHover?: boolean;
}

/**
 * Monochrome vertical stacked command button matching Microsoft Word ribbon sizing.
 */
export const RibbonActionButton: React.FC<RibbonActionButtonProps> = ({
  icon,
  label,
  onClick,
  title,
  disabled = false,
  appearance = 'subtle',
  onMouseDown,
  dangerHover = false,
}) => {
  const btn = (
    <Button
      appearance={appearance}
      size="small"
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        height: 54,
        minWidth: 52,
        padding: '4px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontWeight: 500,
        fontSize: 11,
        lineHeight: 1.15,
        ...(dangerHover
          ? { color: tokens.colorPaletteRedForeground1 }
          : undefined),
      }}
    >
      <span className="flex items-center justify-center text-[18px] leading-none">
        {icon}
      </span>
      <span className="text-[11px] font-normal whitespace-nowrap">{label}</span>
    </Button>
  );

  if (!title) return btn;

  return (
    <Tooltip content={title} relationship="label" positioning="below">
      {btn}
    </Tooltip>
  );
};
