'use client';

import { useSpring, animated, config } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  /**
   * Size of the spinner in pixels or preset size
   * @default 48
   */
  size?: number | 'sm' | 'md' | 'lg';
  /**
   * Color of the spinner
   * @default 'currentColor'
   */
  color?: string;
  /**
   * Variant of the spinner
   * @default 'default'
   */
  variant?: 'default' | 'dots' | 'pulse' | 'gradient';
  /**
   * Show loading text below spinner
   */
  text?: string;
  /**
   * Speed of rotation (higher = faster)
   * @default 1
   */
  speed?: number;
}

/**
 * Beautiful animated loading spinner using react-spring
 */
export function LoadingSpinner({
  size = 48,
  color = 'currentColor',
  variant = 'default',
  text,
  speed = 1,
}: LoadingSpinnerProps) {
  // Convert size string to number
  const getSize = (size: number | 'sm' | 'md' | 'lg'): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 20;
      case 'md':
        return 32;
      case 'lg':
        return 48;
      default:
        return 48;
    }
  };

  const actualSize = getSize(size);
  const [rotation, setRotation] = useState(0);

  // Continuous rotation animation
  const { rotate } = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: {
      duration: 1000 / speed,
      easing: (t) => t, // Linear easing
    },
  });

  // Scale animation for entry
  const scaleSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: config.wobbly,
  });

  // Pulse animation for pulse variant
  const pulseSpring = useSpring({
    from: { scale: 0.8, opacity: 0.5 },
    to: { scale: 1.2, opacity: 1 },
    loop: { reverse: true },
    config: {
      duration: 800,
    },
  });

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center gap-3">
        <animated.div
          style={{
            width: actualSize,
            height: actualSize,
            scale: pulseSpring.scale,
            opacity: pulseSpring.opacity,
            background: `linear-gradient(135deg, ${color}, transparent)`,
            boxShadow: `0 0 ${actualSize / 2}px ${color}`,
          }}
          className="rounded-full"
        />
        {text && (
          <p className="text-text-secondary text-sm font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    const DotSpring = ({ delay }: { delay: number }) => {
      const dotAnimation = useSpring({
        from: { scale: 0.5 },
        to: { scale: 1 },
        loop: { reverse: true },
        delay: delay,
        config: config.wobbly,
      });

      return (
        <animated.div
          style={{
            scale: dotAnimation.scale,
            width: actualSize / 4,
            height: actualSize / 4,
            backgroundColor: color,
          }}
          className="rounded-full"
        />
      );
    };

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <DotSpring delay={0} />
          <DotSpring delay={150} />
          <DotSpring delay={300} />
        </div>
        {text && (
          <p className="text-text-secondary text-sm font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className="flex flex-col items-center gap-3">
        <animated.div
          style={{
            ...scaleSpring,
            rotate: rotate.to((r) => `${r}deg`),
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: actualSize,
              height: actualSize,
              background: `conic-gradient(from 0deg, transparent, ${color}, transparent)`,
              position: 'relative',
            }}
          >
            <div
              className="absolute inset-1 rounded-full bg-white dark:bg-neutral-900"
              style={{
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        </animated.div>
        {text && (
          <p className="text-text-secondary text-sm font-medium">{text}</p>
        )}
      </div>
    );
  }

  // Default variant - similar to your CSS but animated with react-spring
  return (
    <div className="flex flex-col items-center gap-3">
      <animated.div
        style={{
          ...scaleSpring,
          rotate: rotate.to((r) => `${r}deg`),
          width: actualSize,
          height: actualSize,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: '100%',
            height: '100%',
            border: `${actualSize / 16}px solid transparent`,
            borderTopColor: color,
            borderRightColor: 'transparent',
            boxSizing: 'border-box',
          }}
        />
      </animated.div>
      {text && (
        <p className="text-text-secondary text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function FullPageLoader({
  text = 'Loading...',
  variant = 'gradient',
}: Omit<LoadingSpinnerProps, 'size'>) {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.gentle,
  });

  return (
    <animated.div
      style={fadeIn}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80"
    >
      <LoadingSpinner
        size={64}
        variant={variant}
        text={text}
        color="rgb(59, 130, 246)"
      />
    </animated.div>
  );
}
