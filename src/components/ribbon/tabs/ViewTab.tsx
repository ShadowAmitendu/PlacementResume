import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Slider } from '../../ui/slider';
import { ZoomIn, ZoomOut, Maximize2, Moon, Sun } from 'lucide-react';

interface ViewTabProps {
  isRibbonCollapsed: boolean;
  setIsRibbonCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({ isRibbonCollapsed, setIsRibbonCollapsed }) => {
  const { resumeData, setZoom, isDarkMode, toggleDarkMode } = useResume();
  const currentZoom = resumeData.meta.zoom || 1;

  const handleAdjust = (delta: number) => {
    const next = Math.min(1.5, Math.max(0.4, Math.round((currentZoom + delta) * 100) / 100));
    setZoom(next);
  };

  const handleAutoFit = () => {
    const availableWidth = window.innerWidth - 32;
    const resumeWidth = 794; // A4 width at 96 DPI in px
    const fitScale = Math.max(0.4, Math.min(1.2, Math.round((availableWidth / resumeWidth) * 100) / 100));
    setZoom(fitScale);
  };

  return (
    <div className="flex items-stretch h-full gap-2 sm:gap-3 py-1 px-2 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Zoom Controls Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-2 my-auto">
          <button
            type="button"
            onClick={() => handleAdjust(-0.05)}
            title="Zoom out"
            className="w-7 h-7 flex items-center justify-center rounded border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-foreground cursor-pointer shadow-2xs"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-24 sm:w-28">
            <Slider
              value={[currentZoom]}
              min={0.4}
              max={1.5}
              step={0.05}
              onValueChange={([val]) => setZoom(val)}
            />
          </div>

          <button
            type="button"
            onClick={() => handleAdjust(0.05)}
            title="Zoom in"
            className="w-7 h-7 flex items-center justify-center rounded border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-foreground cursor-pointer shadow-2xs"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleAutoFit}
            title="Auto-fit page to window width"
            className="flex items-center gap-1 px-2 py-1 rounded border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-xs font-semibold text-foreground cursor-pointer shadow-2xs"
          >
            <Maximize2 className="w-3 h-3 text-primary" />
            <span>Fit</span>
          </button>

          <span className="text-xs font-mono font-semibold text-foreground w-11 text-right">
            {Math.round(currentZoom * 100)}%
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Zoom
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Appearance & Window Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-2 my-auto">
          <button
            type="button"
            onClick={toggleDarkMode}
            title="Toggle Dark / Light Mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRibbonCollapsed((prev) => !prev)}
            title="Collapse or pin the ribbon menu"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            <span>{isRibbonCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon'}</span>
          </button>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Window
        </span>
      </div>
    </div>
  );
};
