import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { HomeTab } from './tabs/HomeTab';
import { InsertTab } from './tabs/InsertTab';
import { LayoutTab } from './tabs/LayoutTab';
import { DesignTab } from './tabs/DesignTab';
import { FileTab } from './tabs/FileTab';
import { ViewTab } from './tabs/ViewTab';
import {
  Save,
  Undo2,
  Redo2,
  Printer,
  Sparkles,
  Moon,
  Sun,
  ChevronUp,
  ChevronDown,
  FileText,
} from 'lucide-react';

export type RibbonTabType = 'file' | 'home' | 'insert' | 'layout' | 'design' | 'view';

export const Ribbon: React.FC = () => {
  const {
    saveToBrowser,
    undo,
    redo,
    canUndo,
    canRedo,
    isDarkMode,
    toggleDarkMode,
    setIsPdfAiModalOpen,
  } = useResume();

  const [activeTab, setActiveTab] = useState<RibbonTabType>('home');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleTabClick = (tab: RibbonTabType) => {
    if (activeTab === tab) {
      // Toggle collapse on clicking active tab (Microsoft Word feature)
      setIsCollapsed((prev) => !prev);
    } else {
      setActiveTab(tab);
      if (isCollapsed) {
        setIsCollapsed(false);
      }
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-(--ui-surface) border-b border-(--ui-border) select-none no-print shadow-xs backdrop-blur-md shrink-0">
      {/* ── Top Bar: Word Title & Quick Access Toolbar ── */}
      <div className="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-(--ui-border)/60 bg-(--ui-surface2)/60 text-xs">
        {/* Left: App Logo & Quick Access Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 font-bold text-foreground tracking-wide">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-2xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-bold">PlacementResume</span>
          </div>

          <span className="w-px h-4 bg-(--ui-border)" />

          {/* Quick Access Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={saveToBrowser}
              title="Save to browser (Ctrl+S)"
              className="p-1.5 rounded hover:bg-(--ui-surface3) text-foreground cursor-pointer transition-colors active:scale-90"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-(--ui-surface3) text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-90"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded hover:bg-(--ui-surface3) text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-90"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print / Save PDF (Ctrl+P)"
              className="p-1.5 rounded hover:bg-(--ui-surface3) text-foreground cursor-pointer transition-colors active:scale-90"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPdfAiModalOpen(true)}
              title="AI Resume Parser (PDF)"
              className="p-1.5 rounded hover:bg-(--ui-surface3) text-primary cursor-pointer transition-colors active:scale-90"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Document Title */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-(--ui-text-dim) font-medium">
          <span className="text-foreground font-semibold">Resume Document</span>
          <span>-</span>
          <span>Placement Editor</span>
        </div>

        {/* Right: Quick Settings & Collapse Button */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded hover:bg-(--ui-surface3) text-foreground cursor-pointer transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon'}
            className="p-1.5 rounded hover:bg-(--ui-surface3) text-(--ui-text-dim) hover:text-foreground cursor-pointer transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Ribbon Tabs Navigation Bar ── */}
      <nav aria-label="Ribbon Tabs" className="flex items-center px-2 sm:px-4 bg-(--ui-surface) border-b border-(--ui-border) overflow-x-auto scrollbar-none flex-nowrap">
        {/* File Tab (Special Accent) */}
        <button
          type="button"
          onClick={() => handleTabClick('file')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-t transition-colors cursor-pointer shrink-0 border-b-2 ${
            activeTab === 'file'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'text-primary hover:bg-primary/10 border-transparent font-bold'
          }`}
        >
          File
        </button>

        {/* Standard Word Tabs */}
        {(
          [
            { id: 'home', label: 'Home' },
            { id: 'insert', label: 'Insert' },
            { id: 'layout', label: 'Layout' },
            { id: 'design', label: 'Design' },
            { id: 'view', label: 'View' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-t transition-colors cursor-pointer shrink-0 border-b-2 ${
                isActive
                  ? 'border-primary text-primary font-bold bg-(--ui-surface2)/80'
                  : 'border-transparent text-foreground hover:bg-(--ui-surface2) hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Ribbon Content Panel ── */}
      {!isCollapsed && (
        <div className="h-20 bg-(--ui-surface) px-2 sm:px-3 overflow-x-auto scrollbar-none flex items-center">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'insert' && <InsertTab />}
          {activeTab === 'layout' && <LayoutTab />}
          {activeTab === 'design' && <DesignTab />}
          {activeTab === 'file' && <FileTab />}
          {activeTab === 'view' && (
            <ViewTab
              isRibbonCollapsed={isCollapsed}
              setIsRibbonCollapsed={setIsCollapsed}
            />
          )}
        </div>
      )}
    </header>
  );
};
