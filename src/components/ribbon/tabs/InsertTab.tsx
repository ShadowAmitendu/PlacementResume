import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Switch } from '../../ui/switch';
import {
  FileText,
  Table as TableIcon,
  List,
  Minus,
  Crop,
  PenTool,
  Link as LinkIcon,
} from 'lucide-react';

export const InsertTab: React.FC = () => {
  const {
    resumeData,
    addSection,
    updateMeta,
    openCropModal,
    setIsSignatureModalOpen,
    setIsLinkModalOpen,
    setEditingLink,
  } = useResume();

  const showPhoto = resumeData.meta.showPhoto ?? true;
  const showDeclaration = resumeData.meta.showDeclaration;
  const showLinkIcons = resumeData.meta.showLinkIcons;

  const handleOpenAddLink = () => {
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  return (
    <div className="flex items-stretch h-full gap-2 sm:gap-3 py-1 px-2 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Add Sections Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex items-center gap-1.5 my-auto">
          <button
            type="button"
            onClick={() => addSection('text')}
            title="Add text section paragraph"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Text</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('table')}
            title="Add structured table section"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Table</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('list')}
            title="Add bullet / numbered list section"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <List className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">List</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('hr')}
            title="Add horizontal divider rule"
            className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded hover:bg-(--ui-surface2) text-foreground cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Divider</span>
          </button>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Resume Sections
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Photo Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex flex-col gap-1.5 my-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Show Picture</span>
            <Switch
              checked={showPhoto}
              onCheckedChange={(checked) => updateMeta({ showPhoto: checked })}
            />
          </div>

          {showPhoto && (
            <button
              type="button"
              onClick={() => openCropModal(resumeData.meta.photo)}
              title="Crop, rotate, and adjust profile photo"
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
            >
              <Crop className="w-3.5 h-3.5 text-primary" />
              <span>Crop / Adjust</span>
            </button>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Photo
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Signature Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex flex-col gap-1.5 my-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Declaration</span>
            <Switch
              checked={showDeclaration}
              onCheckedChange={(checked) => updateMeta({ showDeclaration: checked })}
            />
          </div>

          {showDeclaration && (
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              title="Upload handwritten signature and vectorize cleanly"
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-(--ui-border) bg-(--ui-surface) hover:bg-(--ui-surface2) text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
            >
              <PenTool className="w-3.5 h-3.5 text-primary" />
              <span>Clean Signature</span>
            </button>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Signature
        </span>
      </div>

      <div className="w-px h-13 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Links Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1">
        <div className="flex flex-col gap-1.5 my-auto">
          <button
            type="button"
            onClick={handleOpenAddLink}
            title="Add portfolio, GitHub, LinkedIn, or social link"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Link Icons</span>
            <Switch
              checked={showLinkIcons}
              onCheckedChange={(checked) => updateMeta({ showLinkIcons: checked })}
            />
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-(--ui-text-dim) font-semibold select-none text-center">
          Links
        </span>
      </div>
    </div>
  );
};
