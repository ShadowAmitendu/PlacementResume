import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { FONT_OPTIONS, TABLE_STYLES, SECTION_MARKERS } from '../../constants/themes';
import { Switch } from '../ui/switch';

export const TypographySettings: React.FC = () => {
  const { resumeData, setFont, setTableStyle, setMarker, updateMeta } = useResume();
  const { font, tableStyle, marker, showDeclaration, showLinkIcons } = resumeData.meta;

  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Font Style
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Table Style
        </label>
        <select
          value={tableStyle}
          onChange={(e) => setTableStyle(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Section Marker
        </label>
        <select
          value={marker}
          onChange={(e) => setMarker(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
      </div>
    </div>
  );
};
