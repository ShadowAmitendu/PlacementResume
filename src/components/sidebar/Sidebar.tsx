import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { HistoryPanel } from './HistoryPanel';
import { ThemePicker } from './ThemePicker';
import { TypographySettings } from './TypographySettings';
import { ZoomPanel } from './ZoomPanel';
import { TextFormatToolbar } from './TextFormatToolbar';
import { AlignmentToolbar } from './AlignmentToolbar';
import { AddSectionPanel } from './AddSectionPanel';
import { StoragePanel } from './StoragePanel';
import { Button } from '../ui/button';
import { X, Moon, Sun } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isDarkMode, toggleDarkMode, isMobileSidebarOpen, setIsMobileSidebarOpen } = useResume();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } no-print`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-foreground">
              Resume Builder
            </h2>
            <p className="text-[11px] text-muted-foreground">Click any field to edit</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          <HistoryPanel />
          <hr className="border-border" />

          <ThemePicker />
          <hr className="border-border" />

          <TypographySettings />
          <hr className="border-border" />

          <ZoomPanel />
          <hr className="border-border" />

          <TextFormatToolbar />
          <hr className="border-border" />

          <AlignmentToolbar />
          <hr className="border-border" />

          <AddSectionPanel />
          <hr className="border-border" />

          <StoragePanel />
          <hr className="border-border" />

          {/* App Theme Toggle */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
              App Interface
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="w-full justify-start text-xs h-9 gap-2"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
