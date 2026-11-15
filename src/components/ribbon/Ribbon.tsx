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
  Search,
  CheckCircle2,
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
    setIsFindReplaceModalOpen,
  } = useResume();

  const [activeTab, setActiveTab] = useState<RibbonTabType>('home');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleTabClick = (tab: RibbonTabType) => {
    if (activeTab === tab) {
      // Toggle collapse on clicking active tab (Microsoft Office Ribbon behavior)
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
      {/* ── Top Mica / Fluent Title Bar ── */}
      <div className="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-(--ui-border)/60 bg-black/[0.02] dark:bg-white/[0.02]">
        {/* Left: Fluent App Icon, Title & Quick Access Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-md bg-[#0f6cbd] dark:bg-[#2886de] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm text-foreground tracking-tight">
                PlacementResume
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                <span>Saved</span>
              </span>
            </div>
          </div>

          <span className="w-px h-4 bg-(--ui-border) mx-0.5" />

          {/* Quick Access Toolbar */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={saveToBrowser}
              title="Save to browser (Ctrl+S)"
              className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-colors active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground disabled:opacity-30 cursor-pointer transition-colors active:scale-95"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print / Save PDF (Ctrl+P)"
              className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-foreground cursor-pointer transition-colors active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPdfAiModalOpen(true)}
              title="AI Resume Parser (PDF)"
              className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:bg-black/[0.08] dark:active:bg-white/[0.12] text-[#0f6cbd] dark:text-[#2886de] cursor-pointer transition-colors active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Microsoft 365 Tell Me / Search Bar */}
        <div className="hidden md:flex items-center">
          <button
            type="button"
            onClick={() => setIsFindReplaceModalOpen(true)}
            className="w-64 lg:w-76 h-7 px-2.5 rounded-md bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border border-(--ui-border) flex items-center justify-between text-xs text-muted-foreground transition-all cursor-pointer shadow-2xs"
            title="Search and Replace across document (Ctrl+F)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Search, replace, or commands</span>
            </div>
            <kbd className="text-[10px] bg-black/[0.06] dark:bg-white/[0.1] px-1.5 py-0.2 rounded font-sans text-muted-foreground">
              Ctrl+F
            </kbd>
          </button>
        </div>

        {/* Right: Theme Toggle & Ribbon Collapse */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-foreground cursor-pointer transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#0f6cbd]" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon'}
            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Ribbon Tabs Navigation Bar (Fluent TabList) ── */}
      <nav
        aria-label="Ribbon Tabs"
        className="flex items-center px-2 sm:px-4 bg-(--ui-surface) border-b border-(--ui-border) overflow-x-auto scrollbar-none flex-nowrap h-9 gap-1"
      >
        {/* File Tab Button (Fluent Blue Accent) */}
        <button
          type="button"
          onClick={() => handleTabClick('file')}
          className={`h-7 px-3.5 text-xs font-semibold rounded transition-all cursor-pointer shrink-0 flex items-center justify-center ${
            activeTab === 'file'
              ? 'bg-[#0f6cbd] text-white shadow-xs'
              : 'text-[#0f6cbd] dark:text-[#2886de] hover:bg-primary/10 font-bold'
          }`}
        >
          File
        </button>

        {/* Main Ribbon Tabs */}
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
              className={`relative h-full px-3.5 text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center justify-center rounded-t-sm ${
                isActive
                  ? 'text-[#0f6cbd] dark:text-[#2886de] font-bold'
                  : 'text-foreground/80 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
              }`}
            >
              <span>{tab.label}</span>
              {/* Fluent Active Indicator Underline */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#0f6cbd] dark:bg-[#2886de] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Ribbon Content Panel (Fluent Toolbar Body) ── */}
      {!isCollapsed && (
        <div className="h-[92px] bg-(--ui-surface) px-2 sm:px-3 overflow-x-auto scrollbar-none flex items-center border-b border-(--ui-border)/40">
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
