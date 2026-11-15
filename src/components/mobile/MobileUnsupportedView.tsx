import React from 'react';
import { Monitor, Smartphone, ArrowRight, FileText } from 'lucide-react';

interface MobileUnsupportedViewProps {
  onDismiss?: () => void;
}

export const MobileUnsupportedView: React.FC<MobileUnsupportedViewProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-(--ui-bg) text-(--ui-text) no-print sm:hidden">
      <div className="w-full max-w-sm flex flex-col items-center p-6 rounded-2xl bg-(--ui-surface) border border-(--ui-border) shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* App Logo & Device Illustration */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0f6cbd]/10 dark:bg-[#2886de]/20 flex items-center justify-center text-[#0f6cbd] dark:text-[#2886de] shadow-inner">
            <Monitor className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-(--ui-surface)">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Primary Notification Text */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Desktop &amp; Tablet Supported
          </span>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            This website is not supported in mobile
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            PlacementResume is a full-featured resume word-processor with ribbon navigation. Please open this website on a <strong>tablet</strong>, <strong>laptop</strong>, or <strong>desktop computer</strong> for the best editing experience.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="w-full bg-(--ui-surface2) rounded-xl p-3 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-3.5 h-3.5 text-[#0f6cbd] dark:text-[#2886de] shrink-0" />
            <span>Full Microsoft Word-style Ribbon Toolbar</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="w-3.5 h-3.5 text-[#0f6cbd] dark:text-[#2886de] shrink-0" />
            <span>Supported on Tablets, Laptops &amp; Desktops</span>
          </div>
        </div>

        {/* Secondary Action: Allow Bypass if requested */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 px-3 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 cursor-pointer rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <span>Preview in mobile view anyway</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
