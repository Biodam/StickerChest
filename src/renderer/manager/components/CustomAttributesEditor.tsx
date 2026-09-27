import React, { useState } from 'react';
import { Star, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface CustomAttributesEditorProps {
  attributes: Record<string, string>;
  onChange: (updatedAttributes: Record<string, string>) => void;
}

export const CustomAttributesEditor: React.FC<CustomAttributesEditorProps> = ({
  attributes,
  onChange,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const currentRating = parseInt(attributes['rating'] || '0', 10);
  const isNsfw = attributes['nsfw'] === 'true';

  const handleRatingClick = (starValue: number) => {
    const nextRating = currentRating === starValue ? '0' : String(starValue);
    const updated = { ...attributes };
    if (nextRating === '0') {
      delete updated['rating'];
    } else {
      updated['rating'] = nextRating;
    }
    onChange(updated);
  };

  const handleToggleNsfw = () => {
    const updated = { ...attributes };
    if (isNsfw) {
      delete updated['nsfw'];
    } else {
      updated['nsfw'] = 'true';
    }
    onChange(updated);
  };

  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newKey.trim().toLowerCase();
    const cleanVal = newValue.trim();
    if (!cleanKey) return;

    const updated = { ...attributes, [cleanKey]: cleanVal };
    onChange(updated);
    setNewKey('');
    setNewValue('');
  };

  const handleRemoveAttribute = (keyToRemove: string) => {
    const updated = { ...attributes };
    delete updated[keyToRemove];
    onChange(updated);
  };

  // Filter out system managed custom attributes for key-value list
  const userCustomKeys = Object.keys(attributes).filter(
    (k) => k !== 'rating' && k !== 'nsfw'
  );

  return (
    <div className="space-y-3 pt-2 border-t border-[#2c2e33]">
      {/* 1. Rating & NSFW row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Rating
          </span>
          <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="p-0.5 text-gray-500 hover:text-amber-400 transition-colors"
                title={`${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= currentRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* NSFW Toggle */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Sensitive / NSFW
          </span>
          <button
            type="button"
            onClick={handleToggleNsfw}
            className={`mt-1 flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              isNsfw
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-[#25262b] text-gray-400 border border-[#2c2e33] hover:text-gray-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isNsfw ? 'Sensitive (Blurred)' : 'Standard'}</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Key-Value Attributes */}
      <div>
        <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Custom Attributes
        </span>

        {userCustomKeys.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {userCustomKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between px-2 py-1 bg-[#1a1b1e] border border-[#2c2e33] rounded text-xs"
              >
                <span className="text-gray-400 font-mono text-[11px]">{key}:</span>
                <span className="text-gray-200 truncate mx-2">{attributes[key]}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(key)}
                  className="text-gray-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddAttribute} className="mt-1.5 flex gap-1.5">
          <input
            type="text"
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-1/3 px-2 py-1 bg-[#1a1b1e] border border-[#2c2e33] rounded text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 px-2 py-1 bg-[#1a1b1e] border border-[#2c2e33] rounded text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newKey.trim()}
            className="px-2 py-1 bg-[#25262b] hover:bg-[#2c2e33] border border-[#2c2e33] rounded text-gray-300 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
