import React from 'react';
import { ExternalLink } from 'lucide-react';

interface PickerFooterProps {
  onOpenManager: () => void;
}

export const PickerFooter: React.FC<PickerFooterProps> = ({ onOpenManager }) => {
  return (
    <footer className="h-8 border-t border-[#2c2e33] px-3 flex items-center justify-between text-[11px] text-gray-500 bg-[#141517] select-none">
      <div className="flex items-center space-x-2 text-[10px]">
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[9px]">↑↓←→</kbd>
          <span>Move</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[9px]">↵</kbd>
          <span>Paste</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[9px]">⇧↵</kbd>
          <span>Copy</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[9px]">^S</kbd>
          <span>Star</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[9px]">Esc</kbd>
          <span>Hide</span>
        </span>
      </div>
      <button
        onClick={onOpenManager}
        title="Open full Sticker Database Manager"
        className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors ml-2"
      >
        <span>Manager</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </footer>
  );
};
