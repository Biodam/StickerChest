import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { StickerItem } from '../../types/models';
import { getChestImageUrl } from './image-url';
import {
  AnimationPlaybackMode,
  resolvePlaybackPath,
} from './animation-helper';

interface AnimatedStickerImageProps {
  item: StickerItem;
  isHovered: boolean;
  isSelected?: boolean;
  playbackMode?: AnimationPlaybackMode;
  className?: string;
  alt?: string;
}

export const AnimatedStickerImage: React.FC<AnimatedStickerImageProps> = ({
  item,
  isHovered,
  isSelected = false,
  playbackMode = 'hover',
  className = '',
  alt = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Performance optimization: disconnect/freeze when scrolled out of viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { rootMargin: '100px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldAnimate = isVisible && (isHovered || isSelected);
  const resolution = resolvePlaybackPath(
    item,
    shouldAnimate,
    playbackMode
  );

  const displayUrl = getChestImageUrl(resolution.srcPath);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <img
        src={displayUrl}
        alt={alt || item.filename}
        loading="lazy"
        className={className}
      />

      {/* Subtle Play indicator when idle in hover/reduced_motion mode */}
      {item.isAnimated && !resolution.isAnimatedActive && (
        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm rounded-full p-1 text-white/80 pointer-events-none transition-opacity">
          <Play className="w-2.5 h-2.5 fill-current" />
        </div>
      )}
    </div>
  );
};
