'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function ThemeController() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Force Dark Mode for Dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (theme !== 'dark') {
        setTheme('dark');
      }
    } 
    // Force Light Mode for Login and other User routes
    else {
      if (theme !== 'light') {
        setTheme('light');
      }
    }
  }, [pathname, setTheme, theme]);

  return null;
}
