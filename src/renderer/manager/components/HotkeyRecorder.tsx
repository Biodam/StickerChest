import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { formatAcceleratorForDisplay, parseKeyboardEventToAccelerator } from '../../shared/accelerator-helper';

interface HotkeyRecorderProps {
  currentHotkey: string;
  onChangeHotkey: (hotkey: string) => void;
}

export const HotkeyRecorder: React.FC<HotkeyRecorderProps> = ({
  currentHotkey,
  onChangeHotkey,
}) => {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
  const defaultHotkey = isMac ? 'Control+/' : 'Super+/';
  const [isRecording, setIsRecording] = useState(false);
  const [candidate, setCandidate] = useState<string>('');
  const [displayLabel, setDisplayLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecording) {
      inputRef.current?.focus();
    }
  }, [isRecording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      setIsRecording(false);
      setCandidate('');
      setError(null);
      return;
    }

    const parsed = parseKeyboardEventToAccelerator(e, isMac);
    setDisplayLabel(parsed.displayLabel);

    if (parsed.isValid && parsed.accelerator) {
      setCandidate(parsed.accelerator);
      setError(null);
      onChangeHotkey(parsed.accelerator);
      setIsRecording(false);
    } else {
      setError(parsed.error || null);
    }
  };

  const handleResetDefault = () => {
    onChangeHotkey(defaultHotkey);
    setIsRecording(false);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-gray-200 font-medium flex items-center space-x-1.5">
          <Keyboard className="w-3.5 h-3.5 text-blue-400" />
          <span>Summon Quick Picker Shortcut</span>
        </label>
        <button
          type="button"
          onClick={handleResetDefault}
          className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
          title="Reset to default shortcut"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Default</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <div
          ref={inputRef}
          tabIndex={0}
          onClick={() => {
            setIsRecording(true);
            setError(null);
            setDisplayLabel('Press shortcut...');
          }}
          onKeyDown={handleKeyDown}
          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all focus:outline-none ${
            isRecording
              ? 'bg-blue-600/15 border-blue-500 text-white ring-2 ring-blue-500/20'
              : 'bg-[#121316] border-[#2c2e33] text-gray-200 hover:border-[#373a40]'
          }`}
        >
          <div className="flex items-center space-x-2 font-mono">
            {isRecording ? (
              <span className="text-blue-400 animate-pulse font-sans font-medium">
                {displayLabel || 'Press combination on keyboard...'}
              </span>
            ) : (
              <kbd className="px-2 py-0.5 rounded bg-[#25262b] border border-[#373a40] text-gray-200 font-mono text-[11px]">
                {formatAcceleratorForDisplay(currentHotkey, isMac)}
              </kbd>
            )}
          </div>

          <span className="text-[11px] text-gray-400">
            {isRecording ? 'Esc to cancel' : 'Click to rebind'}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-[11px] text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
