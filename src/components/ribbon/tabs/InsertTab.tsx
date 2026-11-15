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
    <div className="flex items-stretch h-full gap-1.5 sm:gap-2.5 py-1 px-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* ── Add Sections Group (Fluent Tall Action Buttons) ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-1 my-auto">
          <button
            type="button"
            onClick={() => addSection('text')}
            title="Add a text paragraph section"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-[#0f6cbd] dark:text-[#2886de] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Text</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('table')}
            title="Add a structured data table"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Table</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('list')}
            title="Add bullet or numbered skills list"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <List className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">List</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('hr')}
            title="Add a horizontal line separator"
            className="fluent-btn w-13 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Divider</span>
          </button>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Sections
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Photo & Media Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-2 my-auto">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Profile Photo</span>
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
                className="fluent-btn flex items-center gap-1.5 px-2 py-1 rounded-md border border-(--ui-border) bg-(--ui-surface) hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Crop / Adjust</span>
              </button>
            )}
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Photo
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Signature Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-2 my-auto">
          <div className="flex flex-col gap-1.5">
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
                className="fluent-btn flex items-center gap-1.5 px-2 py-1 rounded-md border border-(--ui-border) bg-(--ui-surface) hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-primary" />
                <span>Clean Signature</span>
              </button>
            )}
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Signature
        </span>
      </div>

      <div className="w-px h-14 my-auto bg-(--ui-border) shrink-0" />

      {/* ── Links Group ── */}
      <div className="flex flex-col justify-between shrink-0 px-1 py-0.5">
        <div className="flex items-center gap-2 my-auto">
          <button
            type="button"
            onClick={handleOpenAddLink}
            title="Add portfolio, GitHub, LinkedIn, or social link"
            className="fluent-btn w-14 h-14 flex flex-col items-center justify-center p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-[#0f6cbd]/10 dark:bg-[#2886de]/20 text-[#0f6cbd] dark:text-[#2886de] flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">Add Link</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground">Icons</span>
            <Switch
              checked={showLinkIcons}
              onCheckedChange={(checked) => updateMeta({ showLinkIcons: checked })}
            />
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground select-none text-center">
          Links
        </span>
      </div>
    </div>
  );
};
