import React from 'react';
import { Button, Dropdown, Option, Switch, Label, tokens } from '@fluentui/react-components';
import {
  RulerRegular,
  TextLineSpacingRegular,
  TableRegular,
  ContractDownLeftRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import {
  MARGIN_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TABLE_STYLES,
} from '../../../constants/themes';
import { RibbonGroup } from '../RibbonGroup';

export const LayoutTab: React.FC = () => {
  const { resumeData, updateMeta, setTableStyle, tightenToOnePage } = useResume();
  const { margin, lineHeight, tableStyle } = resumeData.meta;
  const fitSignatureToPage = resumeData.meta.fitSignatureToPage ?? true;

  const activeMargin = margin || 'normal';
  const activeLineHeight = lineHeight || 'normal';

  const selectedMarginLabel =
    MARGIN_OPTIONS.find((o) => o.value === activeMargin)?.label || 'Normal';
  const selectedLineHeightLabel =
    LINE_HEIGHT_OPTIONS.find((o) => o.value === activeLineHeight)?.label || 'Normal';
  const selectedTableStyleLabel =
    TABLE_STYLES.find((s) => s.value === tableStyle)?.label || 'Standard Grid';

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Page Setup Group */}
      <RibbonGroup label="Page setup">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Label
              size="small"
              className="flex items-center gap-1"
              style={{ color: tokens.colorNeutralForeground2, fontSize: 11 }}
            >
              <RulerRegular fontSize={13} />
              <span>Margins</span>
            </Label>
            <Dropdown
              aria-label="Page margins"
              size="small"
              value={selectedMarginLabel}
              selectedOptions={[activeMargin]}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  updateMeta({
                    margin: data.optionValue as 'compact' | 'normal' | 'moderate' | 'wide',
                  });
                }
              }}
              style={{ minWidth: 136 }}
            >
              {MARGIN_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Dropdown>
          </div>

          <div className="flex flex-col gap-1">
            <Label
              size="small"
              className="flex items-center gap-1"
              style={{ color: tokens.colorNeutralForeground2, fontSize: 11 }}
            >
              <TextLineSpacingRegular fontSize={13} />
              <span>Line spacing</span>
            </Label>
            <Dropdown
              aria-label="Line spacing"
              size="small"
              value={selectedLineHeightLabel}
              selectedOptions={[activeLineHeight]}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  updateMeta({
                    lineHeight: data.optionValue as 'tight' | 'normal' | 'relaxed',
                  });
                }
              }}
              style={{ minWidth: 154 }}
            >
              {LINE_HEIGHT_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
      </RibbonGroup>

      {/* Tables Group */}
      <RibbonGroup label="Tables">
        <div className="flex flex-col gap-1">
          <Label
            size="small"
            className="flex items-center gap-1"
            style={{ color: tokens.colorNeutralForeground2, fontSize: 11 }}
          >
            <TableRegular fontSize={13} />
            <span>Table preset</span>
          </Label>
          <Dropdown
            aria-label="Table style preset"
            size="small"
            value={selectedTableStyleLabel}
            selectedOptions={[tableStyle]}
            onOptionSelect={(_, data) => {
              if (data.optionValue) setTableStyle(data.optionValue);
            }}
            style={{ minWidth: 158 }}
          >
            {TABLE_STYLES.map((st) => (
              <Option key={st.value} value={st.value}>
                {st.label}
              </Option>
            ))}
          </Dropdown>
        </div>
      </RibbonGroup>

      {/* Auto-Fit Group */}
      <RibbonGroup label="Spacing fit" showDivider={false}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span
                className="text-xs font-medium"
                style={{ color: tokens.colorNeutralForeground1 }}
              >
                Fit signature to 1 page
              </span>
              <span
                className="text-[11px]"
                style={{ color: tokens.colorNeutralForeground3 }}
              >
                Tightens spacing when content nears page end
              </span>
            </div>
            <Switch
              aria-label="Fit signature to 1 page"
              checked={fitSignatureToPage}
              onChange={(_, data) => updateMeta({ fitSignatureToPage: data.checked })}
            />
          </div>

          <Button
            appearance="outline"
            size="small"
            icon={<ContractDownLeftRegular />}
            onClick={tightenToOnePage}
            title="Apply compact margins & tight spacing in one click"
          >
            Tighten to 1 page
          </Button>
        </div>
      </RibbonGroup>
    </div>
  );
};
