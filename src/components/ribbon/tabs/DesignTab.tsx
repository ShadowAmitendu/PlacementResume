import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { THEMES, SECTION_MARKERS, FONT_OPTIONS } from '../../../constants/themes';
import { Palette, ListFilter, Type } from 'lucide-react';

export const DesignTab: React.FC = () => {
  const { resumeData, setTheme, setMarker, setFont } = useResume();
  const currentTheme = resumeData.meta.theme;
  const currentMarker = resumeData.meta.marker;
  const currentFont = resumeData.meta.font;

  return (
    <div className="flex items-stretch h-full gap-1.5 sm:gap-2.5 py-1 px-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Document Color Theme Swatches ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1.5 my-auto">
          {Object.values(THEMES).map((theme) => {
            const isActive = currentTheme === theme.name;
            return (
              <button
                key={theme.name}
                type="button"
                onClick={() => setTheme(theme.name)}
                title={theme.label}
                aria-label={theme.label}
                style={{ backgroundColor: theme.color }}
                className={`w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-115 border-2 ${isActive
                    ? 'border-foreground shadow-sm ring-2 ring-primary/40 scale-110'
                    : 'border-transparent hover:opacity-90'
                  }`}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none flex items-center justify-center gap-1">
          <Palette className="w-2.5 h-2.5" />
          <span>Color Themes</span>
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Section Marker Bullets ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex flex-col gap-1 my-auto">
          <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-primary" />
            <span>Section Marker</span>
          </label>
          <select
            value={currentMarker}
            onChange={(e) => setMarker(e.target.value)}
            className="h-6.5 text-xs px-2 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none focus:border-primary w-32 shadow-2xs"
          >
            {SECTION_MARKERS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Bullets &amp; Markers
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Base Font Family ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex flex-col gap-1 my-auto">
          <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-primary" />
            <span>Document Font</span>
          </label>
          <select
            value={currentFont}
            onChange={(e) => setFont(e.target.value)}
            className="h-6.5 text-xs px-2 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-text) font-medium cursor-pointer focus:outline-none focus:border-primary w-40 truncate shadow-2xs"
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
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Typography
        </span>
      </div>
    </div>
  );
};
