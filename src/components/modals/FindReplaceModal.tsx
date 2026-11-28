import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  Checkbox,
  Badge,
  tokens,
} from '@fluentui/react-components';
import { SearchRegular, EditRegular, DismissRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import {
  TextSectionData,
  ListSectionData,
  TableSectionData,
  EntriesSectionData,
  KeyValueSectionData,
} from '../../types/resume';

export const FindReplaceModal: React.FC = () => {
  const {
    isFindReplaceModalOpen,
    setIsFindReplaceModalOpen,
    resumeData,
    findAndReplaceAll,
    showToast,
  } = useResume();

  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  useEffect(() => {
    if (!isFindReplaceModalOpen) {
      setSearchQuery('');
      setReplaceQuery('');
    }
  }, [isFindReplaceModalOpen]);

  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    try {
      const flags = matchCase ? 'g' : 'gi';
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, flags);

      let total = 0;
      const countIn = (str?: string) => {
        if (!str) return;
        const matches = str.match(regex);
        if (matches) total += matches.length;
      };

      countIn(resumeData.header.fullName);
      countIn(resumeData.header.degreeTitle);
      countIn(resumeData.header.universityCompany);
      countIn(resumeData.header.email);
      countIn(resumeData.header.phone);
      countIn(resumeData.header.location);
      resumeData.header.links.forEach((l) => {
        countIn(l.text);
        countIn(l.url);
      });

      resumeData.sections.forEach((sec) => {
        countIn(sec.title);
        if (sec.type === 'text') {
          countIn((sec as TextSectionData).content);
        } else if (sec.type === 'list') {
          (sec as ListSectionData).items.forEach((item) => countIn(item));
        } else if (sec.type === 'table') {
          const t = sec as TableSectionData;
          t.headers?.forEach((h) => countIn(h));
          t.rows.forEach((row) => row.forEach((cell) => countIn(cell)));
        } else if (sec.type === 'entries') {
          (sec as EntriesSectionData).entries.forEach((e) => {
            countIn(e.heading);
            countIn(e.subheading);
            countIn(e.dateRange);
            countIn(e.location);
            e.bullets.forEach((b) => countIn(b));
          });
        } else if (sec.type === 'keyvalue') {
          (sec as KeyValueSectionData).pairs.forEach((p) => {
            countIn(p.label);
            countIn(p.value);
          });
        }
      });

      countIn(resumeData.declaration.text);
      countIn(resumeData.declaration.date);
      countIn(resumeData.declaration.place);

      return total;
    } catch {
      return 0;
    }
  }, [searchQuery, matchCase, resumeData]);

  const handleReplaceAll = () => {
    if (!searchQuery.trim()) return;
    const replaced = findAndReplaceAll(searchQuery, replaceQuery, matchCase);
    if (replaced > 0) {
      showToast(`Replaced ${replaced} occurrence${replaced === 1 ? '' : 's'}`);
      setIsFindReplaceModalOpen(false);
    } else {
      showToast('No matching text found');
    }
  };

  return (
    <Dialog
      open={isFindReplaceModalOpen}
      onOpenChange={(_, data) => setIsFindReplaceModalOpen(data.open)}
    >
      <DialogSurface style={{ maxWidth: 'min(440px, calc(100vw - 24px))', width: '100%', maxHeight: '90dvh', overflowY: 'auto' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsFindReplaceModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <SearchRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Find and replace</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              <Field
                label={
                  <span className="flex items-center justify-between w-full">
                    <span>Find</span>
                    {searchQuery.trim() && (
                      <Badge appearance="tint" color="brand" size="small">
                        {matchCount} match{matchCount === 1 ? '' : 'es'}
                      </Badge>
                    )}
                  </span>
                }
              >
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(_, data) => setSearchQuery(data.value)}
                  placeholder="Text to find"
                />
              </Field>

              <Field label="Replace with">
                <Input
                  value={replaceQuery}
                  onChange={(_, data) => setReplaceQuery(data.value)}
                  placeholder="Replacement text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim() && matchCount > 0) {
                      handleReplaceAll();
                    }
                  }}
                />
              </Field>

              <Checkbox
                label="Match case"
                checked={matchCase}
                onChange={(_, data) => setMatchCase(!!data.checked)}
              />
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsFindReplaceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              icon={<EditRegular />}
              onClick={handleReplaceAll}
              disabled={!searchQuery.trim() || matchCount === 0}
              style={{ whiteSpace: 'nowrap' }}
            >
              Replace all ({matchCount})
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
