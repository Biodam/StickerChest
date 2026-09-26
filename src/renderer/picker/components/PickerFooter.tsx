import React from 'react';
import { ExternalLink } from 'lucide-react';

interface PickerFooterProps {
  onOpenManager: () => void;
}

export const PickerFooter: React.FC<PickerFooterProps> = ({ onOpenManager }) => {
  return (
    <footer className="h-8 border-t border-[#2c2e33] px-3 flex items-center justify-between text-[11px] text-gray-500 bg-[#141517] select-none">
      <div className="flex items-center space-x-2">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[10px]">Esc</kbd> to hide</span>
        <span>•</span>
        <span><kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-300 font-mono text-[10px]">↵</kbd> to copy</span>
      </div>
      <button
        onClick={onOpenManager}
        className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
      >
        <span>Manager</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </footer>
  );
};
