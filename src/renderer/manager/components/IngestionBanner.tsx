import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { IngestionProgressEvent } from '../../../types/models';

interface IngestionBannerProps {
  progress: IngestionProgressEvent | null;
  onDismiss: () => void;
}

export const IngestionBanner: React.FC<IngestionBannerProps> = ({ progress, onDismiss }) => {
  if (!progress || progress.status === 'idle') return null;

  const percent = progress.totalCount > 0
    ? Math.round((progress.processedCount / progress.totalCount) * 100)
    : 0;

  return (
    <div className="bg-blue-950/70 border-b border-blue-500/30 px-6 py-2 flex items-center justify-between text-xs text-blue-200 select-none">
      <div className="flex items-center space-x-3 flex-1 mr-4 truncate">
        {progress.status === 'error' ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
        )}

        <div className="truncate">
          <span className="font-semibold capitalize text-blue-100 mr-2">{progress.status}:</span>
          {progress.currentFile ? (
            <span className="text-gray-300 font-mono text-[11px] truncate">{progress.currentFile}</span>
          ) : (
            <span>Processing local folder...</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {progress.totalCount > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-32 h-1.5 rounded-full bg-blue-900/80 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-blue-300">
              {progress.processedCount}/{progress.totalCount} ({percent}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
