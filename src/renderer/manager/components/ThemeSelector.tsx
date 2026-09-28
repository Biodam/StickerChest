import React from 'react';
import { Palette, Check } from 'lucide-react';
import { ThemeId } from '../../../types/models';

interface ThemeInfo {
  id: ThemeId;
  name: string;
  description: string;
  colors: { bg: string; surface: string; accent: string };
}

const THEMES: ThemeInfo[] = [
  {
    id: 'slate_dark',
    name: 'Slate Dark',
    description: 'Sleek charcoal with blue accents (Default)',
    colors: { bg: '#121316', surface: '#1a1b1e', accent: '#3b82f6' },
  },
  {
    id: 'oled_black',
    name: 'OLED Black',
    description: 'Pure #000000 AMOLED with neon cyan',
    colors: { bg: '#000000', surface: '#0a0a0a', accent: '#00d2ff' },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Deep violet with neon magenta & cyan',
    colors: { bg: '#0d0221', surface: '#150833', accent: '#f72585' },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    description: 'Soothing pastel lavender & mauve',
    colors: { bg: '#1e1e2e', surface: '#181825', accent: '#cba6f7' },
  },
  {
    id: 'paper_light',
    name: 'Paper Light',
    description: 'High-contrast daylight theme for office environments',
    colors: { bg: '#f4f5f7', surface: '#ffffff', accent: '#2563eb' },
  },
];

interface ThemeSelectorProps {
  activeTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeTheme,
  onSelectTheme,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-gray-200 font-medium block flex items-center space-x-1.5">
        <Palette className="w-3.5 h-3.5 text-blue-400" />
        <span>Application Visual Theme</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {THEMES.map((theme) => {
          const isSelected = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-[#121316] border-[#2c2e33] hover:border-[#373a40]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.bg }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.surface }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.accent }} />
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-gray-200'}`}>
                    {theme.name}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {theme.description}
                </p>
              </div>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
