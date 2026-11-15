import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Slider } from '../../ui/slider';
import { ZoomIn, ZoomOut, Maximize2, Moon, Sun, PanelTopClose, PanelTopOpen, Eye } from 'lucide-react';

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

  const handleReset100 = () => {
    setZoom(1.0);
  };

  return (
    <div className="flex items-stretch h-full gap-1.5 sm:gap-2.5 py-1 px-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Zoom Controls Group (Fluent Style) ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-2 my-auto">
          {/* Zoom Buttons & Slider */}
          <div className="flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.04] p-1 rounded-md border border-(--ui-border)">
            <button
              type="button"
              onClick={() => handleAdjust(-0.05)}
              title="Zoom out"
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-foreground cursor-pointer transition-colors"
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
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-foreground cursor-pointer transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono font-semibold text-foreground w-11 text-center">
              {Math.round(currentZoom * 100)}%
            </span>
          </div>

          {/* Quick Fit Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAutoFit}
              title="Auto-fit page to window width"
              className="h-8 px-2.5 flex items-center gap-1 rounded-md border border-(--ui-border) bg-(--ui-surface) hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-primary" />
              <span>Fit Width</span>
            </button>

            <button
              type="button"
              onClick={handleReset100}
              title="Reset Zoom to 100%"
              className="h-8 px-2.5 flex items-center justify-center rounded-md border border-(--ui-border) bg-(--ui-surface) hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
            >
              <span>100%</span>
            </button>
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Zoom
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Document View Display ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1 my-auto">
          <div className="h-14 px-3 flex flex-col items-center justify-center rounded-md bg-black/[0.02] dark:bg-white/[0.04] border border-(--ui-border)/60 text-foreground">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>A4 Print Layout</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              210mm &times; 297mm
            </span>
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Views
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Appearance & Window Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={toggleDarkMode}
            title="Toggle between Dark and Light Office themes"
            className="w-16 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0f6cbd]" />}
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none text-center">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsRibbonCollapsed((prev) => !prev)}
            title="Collapse or pin the ribbon toolbar"
            className="w-16 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-foreground flex items-center justify-center">
              {isRibbonCollapsed ? <PanelTopOpen className="w-4 h-4" /> : <PanelTopClose className="w-4 h-4" />}
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none text-center">
              {isRibbonCollapsed ? 'Show Ribbon' : 'Collapse'}
            </span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Window
        </span>
      </div>
    </div>
  );
};
