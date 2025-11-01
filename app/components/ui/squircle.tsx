'use client'

import { generateSquirclePath, squirclePresets, type SquirclePreset } from '@/lib/squircle'
import { useId } from 'react'
import type { ElementType, ComponentPropsWithoutRef } from 'react'

interface SquircleProps {
  children: React.ReactNode
  className?: string
  smoothing?: number | SquirclePreset
  as?: ElementType
}

export function Squircle({ 
  children, 
  className = '', 
  smoothing = 'ios',
  as = 'div'
}: SquircleProps) {
  const id = useId()
  const clipPathId = `squircle-${id}`
  const Component = as
  
  // Get smoothing value
  const smoothingValue = typeof smoothing === 'string' 
    ? squirclePresets[smoothing] 
    : smoothing
  
  const path = generateSquirclePath(smoothingValue)
  
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
        style={{ clipPath: `url(#${clipPathId})` }}
      >
        {children}
      </Component>
    </>
  )
}
