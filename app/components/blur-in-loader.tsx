'use client';

import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface BlurInLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  /**
   * Delay before content appears (in ms)
   * @default 0
   */
  delay?: number;
  /**
   * Custom loading content to show while loading
   */
  loadingContent?: React.ReactNode;
}

/**
 * A reusable component that applies a blur-in animation effect
 * when content is loading. Perfect for route transitions and dynamic content.
 */
export function BlurInLoader({
  isLoading,
  children,
  delay = 0,
  loadingContent,
}: BlurInLoaderProps) {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, delay]);

  // Spring animation for blur-in effect
  const contentSpring = useSpring({
    from: {
      opacity: 0,
      filter: 'blur(10px)',
      transform: 'scale(0.95)',
    },
    to: {
      opacity: showContent ? 1 : 0,
      filter: showContent ? 'blur(0px)' : 'blur(10px)',
      transform: showContent ? 'scale(1)' : 'scale(0.95)',
    },
    config: {
      tension: 170,
      friction: 26,
    },
  });

  // Spring animation for loading overlay
  const loadingSpring = useSpring({
    opacity: isLoading ? 1 : 0,
    config: {
      tension: 300,
      friction: 30,
      mass: 1,
    },
  });

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {isLoading && (
        <animated.div
          style={loadingSpring}
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          {loadingContent || (
            <div className="flex flex-col items-center gap-3">
              {/* Spinning loader */}
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
              <p className="text-text-secondary text-sm font-medium">
                Loading...
              </p>
            </div>
          )}
        </animated.div>
      )}

      {/* Actual content with blur-in animation */}
      <animated.div
        style={{
          ...contentSpring,
          willChange: 'opacity, filter, transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000,
          WebkitPerspective: 1000,
        }}
        className="h-full w-full"
      >
        {children}
      </animated.div>
    </div>
  );
}
