'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Squircle } from './ui/squircle';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Spring animation for push/release effect
  const springProps = useSpring({
    scale: isPressed ? 0.88 : 1,
    config: {
      tension: 300,
      friction: 10,
    },
  });

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const x = event.clientX;
    const y = event.clientY;

    // Calculate the maximum distance from click point to corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore - View Transitions API
    if (!document.startViewTransition) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      return;
    }

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    });

    await transition.ready;

    // Always expand from button - simple and consistent
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  if (!mounted) {
    return (
      <Squircle
        as="button"
        smoothing="ios"
        className="bg-hover-surface h-[45px] w-[45px] cursor-pointer"
      >
        <div />
      </Squircle>
    );
  }

  return (
    <animated.div style={springProps}>
      <Squircle
        as="button"
        smoothing="ios"
        className="bg-hover-surface text-text-primary hover:bg-active-surface flex h-[45px] w-[45px] cursor-pointer items-center justify-center"
      >
        <div
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex h-full w-full items-center justify-center"
          aria-label="Toggle theme"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {theme === 'dark' ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </div>
      </Squircle>
    </animated.div>
  );
}
