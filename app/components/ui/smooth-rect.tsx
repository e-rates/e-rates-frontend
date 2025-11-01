import React from 'react';
import { cn } from '@/lib/utils';

interface SmoothRectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SmoothRect: React.FC<SmoothRectProps> = ({
  children,
  radius = 'md',
  className,
  ...props
}) => {
  const radiusValue =
    radius === 'sm' ? 8 : radius === 'md' ? 10 : radius === 'lg' ? 14 : 18;

  return (
    <div
      className={cn('relative transition-all duration-200 ease-out', className)}
      style={{
        // Clean border-radius for smooth corners without artifacts
        borderRadius: `${radiusValue}px`,
        // Use clip-path for even smoother corners
        clipPath: `inset(0 round ${radiusValue}px)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
