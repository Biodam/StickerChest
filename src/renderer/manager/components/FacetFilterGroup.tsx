import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { FilterFacet } from '../../../types/models';

interface FacetFilterGroupProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FilterFacet[];
  selectedItem: string | null;
  onSelectItem: (value: string | null) => void;
  defaultExpanded?: boolean;
  prefix?: string;
  maxInitial?: number;
}

export const FacetFilterGroup: React.FC<FacetFilterGroupProps> = ({
  title,
  icon: Icon,
  items,
  selectedItem,
  onSelectItem,
  defaultExpanded = true,
  prefix = '',
  maxInitial = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) return null;

  const visibleItems = showAll ? items : items.slice(0, maxInitial);
  const hasMore = items.length > maxInitial;

  return (
    <div className="pt-2">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
      >
        <div className="flex items-center space-x-1.5">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <span>{title}</span>
          <span className="text-[10px] text-gray-500 normal-case">({items.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>

      {/* Group Items */}
      {isExpanded && (
        <div className="mt-1 space-y-0.5 px-1">
          {visibleItems.map((item) => {
            const isSelected = selectedItem?.toLowerCase() === item.name.toLowerCase();

            return (
              <button
                key={item.name}
                onClick={() => onSelectItem(isSelected ? null : item.name)}
                title={`${prefix}${item.name} (${item.count})`}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
                }`}
              >
                <span className="truncate text-left pr-2">
                  {prefix}{item.name}
                </span>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'bg-[#25262b] text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                  {isSelected && <X className="w-3 h-3 text-blue-400 hover:text-white" />}
                </div>
              </button>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-left px-2.5 py-1 text-[11px] text-blue-400/80 hover:text-blue-300 font-medium transition-colors"
            >
              {showAll ? 'Show less' : `+${items.length - maxInitial} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
