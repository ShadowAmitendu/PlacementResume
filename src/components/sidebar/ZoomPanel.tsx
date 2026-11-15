import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const ZoomPanel: React.FC = () => {
  const { resumeData, setZoom } = useResume();
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
          Page Zoom
        </span>
        <button
          type="button"
          onClick={handleAutoFit}
          title="Auto-fit to screen"
          className="text-[10px] font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <Maximize2 className="w-2.5 h-2.5" />
          <span>Fit</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAdjust(-0.05)}
          className="h-8 w-8 p-0"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>

        <div className="flex-1 px-1">
          <Slider
            value={[currentZoom]}
            min={0.4}
            max={1.5}
            step={0.05}
            onValueChange={([val]) => setZoom(val)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAdjust(0.05)}
          className="h-8 w-8 p-0"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>

        <span className="text-xs font-mono font-medium text-muted-foreground w-10 text-right">
          {Math.round(currentZoom * 100)}%
        </span>
      </div>
    </div>
  );
};
