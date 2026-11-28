import React from 'react';
import { Button, Slider, Tooltip, tokens } from '@fluentui/react-components';
import {
  ZoomInRegular,
  ZoomOutRegular,
  ArrowMaximizeRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  PanelTopContractRegular,
  PanelTopExpandRegular,
  DocumentRegular,
  EyeRegular,
  EyeOffRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { MIN_ZOOM, MAX_ZOOM } from '../../../utils/documentMetrics';
import { RibbonGroup, RibbonActionButton } from '../RibbonGroup';

interface ViewTabProps {
  isRibbonCollapsed: boolean;
  setIsRibbonCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({
  isRibbonCollapsed,
  setIsRibbonCollapsed,
}) => {
  const {
    resumeData,
    setZoom,
    isDarkMode,
    toggleDarkMode,
    isPrintPreview,
    setIsPrintPreview,
  } = useResume();
  const currentZoom = resumeData.meta.zoom || 1;

  const handleAdjust = (delta: number) => {
    setZoom((prev) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((prev + delta) * 100) / 100))
    );
  };

  const handleAutoFit = () => {
    const w = window.innerWidth;
    const sidePadding = w < 640 ? 20 : w < 1024 ? 48 : 72;
    const availableWidth = Math.max(240, w - sidePadding);
    const resumeWidth = 794;
    const fitScale = Math.max(
      MIN_ZOOM,
      Math.min(1.2, Math.round((availableWidth / resumeWidth) * 100) / 100)
    );
    setZoom(fitScale);
  };

  const handleReset100 = () => {
    setZoom(1.0);
  };

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Zoom Group */}
      <RibbonGroup label="Zoom">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: tokens.colorNeutralBackground2,
              border: `1px solid ${tokens.colorNeutralStroke2}`,
            }}
          >
            <Tooltip content="Zoom out" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                aria-label="Zoom out"
                icon={<ZoomOutRegular />}
                onClick={() => handleAdjust(-0.05)}
              />
            </Tooltip>

            <div className="w-24 sm:w-28 flex items-center">
              <Slider
                aria-label="Document zoom"
                size="small"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05}
                value={currentZoom}
                onChange={(_, data) => setZoom(data.value)}
                style={{ width: '100%', minWidth: 96 }}
              />
            </div>

            <Tooltip content="Zoom in" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                aria-label="Zoom in"
                icon={<ZoomInRegular />}
                onClick={() => handleAdjust(0.05)}
              />
            </Tooltip>

            <span
              className="text-xs font-mono w-10 text-center tabular-nums"
              style={{ color: tokens.colorNeutralForeground1 }}
            >
              {Math.round(currentZoom * 100)}%
            </span>
          </div>

          <Button
            appearance="outline"
            size="small"
            icon={<ArrowMaximizeRegular />}
            onClick={handleAutoFit}
            title="Fit page width to window"
          >
            Fit width
          </Button>

          <Button
            appearance="outline"
            size="small"
            onClick={handleReset100}
            title="Reset zoom to 100%"
          >
            100%
          </Button>
        </div>
      </RibbonGroup>

      {/* Page Spec Info & Clean Print Preview */}
      <RibbonGroup label="Page view">
        <div className="flex items-center gap-2">
          <RibbonActionButton
            icon={isPrintPreview ? <EyeOffRegular /> : <EyeRegular />}
            label={isPrintPreview ? 'Exit preview' : 'Print preview'}
            appearance={isPrintPreview ? 'primary' : 'subtle'}
            onClick={() => setIsPrintPreview((prev) => !prev)}
            title="Hide editing buttons and preview exact PDF appearance (Esc to exit)"
          />
          <div
            className="h-13.5 px-3 flex flex-col justify-center rounded"
            style={{
              backgroundColor: tokens.colorNeutralBackground2,
              border: `1px solid ${tokens.colorNeutralStroke2}`,
            }}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: tokens.colorNeutralForeground1 }}
            >
              <DocumentRegular fontSize={14} />
              <span>A4 Print Layout</span>
            </div>
            <span
              className="text-[11px] mt-0.5"
              style={{ color: tokens.colorNeutralForeground3 }}
            >
              210 mm &times; 297 mm
            </span>
          </div>
        </div>
      </RibbonGroup>

      {/* Window Group */}
      <RibbonGroup label="Window" showDivider={false}>
        <RibbonActionButton
          icon={isDarkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
          label={isDarkMode ? 'Light theme' : 'Dark theme'}
          onClick={toggleDarkMode}
          title="Switch UI light or dark theme"
        />
        <RibbonActionButton
          icon={isRibbonCollapsed ? <PanelTopExpandRegular /> : <PanelTopContractRegular />}
          label={isRibbonCollapsed ? 'Show ribbon' : 'Collapse'}
          onClick={() => setIsRibbonCollapsed((prev) => !prev)}
          title="Toggle ribbon collapse"
        />
      </RibbonGroup>
    </div>
  );
};
