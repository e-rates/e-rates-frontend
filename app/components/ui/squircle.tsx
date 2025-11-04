'use client';

import {
  generateSquirclePath,
  squirclePresets,
  type SquirclePreset,
} from '@/lib/squircle';
import { useId, useEffect, useState } from 'react';
import type { ElementType, ComponentPropsWithoutRef } from 'react';

interface SquircleProps {
  children: React.ReactNode;
  className?: string;
  smoothing?: number | SquirclePreset;
  as?: ElementType;
}

export function Squircle({
  children,
  className = '',
  smoothing = 'ios',
  as = 'div',
}: SquircleProps) {
  const id = useId();
  const [mounted, setMounted] = useState(false);
  const clipPathId = `squircle-${id}`;
  const Component = as;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get smoothing value
  const smoothingValue =
    typeof smoothing === 'string' ? squirclePresets[smoothing] : smoothing;

  const path = generateSquirclePath(smoothingValue);

  // Don't render clip path until client-side to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={path} />
          </clipPath>
        </defs>
      </svg>
      <Component
        className={className}
        style={{
          clipPath: `url(#${clipPathId})`,
          animation: 'blurIn 0.4s ease-out forwards',
        }}
      >
        {children}
      </Component>
      <style jsx>{`
        @keyframes blurIn {
          from {
            filter: blur(10px);
            opacity: 0;
          }
          to {
            filter: blur(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
