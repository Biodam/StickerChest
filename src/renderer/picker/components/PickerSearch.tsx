import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface PickerSearchProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const PickerSearch = forwardRef<HTMLInputElement, PickerSearchProps>(
  ({ value, onChange, onClear }, ref) => {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

    useEffect(() => {
      localRef.current?.focus();
    }, []);

    return (
      <div className="p-3 border-b border-[#2c2e33] flex items-center select-none">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={localRef}
            type="text"
            placeholder="Search stickers by character, feeling... (Esc to clear)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-[#25262b] border border-[#2c2e33] rounded-xl text-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {value && (
            <button
              onClick={onClear}
              title="Clear search (Esc)"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

PickerSearch.displayName = 'PickerSearch';
