import React, { useState, useEffect, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Search, Replace } from 'lucide-react';
import { TextSectionData, ListSectionData, TableSectionData } from '../../types/resume';

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

  // Clear inputs when opened fresh
  useEffect(() => {
    if (!isFindReplaceModalOpen) {
      setSearchQuery('');
      setReplaceQuery('');
    }
  }, [isFindReplaceModalOpen]);

  // Compute live matches count across the document
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

      // Header
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

      // Sections
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
        }
      });

      // Declaration
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
      showToast('No matching text found to replace');
    }
  };

  return (
    <Dialog open={isFindReplaceModalOpen} onOpenChange={setIsFindReplaceModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <DialogTitle>Find & Replace</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Find Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Find
              </label>
              {searchQuery.trim() && (
                <span className="text-[11px] font-medium text-primary">
                  {matchCount} match{matchCount === 1 ? '' : 'es'} found
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Text to find..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Replace Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Replace With
            </label>
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replacement text..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
              />
              <span>Match Case</span>
            </label>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFindReplaceModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleReplaceAll}
            disabled={!searchQuery.trim() || matchCount === 0}
            className="gap-1.5"
          >
            <Replace className="w-3.5 h-3.5" />
            <span>Replace All ({matchCount})</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
