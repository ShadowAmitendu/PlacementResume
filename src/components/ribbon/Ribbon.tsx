import React, { useState } from 'react';
import {
  Button,
  TabList,
  Tab,
  Toolbar,
  ToolbarButton,
  Tooltip,
  tokens,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components';
import {
  DocumentTextFilled,
  SaveRegular,
  ArrowUndoRegular,
  ArrowRedoRegular,
  PrintRegular,
  DocumentPdfRegular,
  SearchRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  ChevronUpRegular,
  ChevronDownRegular,
  CheckmarkCircleRegular,
  ArrowSyncRegular,
  WarningRegular,
  FolderRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { HomeTab } from './tabs/HomeTab';
import { InsertTab } from './tabs/InsertTab';
import { LayoutTab } from './tabs/LayoutTab';
import { DesignTab } from './tabs/DesignTab';
import { FileTab } from './tabs/FileTab';
import { ViewTab } from './tabs/ViewTab';

export type RibbonTabType = 'file' | 'home' | 'insert' | 'layout' | 'design' | 'view';

const MAIN_TABS: Array<{ id: Exclude<RibbonTabType, 'file'>; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' },
  { id: 'layout', label: 'Layout' },
  { id: 'design', label: 'Design' },
  { id: 'view', label: 'View' },
];

export const Ribbon: React.FC = () => {
  const {
    saveToBrowser,
    undo,
    redo,
    canUndo,
    canRedo,
    isDarkMode,
    toggleDarkMode,
    saveStatus,
    setIsPdfAiModalOpen,
    setIsFindReplaceModalOpen,
    profiles,
    activeProfileId,
    setIsResumesModalOpen,
    triggerPrintWithPreflight,
  } = useResume();

  const activeProfileName =
    profiles.find((p) => p.id === activeProfileId)?.name || 'Main Resume';

  const [activeTab, setActiveTab] = useState<RibbonTabType>('home');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleMainTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    const tab = data.value as RibbonTabType;
    setActiveTab(tab);
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleTabToggle = (tab: RibbonTabType) => {
    if (activeTab === tab) {
      setIsCollapsed((prev) => !prev);
    } else {
      setActiveTab(tab);
      if (isCollapsed) {
        setIsCollapsed(false);
      }
    }
  };

  return (
    <header
      className="sticky top-0 left-0 right-0 z-40 select-none no-print shrink-0"
      style={{
        backgroundColor: tokens.colorNeutralBackground2,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
      }}
    >
      {/* Top Word Title Bar & Quick Access Toolbar */}
      <div
        className="h-10 px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 relative"
        style={{
          borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        }}
      >
        <div
          className="flex items-center gap-1 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto scrollbar-none touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0"
              style={{
                backgroundColor: tokens.colorBrandBackground,
                color: tokens.colorNeutralForegroundOnBrand,
              }}
            >
              <DocumentTextFilled fontSize={14} />
            </div>
            <span
              className="hidden min-[440px]:inline font-semibold text-xs sm:text-sm tracking-tight"
              style={{ color: tokens.colorNeutralForeground1 }}
            >
              PlacementResume
            </span>
            <div className="hidden sm:inline-flex">
              <Button
                size="small"
                appearance="subtle"
                icon={<FolderRegular fontSize={12} />}
                onClick={() => setIsResumesModalOpen(true)}
                title="Switch or manage resume versions"
                style={{
                  height: 22,
                  padding: '0 8px',
                  fontSize: 11,
                  fontWeight: 500,
                  backgroundColor: tokens.colorNeutralBackground3,
                  borderRadius: 999,
                }}
              >
                <span className="max-w-28 truncate">{activeProfileName}</span>
              </Button>
            </div>
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[11px] pl-1"
              style={{
                color:
                  saveStatus === 'error'
                    ? tokens.colorPaletteRedForeground1
                    : tokens.colorNeutralForeground3,
              }}
              title={
                saveStatus === 'error'
                  ? 'Browser storage is full or blocked'
                  : saveStatus === 'saving'
                  ? 'Saving changes to browser storage'
                  : 'All changes saved to browser storage'
              }
            >
              {saveStatus === 'error' ? (
                <WarningRegular fontSize={12} />
              ) : saveStatus === 'saving' ? (
                <ArrowSyncRegular fontSize={12} />
              ) : (
                <CheckmarkCircleRegular fontSize={12} />
              )}
              <span>
                {saveStatus === 'error'
                  ? 'Save failed'
                  : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Saved'}
              </span>
            </span>
          </div>

          <Toolbar size="small" aria-label="Quick Access Toolbar">
            <Tooltip content="Save to browser (Ctrl+S)" relationship="label">
              <ToolbarButton
                aria-label="Save"
                icon={<SaveRegular />}
                onClick={saveToBrowser}
              />
            </Tooltip>
            <Tooltip content="Undo (Ctrl+Z)" relationship="label">
              <ToolbarButton
                aria-label="Undo"
                icon={<ArrowUndoRegular />}
                disabled={!canUndo}
                onClick={undo}
              />
            </Tooltip>
            <Tooltip content="Redo (Ctrl+Y)" relationship="label">
              <ToolbarButton
                aria-label="Redo"
                icon={<ArrowRedoRegular />}
                disabled={!canRedo}
                onClick={redo}
              />
            </Tooltip>
            <Tooltip content="Preflight & save PDF (Ctrl+P)" relationship="label">
              <ToolbarButton
                aria-label="Print"
                icon={<PrintRegular />}
                onClick={triggerPrintWithPreflight}
              />
            </Tooltip>
            <Tooltip content="Import resume PDF" relationship="label">
              <ToolbarButton
                aria-label="Import PDF"
                icon={<DocumentPdfRegular />}
                onClick={() => setIsPdfAiModalOpen(true)}
              />
            </Tooltip>
          </Toolbar>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
          <Button
            appearance="outline"
            size="small"
            icon={<SearchRegular />}
            onClick={() => setIsFindReplaceModalOpen(true)}
            title="Find and replace (Ctrl+F)"
            style={{
              width: 260,
              justifyContent: 'space-between',
              backgroundColor: tokens.colorNeutralBackground1,
              color: tokens.colorNeutralForeground3,
              fontWeight: 400,
              fontSize: 12,
            }}
          >
            <span className="flex-1 text-left">Find and replace</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded ml-2"
              style={{
                backgroundColor: tokens.colorNeutralBackground3,
                color: tokens.colorNeutralForeground3,
              }}
            >
              Ctrl+F
            </span>
          </Button>
        </div>

        {/* Right: Appearance & Collapse Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <div className="md:hidden">
            <Tooltip content="Find and replace (Ctrl+F)" relationship="label">
              <ToolbarButton
                aria-label="Find and replace"
                icon={<SearchRegular />}
                onClick={() => setIsFindReplaceModalOpen(true)}
              />
            </Tooltip>
          </div>
          <Tooltip
            content={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            relationship="label"
          >
            <ToolbarButton
              aria-label="Toggle theme"
              icon={isDarkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
              onClick={toggleDarkMode}
            />
          </Tooltip>
          <Tooltip
            content={isCollapsed ? 'Expand ribbon' : 'Collapse ribbon'}
            relationship="label"
          >
            <ToolbarButton
              aria-label={isCollapsed ? 'Expand ribbon' : 'Collapse ribbon'}
              icon={isCollapsed ? <ChevronDownRegular /> : <ChevronUpRegular />}
              onClick={() => setIsCollapsed((prev) => !prev)}
            />
          </Tooltip>
        </div>
      </div>

      {/* Ribbon Tab Navigation Strip */}
      <nav
        aria-label="Ribbon Tabs"
        className="flex items-center px-2 sm:px-4 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap h-9 gap-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Button
          size="small"
          appearance={activeTab === 'file' ? 'primary' : 'subtle'}
          onClick={() => handleTabToggle('file')}
          style={{
            minWidth: 'auto',
            padding: '0 12px',
            height: 26,
            fontWeight: 600,
            fontSize: 12,
            ...(activeTab !== 'file'
              ? { color: tokens.colorBrandForeground1 }
              : undefined),
          }}
        >
          File
        </Button>

        <TabList
          selectedValue={activeTab === 'file' ? '' : activeTab}
          onTabSelect={handleMainTabSelect}
          size="small"
          aria-label="Word Ribbon Tabs"
        >
          {MAIN_TABS.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              onClick={() => {
                if (activeTab === tab.id) {
                  setIsCollapsed((prev) => !prev);
                }
              }}
              style={{ fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400 }}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
      </nav>

      {/* Collapsible Fluent Command Toolbar Body */}
      <div
        className="fluent-ribbon-collapsible overflow-hidden"
        style={{
          maxHeight: isCollapsed ? 0 : 96,
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'auto',
          backgroundColor: tokens.colorNeutralBackground1,
          borderTop: isCollapsed ? 'none' : `1px solid ${tokens.colorNeutralStroke2}`,
        }}
      >
        <div
          key={activeTab}
          className="h-[88px] px-2 sm:px-3 overflow-x-auto scrollbar-none touch-pan-x flex items-center"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
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
      </div>
    </header>
  );
};
