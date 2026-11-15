import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { THEMES } from '../../constants/themes';

export const ThemePicker: React.FC = () => {
  const { resumeData, setTheme } = useResume();
  const currentTheme = resumeData.meta.theme;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block">
        Color Theme
      </span>
      <div className="flex flex-wrap gap-2">
        {Object.values(THEMES).map((theme) => {
          const isActive = currentTheme === theme.name;
          return (
            <button
              key={theme.name}
              type="button"
              onClick={() => setTheme(theme.name)}
              title={theme.label}
              aria-label={theme.label}
              style={{ backgroundColor: theme.color }}
              className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${
                isActive
                  ? 'border-neutral-800 dark:border-white shadow-sm ring-2 ring-black/20 dark:ring-white/30 scale-105'
                  : 'border-transparent hover:opacity-90'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
