import React from 'react';
import { Clipboard, Film } from 'lucide-react';

interface AutoPasteCardProps {
  autoPaste: boolean;
  onChangeAutoPaste: (val: boolean) => void;
}

export const AutoPasteCard: React.FC<AutoPasteCardProps> = ({ autoPaste, onChangeAutoPaste }) => (
  <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-gray-200 font-medium flex items-center space-x-1.5">
        <Clipboard className="w-3.5 h-3.5 text-blue-400" />
        <span>Quick Picker Auto-Paste</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={autoPaste}
          onChange={(e) => onChangeAutoPaste(e.target.checked)}
          className="rounded border-[#2c2e33] text-blue-600 focus:ring-0 bg-[#121316] w-4 h-4"
        />
        <span className="text-xs text-gray-300 font-medium">Auto-paste on select</span>
      </label>
    </div>
    <p className="text-[10px] text-gray-400 leading-normal">
      When you select a sticker in the floating Quick Picker, Sticker Chest automatically pastes it directly into your active chat or document input field.
    </p>
  </div>
);

interface AnimationCardProps {
  mode: 'always' | 'hover' | 'reduced_motion';
  onChangeMode: (mode: 'always' | 'hover' | 'reduced_motion') => void;
}

export const AnimationCard: React.FC<AnimationCardProps> = ({ mode, onChangeMode }) => (
  <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-gray-200 font-medium flex items-center space-x-1.5">
        <Film className="w-3.5 h-3.5 text-purple-400" />
        <span>Animated Sticker Playback</span>
      </label>
      <select
        value={mode}
        onChange={(e) => onChangeMode(e.target.value as 'always' | 'hover' | 'reduced_motion')}
        className="px-2.5 py-1 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-purple-500"
      >
        <option value="hover">Hover / Focus to Play (Recommended)</option>
        <option value="always">Always Animate (Continuous)</option>
        <option value="reduced_motion">Reduced Motion (Static Preview)</option>
      </select>
    </div>
    <p className="text-[10px] text-gray-400 leading-normal">
      Hover-to-play displays static first-frame thumbnails and animates only when hovered or selected, significantly reducing CPU &amp; GPU compositor load.
    </p>
  </div>
);
