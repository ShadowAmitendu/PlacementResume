import React from 'react';
import { useResume } from '../../context/ResumeContext';
import {
  FONT_OPTIONS,
  TABLE_STYLES,
  SECTION_MARKERS,
  MARGIN_OPTIONS,
  LINE_HEIGHT_OPTIONS,
} from '../../constants/themes';
import { Switch } from '../ui/switch';
import { PenTool } from 'lucide-react';

export const TypographySettings: React.FC = () => {
  const { resumeData, setFont, setTableStyle, setMarker, updateMeta, setIsSignatureModalOpen } = useResume();
  const { font, tableStyle, marker, showDeclaration, showLinkIcons, margin, lineHeight } =
    resumeData.meta;
  const showPhoto = resumeData.meta.showPhoto ?? true;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Document Layout
        </span>
      </div>

      {/* Page Margins */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground block">
          Page Margins
        </label>
        <select
          value={margin || 'normal'}
          onChange={(e) => updateMeta({ margin: e.target.value as any })}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {MARGIN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Line Spacing */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground block">
          Line Spacing
        </label>
        <select
          value={lineHeight || 'normal'}
          onChange={(e) => updateMeta({ lineHeight: e.target.value as any })}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {LINE_HEIGHT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Family */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground block">
          Font Family
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
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
      </div>

      {/* Table Style */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground block">
          Table Style Preset
        </label>
        <select
          value={tableStyle}
          onChange={(e) => setTableStyle(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {TABLE_STYLES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Section Marker */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground block">
          Section Marker
        </label>
        <select
          value={marker}
          onChange={(e) => setMarker(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {SECTION_MARKERS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="pt-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Show Profile Picture</span>
          <Switch
            checked={showPhoto}
            onCheckedChange={(checked) => updateMeta({ showPhoto: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Show Link Icons</span>
          <Switch
            checked={showLinkIcons}
            onCheckedChange={(checked) => updateMeta({ showLinkIcons: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Show Declaration</span>
          <Switch
            checked={showDeclaration}
            onCheckedChange={(checked) => updateMeta({ showDeclaration: checked })}
          />
        </div>

        {/* Signature Action Button */}
        {showDeclaration && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface2)] hover:bg-[var(--ui-surface)] text-xs font-medium text-foreground transition-colors cursor-pointer shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5 text-primary" />
              <span>Clean & Vectorize Signature</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
