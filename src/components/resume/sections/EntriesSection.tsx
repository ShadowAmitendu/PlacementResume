import React from 'react';
import {
  AddRegular,
  DismissRegular,
  SparkleRegular,
  ArrowUpRegular,
  ArrowDownRegular,
  BriefcaseRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { EntriesSectionData, EntryItem } from '../../../types/resume';
import { createUniqueId, sanitizeRichTextHtml } from '../../../utils/sanitize';
import { htmlToPlainText } from '../../../utils/documentMetrics';
import { moveArrayItem } from '../../../utils/tableWidths';
import { EditableContent } from '../EditableContent';

interface EntriesSectionProps {
  section: EntriesSectionData;
}

export const EntriesSection: React.FC<EntriesSectionProps> = ({ section }) => {
  const { updateSection, openRewriteModal } = useResume();

  const updateEntries = (nextEntries: EntryItem[]) => {
    updateSection(section.id, { entries: nextEntries });
  };

  const updateEntryField = (
    entryIndex: number,
    field: keyof Omit<EntryItem, 'id' | 'bullets'>,
    value: string
  ) => {
    const next = section.entries.map((entry, idx) =>
      idx === entryIndex ? { ...entry, [field]: value } : entry
    );
    updateEntries(next);
  };

  const updateBullet = (entryIndex: number, bulletIndex: number, value: string) => {
    const next = section.entries.map((entry, idx) => {
      if (idx !== entryIndex) return entry;
      const bullets = [...entry.bullets];
      bullets[bulletIndex] = value;
      return { ...entry, bullets };
    });
    updateEntries(next);
  };

  const addBullet = (entryIndex: number, afterIndex?: number) => {
    const next = section.entries.map((entry, idx) => {
      if (idx !== entryIndex) return entry;
      const bullets = [...entry.bullets];
      const pos = afterIndex !== undefined ? afterIndex + 1 : bullets.length;
      bullets.splice(pos, 0, '[Key contribution or measurable result]');
      return { ...entry, bullets };
    });
    updateEntries(next);
  };

  const removeBullet = (entryIndex: number, bulletIndex: number) => {
    const next = section.entries.map((entry, idx) => {
      if (idx !== entryIndex || entry.bullets.length <= 1) return entry;
      return {
        ...entry,
        bullets: entry.bullets.filter((_, bIdx) => bIdx !== bulletIndex),
      };
    });
    updateEntries(next);
  };

  const addEntry = () => {
    const newEntry: EntryItem = {
      id: createUniqueId('entry'),
      heading: '[Role / Project Title]',
      subheading: '[Organization / Tech Stack]',
      dateRange: '[Month Year – Month Year]',
      location: '[Location / Link]',
      bullets: ['[Describe what you engineered, led, or achieved cleanly]'],
    };
    updateEntries([...section.entries, newEntry]);
  };

  const removeEntry = (entryIndex: number) => {
    if (section.entries.length <= 1) return;
    updateEntries(section.entries.filter((_, idx) => idx !== entryIndex));
  };

  const moveEntry = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= section.entries.length) return;
    updateEntries(moveArrayItem(section.entries, fromIndex, toIndex));
  };

  return (
    <div className="entries-list space-y-2">
      {section.entries.map((entry, entryIdx) => (
        <div key={entry.id} className="entry-block relative group/entry">
          {/* Entry-level hover controls */}
          <div className="entry-controls no-print">
            {entryIdx > 0 && (
              <button
                type="button"
                onClick={() => moveEntry(entryIdx, entryIdx - 1)}
                title="Move entry up"
              >
                <ArrowUpRegular fontSize={12} />
              </button>
            )}
            {entryIdx < section.entries.length - 1 && (
              <button
                type="button"
                onClick={() => moveEntry(entryIdx, entryIdx + 1)}
                title="Move entry down"
              >
                <ArrowDownRegular fontSize={12} />
              </button>
            )}
            {section.entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(entryIdx)}
                title="Remove entry"
                className="del-entry-btn"
              >
                <DismissRegular fontSize={12} />
              </button>
            )}
          </div>

          {/* Line 1: Heading (left) + Date Range (right) */}
          <div className="entry-header">
            <EditableContent
              tagName="div"
              singleLine
              html={entry.heading}
              onChange={(val) => updateEntryField(entryIdx, 'heading', val)}
              placeholder="[Role / Project Title]"
              className="entry-heading font-bold"
            />
            <EditableContent
              tagName="div"
              singleLine
              html={entry.dateRange}
              onChange={(val) => updateEntryField(entryIdx, 'dateRange', val)}
              placeholder="[Duration]"
              className="entry-date shrink-0 text-right"
            />
          </div>

          {/* Line 2: Subheading (left) + Location (right) */}
          <div className="entry-subheader">
            <EditableContent
              tagName="div"
              singleLine
              html={entry.subheading}
              onChange={(val) => updateEntryField(entryIdx, 'subheading', val)}
              placeholder="[Company / Tech Stack]"
              className="entry-subheading italic"
            />
            {entry.location !== undefined && (
              <EditableContent
                tagName="div"
                singleLine
                html={entry.location}
                onChange={(val) => updateEntryField(entryIdx, 'location', val)}
                placeholder="[Location]"
                className="entry-location shrink-0 text-right"
              />
            )}
          </div>

          {/* Bullets */}
          <ul className="skills-list mb-1!">
            {entry.bullets.map((bullet, bIdx) => (
              <li key={bIdx} className="list-row-item relative mb-0.5">
                <EditableContent
                  tagName="div"
                  html={bullet}
                  onChange={(val) => updateBullet(entryIdx, bIdx, val)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBullet(entryIdx, bIdx);
                    } else if (
                      e.key === 'Backspace' &&
                      htmlToPlainText(bullet).trim() === '' &&
                      entry.bullets.length > 1
                    ) {
                      e.preventDefault();
                      removeBullet(entryIdx, bIdx);
                    }
                  }}
                  placeholder="[Bullet point]"
                  className="block w-full pr-12"
                />

                <div className="list-remove-btn absolute right-0 top-0.5 flex items-center gap-0.5 no-print">
                  <button
                    type="button"
                    onClick={() =>
                      openRewriteModal({
                        title: `Rewrite bullet`,
                        initialText: htmlToPlainText(bullet),
                        onApply: (rewritten) =>
                          updateBullet(entryIdx, bIdx, sanitizeRichTextHtml(rewritten)),
                      })
                    }
                    className="text-neutral-500 hover:text-blue-700 p-0.5 rounded inline-flex items-center cursor-pointer"
                    title="Rewrite or tighten bullet"
                  >
                    <SparkleRegular fontSize={12} />
                  </button>
                  {entry.bullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBullet(entryIdx, bIdx)}
                      className="text-neutral-500 hover:text-red-700 p-0.5 rounded inline-flex items-center cursor-pointer"
                      title="Remove bullet"
                    >
                      <DismissRegular fontSize={12} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="pl-5 -mt-0.5 mb-1 no-print flex items-center gap-3 text-xs font-sans">
            <button
              type="button"
              onClick={() => addBullet(entryIdx)}
              className="text-neutral-600 hover:text-neutral-950 flex items-center gap-1 font-medium cursor-pointer"
              style={{ fontSize: 11 }}
            >
              <AddRegular fontSize={11} />
              <span>Add bullet</span>
            </button>
          </div>
        </div>
      ))}

      <div className="no-print flex items-center pt-0.5 font-sans">
        <button
          type="button"
          onClick={addEntry}
          className="text-neutral-600 hover:text-neutral-950 flex items-center gap-1 font-medium cursor-pointer text-[11px]"
        >
          <BriefcaseRegular fontSize={12} />
          <span>Add project / role entry</span>
        </button>
      </div>
    </div>
  );
};
