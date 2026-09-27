import React from 'react';
import { Send, MessageSquare, Smartphone } from 'lucide-react';
import { ExportPlatform } from '../../../../types/export';

interface StickerPackTabProps {
  platform: ExportPlatform;
  onSelectPlatform: (platform: ExportPlatform) => void;
  scope: 'selected' | 'all';
  onSelectScope: (scope: 'selected' | 'all') => void;
  packTitle: string;
  onChangePackTitle: (title: string) => void;
  totalStickers: number;
  selectedCount: number;
}

export const StickerPackTab: React.FC<StickerPackTabProps> = ({
  platform,
  onSelectPlatform,
  scope,
  onSelectScope,
  packTitle,
  onChangePackTitle,
  totalStickers,
  selectedCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Platform selector */}
      <div>
        <label className="text-gray-300 font-medium block mb-1.5">Target Platform</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectPlatform('telegram')}
            className={`p-2.5 rounded-lg border text-left flex items-start space-x-2 transition-all ${
              platform === 'telegram'
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'bg-[#121316] border-[#2c2e33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <Send className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-xs">Telegram Pack</div>
              <div className="text-[10px] text-gray-500">512×512 WebP &lt;512KB</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform('discord-emoji')}
            className={`p-2.5 rounded-lg border text-left flex items-start space-x-2 transition-all ${
              platform === 'discord-emoji'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-[#121316] border-[#2c2e33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-xs">Discord Emojis</div>
              <div className="text-[10px] text-gray-500">128×128 PNG/GIF &lt;256KB</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform('discord-sticker')}
            className={`p-2.5 rounded-lg border text-left flex items-start space-x-2 transition-all ${
              platform === 'discord-sticker'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-[#121316] border-[#2c2e33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-xs">Discord Stickers</div>
              <div className="text-[10px] text-gray-500">320×320 PNG &lt;500KB</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform('whatsapp')}
            className={`p-2.5 rounded-lg border text-left flex items-start space-x-2 transition-all ${
              platform === 'whatsapp'
                ? 'bg-emerald-600/20 border-emerald-500 text-white'
                : 'bg-[#121316] border-[#2c2e33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-xs">WhatsApp Bundle</div>
              <div className="text-[10px] text-gray-500">512×512 WebP &lt;100KB</div>
            </div>
          </button>
        </div>
      </div>

      {/* Scope & metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-300 font-medium block mb-1">Export Scope</label>
          <select
            value={scope}
            onChange={(e) => onSelectScope(e.target.value as 'selected' | 'all')}
            className="w-full px-2.5 py-1.5 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none"
          >
            {selectedCount > 0 && (
              <option value="selected">Selected Stickers ({selectedCount})</option>
            )}
            <option value="all">All Library Stickers ({totalStickers})</option>
          </select>
        </div>

        <div>
          <label className="text-gray-300 font-medium block mb-1">Pack Title</label>
          <input
            type="text"
            value={packTitle}
            onChange={(e) => onChangePackTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
