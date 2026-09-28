import React from 'react';
import { Key, Check, AlertCircle } from 'lucide-react';

interface GeminiAiCardProps {
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  model: string;
  onChangeModel: (model: string) => void;
  onTestKey: () => void;
  testStatus: { testing: boolean; valid?: boolean; message?: string };
}

export const GeminiAiCard: React.FC<GeminiAiCardProps> = ({
  apiKey,
  onChangeApiKey,
  model,
  onChangeModel,
  onTestKey,
  testStatus,
}) => {
  return (
    <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-gray-200 font-medium flex items-center space-x-1.5">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Google Gemini AI (Optional)</span>
        </label>
        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
          Offline Local Mode Always Active
        </span>
      </div>
      <p className="text-[10px] text-gray-400 leading-normal">
        Importing, multi-tier resizing, and manual tagging work 100% offline without an API key. Gemini enables automated vision character/feeling extraction.
      </p>

      {/* Model Selector */}
      <div>
        <label className="text-gray-400 block mb-1">Gemini Vision Model</label>
        <select
          value={model}
          onChange={(e) => onChangeModel(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-500"
        >
          <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended by Google)</option>
          <option value="gemini-2.0-flash">gemini-2.0-flash (Fast &amp; Multimodal)</option>
          <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
          <option value="gemini-1.5-pro">gemini-1.5-pro (High Precision)</option>
        </select>
      </div>

      {/* API Key Input */}
      <div>
        <label className="text-gray-400 block mb-1">API Key</label>
        <div className="flex space-x-2">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => onChangeApiKey(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={onTestKey}
            disabled={testStatus.testing || !apiKey}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-medium border border-amber-500/30 transition-colors disabled:opacity-50 shrink-0"
          >
            {testStatus.testing ? 'Testing...' : 'Test Key'}
          </button>
        </div>
        {testStatus.valid !== undefined && (
          <div className={`flex items-center space-x-1.5 mt-1.5 text-[11px] ${testStatus.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
            {testStatus.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{testStatus.valid ? 'API Key and model validated successfully!' : testStatus.message || 'Validation failed'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
