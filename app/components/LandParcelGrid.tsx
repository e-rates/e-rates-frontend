'use client';

import { useSpring, animated, useSprings, to } from '@react-spring/web';
import { useEffect, useState } from 'react';

export const ERatesLogo = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const letters = ['E', '-', 'R', 'A', 'T', 'E', 'S'];

  // Create springs for each letter with individual rotation
  const springs = useSprings(
    letters.length,
    letters.map((_, index) => ({
      from: { rotate: 0, y: 0, opacity: 0 },
      to: { 
        rotate: (index % 2 === 0 ? 1 : -1) * (5 + index * 3), 
        y: Math.sin(index) * 2,
        opacity: 1
      },
      loop: { reverse: true },
      config: { 
        duration: 1200 + index * 200,
        tension: 120,
        friction: 14
      },
      delay: index * 80,
    }))
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center" style={{ height: '80px' }}>
      <div className="flex items-center gap-0.5">
        {springs.map((style, index) => (
          <animated.div
            key={index}
            style={{
              opacity: style.opacity,
              transform: to([style.rotate, style.y], (r, y) => 
                `rotate(${r}deg) translateY(${y}px)`
              ),
            }}
            className={`text-3xl font-bold ${
              letters[index] === '-' 
                ? 'text-neutral-900 dark:text-neutral-100' 
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {letters[index]}
          </animated.div>
        ))}
      </div>
    </div>
  );
};
