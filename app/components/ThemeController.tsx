'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ThemeController() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const hasSetInitialTheme = useRef(false);

  useEffect(() => {
    if (!pathname || hasSetInitialTheme.current) return;

    // Only set initial theme once, then respect user's manual toggle
    hasSetInitialTheme.current = true;

    // Set initial theme based on route (only on first load)
    if (pathname.startsWith('/dashboard')) {
      if (theme === 'system' || !theme) {
        setTheme('dark');
      }
    } else {
      if (theme === 'system' || !theme) {
        setTheme('light');
      }
    }
  }, [pathname, setTheme, theme]);

  return null;
}
