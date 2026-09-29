import React from 'react';
import { Grid3X3, LayoutGrid, Grid2X2 } from 'lucide-react';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '../hooks/useGridSize';

interface GridSizeControlProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export const GridSizeControl: React.FC<GridSizeControlProps> = ({
  gridSize,
  onGridSizeChange,
}) => {
  // Preset sizes:
  // Small: 110px (Compact)
  // Medium: 160px (Standard)
  // Large: 230px (Comfortable)
  const isSmall = gridSize <= 125;
  const isLarge = gridSize >= 200;
  const isMedium = !isSmall && !isLarge;

  return (
    <div className="flex items-center space-x-2 bg-[#25262b] border border-[#2c2e33] rounded-lg px-2 py-1 select-none">
      {/* Preset Buttons */}
      <div className="flex items-center space-x-0.5">
        <button
          type="button"
          onClick={() => onGridSizeChange(110)}
          title="Compact Grid (Small)"
          className={`p-1 rounded transition-colors ${
            isSmall
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2c2e33]'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onGridSizeChange(160)}
          title="Standard Grid (Medium)"
          className={`p-1 rounded transition-colors ${
            isMedium
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2c2e33]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onGridSizeChange(230)}
          title="Large Grid (Comfortable)"
          className={`p-1 rounded transition-colors ${
            isLarge
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2c2e33]'
          }`}
        >
          <Grid2X2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-3.5 w-px bg-[#3b3e45]" />

      {/* Fine-tuning Slider */}
      <input
        type="range"
        min={MIN_GRID_SIZE}
        max={MAX_GRID_SIZE}
        step={10}
        value={gridSize}
        onChange={(e) => onGridSizeChange(Number(e.target.value))}
        title={`Grid Size: ${gridSize}px`}
        className="w-16 h-1 bg-[#1a1b1e] rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
      />
    </div>
  );
};
