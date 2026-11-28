import React from 'react';
import { AddRegular, DismissRegular, ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { KeyValueSectionData, KeyValueItem } from '../../../types/resume';
import { createUniqueId } from '../../../utils/sanitize';
import { moveArrayItem } from '../../../utils/tableWidths';
import { EditableContent } from '../EditableContent';

interface KeyValueSectionProps {
  section: KeyValueSectionData;
}

export const KeyValueSection: React.FC<KeyValueSectionProps> = ({ section }) => {
  const { updateSection } = useResume();
  const labelPct = section.labelWidthPct ?? 26;

  const updatePairs = (pairs: KeyValueItem[]) => {
    updateSection(section.id, { pairs });
  };

  const updatePairField = (idx: number, field: 'label' | 'value', val: string) => {
    updatePairs(
      section.pairs.map((pair, pIdx) => (pIdx === idx ? { ...pair, [field]: val } : pair))
    );
  };

  const addPair = () => {
    updatePairs([
      ...section.pairs,
      { id: createUniqueId('kv'), label: '[Category]', value: '[Item 1, Item 2, Item 3]' },
    ]);
  };

  const removePair = (idx: number) => {
    if (section.pairs.length <= 1) return;
    updatePairs(section.pairs.filter((_, pIdx) => pIdx !== idx));
  };

  const movePair = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= section.pairs.length) return;
    updatePairs(moveArrayItem(section.pairs, fromIdx, toIdx));
  };

  return (
    <div className="keyvalue-wrapper">
      <div className="keyvalue-grid">
        {section.pairs.map((pair, idx) => (
          <div
            key={pair.id}
            className="keyvalue-row relative"
            style={{ gridTemplateColumns: `minmax(95px, ${labelPct}%) 1fr` }}
          >
            <div className="keyvalue-label-col">
              <EditableContent
                tagName="div"
                singleLine
                html={pair.label}
                onChange={(val) => updatePairField(idx, 'label', val)}
                placeholder="[Category]"
                className="font-bold block w-full"
              />
            </div>

            <div className="keyvalue-value-col relative">
              <EditableContent
                tagName="div"
                html={pair.value}
                onChange={(val) => updatePairField(idx, 'value', val)}
                placeholder="[Skill 1, Skill 2, Skill 3]"
                className="block w-full pr-12"
              />

              <div className="list-remove-btn absolute right-0 top-0.5 flex items-center gap-0.5 no-print">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => movePair(idx, idx - 1)}
                    className="text-neutral-500 hover:text-neutral-900 p-0.5 rounded inline-flex items-center cursor-pointer"
                    title="Move row up"
                  >
                    <ArrowUpRegular fontSize={12} />
                  </button>
                )}
                {idx < section.pairs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => movePair(idx, idx + 1)}
                    className="text-neutral-500 hover:text-neutral-900 p-0.5 rounded inline-flex items-center cursor-pointer"
                    title="Move row down"
                  >
                    <ArrowDownRegular fontSize={12} />
                  </button>
                )}
                {section.pairs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePair(idx)}
                    className="text-neutral-500 hover:text-red-700 p-0.5 rounded inline-flex items-center cursor-pointer"
                    title="Remove row"
                  >
                    <DismissRegular fontSize={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="no-print flex items-center justify-between pt-1 text-xs font-sans">
        <button
          type="button"
          onClick={addPair}
          className="text-neutral-600 hover:text-neutral-950 flex items-center gap-1 font-medium cursor-pointer"
          style={{ fontSize: 11 }}
        >
          <AddRegular fontSize={12} />
          <span>Add skill category</span>
        </button>

        <div className="flex items-center gap-1 text-[10px] text-neutral-500">
          <span>Label width:</span>
          {[22, 26, 32].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => updateSection(section.id, { labelWidthPct: pct })}
              className={`px-1.5 py-0.5 rounded cursor-pointer border ${
                labelPct === pct
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:text-neutral-900'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
