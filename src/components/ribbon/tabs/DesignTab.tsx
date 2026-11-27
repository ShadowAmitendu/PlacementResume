import React from 'react';
import {
  Dropdown,
  Option,
  OptionGroup,
  SwatchPicker,
  ColorSwatch,
  Tooltip,
  Label,
  tokens,
} from '@fluentui/react-components';
import { TextBulletListLtrRegular, TextFontRegular } from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { THEMES, SECTION_MARKERS, FONT_OPTIONS } from '../../../constants/themes';
import { RibbonGroup } from '../RibbonGroup';

export const DesignTab: React.FC = () => {
  const { resumeData, setTheme, setMarker, setFont } = useResume();
  const currentTheme = resumeData.meta.theme;
  const currentMarker = resumeData.meta.marker;
  const currentFont = resumeData.meta.font;

  const selectedMarkerLabel =
    SECTION_MARKERS.find((m) => m.value === currentMarker)?.label || 'Marker';
  const selectedFontLabel =
    FONT_OPTIONS.flatMap((g) => g.options).find((o) => o.value === currentFont)?.label ||
    'Document Font';

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Document Color Themes */}
      <RibbonGroup label="Accent theme">
        <SwatchPicker
          aria-label="Document accent color theme"
          size="small"
          shape="circular"
          spacing="small"
          selectedValue={currentTheme}
          onSelectionChange={(_, data) => {
            if (data.selectedValue) setTheme(data.selectedValue);
          }}
        >
          {Object.values(THEMES).map((theme) => (
            <Tooltip key={theme.name} content={theme.label} relationship="label">
              <ColorSwatch
                value={theme.name}
                color={theme.color}
                aria-label={theme.label}
              />
            </Tooltip>
          ))}
        </SwatchPicker>
      </RibbonGroup>

      {/* Section Marker Bullets */}
      <RibbonGroup label="Headings">
        <div className="flex flex-col gap-1">
          <Label
            size="small"
            className="flex items-center gap-1"
            style={{ color: tokens.colorNeutralForeground2, fontSize: 11 }}
          >
            <TextBulletListLtrRegular fontSize={13} />
            <span>Section marker</span>
          </Label>
          <Dropdown
            aria-label="Section heading marker"
            size="small"
            value={selectedMarkerLabel}
            selectedOptions={[currentMarker]}
            onOptionSelect={(_, data) => {
              if (data.optionValue !== undefined) setMarker(data.optionValue);
            }}
            style={{ minWidth: 145 }}
          >
            {SECTION_MARKERS.map((m) => (
              <Option key={m.value || 'none'} value={m.value}>
                {m.label}
              </Option>
            ))}
          </Dropdown>
        </div>
      </RibbonGroup>

      {/* Base Font Family */}
      <RibbonGroup label="Typography" showDivider={false}>
        <div className="flex flex-col gap-1">
          <Label
            size="small"
            className="flex items-center gap-1"
            style={{ color: tokens.colorNeutralForeground2, fontSize: 11 }}
          >
            <TextFontRegular fontSize={13} />
            <span>Document font</span>
          </Label>
          <Dropdown
            aria-label="Document base font"
            size="small"
            value={selectedFontLabel}
            selectedOptions={[currentFont]}
            onOptionSelect={(_, data) => {
              if (data.optionValue) setFont(data.optionValue);
            }}
            style={{ minWidth: 185 }}
          >
            {FONT_OPTIONS.map((group) => (
              <OptionGroup key={group.group} label={group.group}>
                {group.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </OptionGroup>
            ))}
          </Dropdown>
        </div>
      </RibbonGroup>
    </div>
  );
};
