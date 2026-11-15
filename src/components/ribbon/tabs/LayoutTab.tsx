import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import {
  MARGIN_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TABLE_STYLES,
} from '../../../constants/themes';
import { Switch } from '../../ui/switch';
import { Columns3, AlignVerticalSpaceAround, Table2, Sparkles } from 'lucide-react';

export const LayoutTab: React.FC = () => {
  const { resumeData, updateMeta, setTableStyle } = useResume();
  const { margin, lineHeight, tableStyle } = resumeData.meta;
  const fitSignatureToPage = resumeData.meta.fitSignatureToPage ?? true;

  return (
    <div className="flex items-stretch h-full gap-2 sm:gap-3 py-1 px-2 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Page Setup Group (Margins & Spacing) ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-3 my-auto">
          {/* Margins */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-(--ui-text-dim) flex items-center gap-1">
              <Columns3 className="w-3 h-3 text-primary" />
              <span>Margins</span>
            </label>
            <select
              value={margin || 'normal'}
              onChange={(e) => updateMeta({ margin: e.target.value as any })}
              className="h-6.5 text-xs px-2 rounded border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none w-28"
            >
              {MARGIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Line Spacing */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-(--ui-text-dim) flex items-center gap-1">
              <AlignVerticalSpaceAround className="w-3 h-3 text-primary" />
              <span>Line Spacing</span>
            </label>
            <select
              value={lineHeight || 'normal'}
              onChange={(e) => updateMeta({ lineHeight: e.target.value as any })}
              className="h-6.5 text-xs px-2 rounded border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none w-28"
            >
              {LINE_HEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Page Setup
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Tables Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex flex-col gap-0.5 my-auto">
          <label className="text-[10px] font-semibold text-(--ui-text-dim) flex items-center gap-1">
            <Table2 className="w-3 h-3 text-primary" />
            <span>Table Style Preset</span>
          </label>
          <select
            value={tableStyle}
            onChange={(e) => setTableStyle(e.target.value)}
            className="h-6.5 text-xs px-2 rounded border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none w-32"
          >
            {TABLE_STYLES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Tables
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Page Fit Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-2.5 my-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Fit Signature to 1 Page</span>
            </span>
            <span className="text-[10px] text-(--ui-text-dim)">
              Auto-compresses vertical spacing if content overflows
            </span>
          </div>
          <Switch
            checked={fitSignatureToPage}
            onCheckedChange={(checked) => updateMeta({ fitSignatureToPage: checked })}
          />
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Auto-Fit Spacing
        </span>
      </div>
    </div>
  );
};
