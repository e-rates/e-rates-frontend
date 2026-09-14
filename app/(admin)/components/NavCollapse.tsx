'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const COLLAPSED_KEY = 'adminNavCollapsed';

const NavCollapseContext = createContext<{ collapsed: boolean; toggle: () => void }>({
  collapsed: false,
  toggle: () => {},
});

export function NavCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {
      /* blocked storage: stay expanded */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((wasCollapsed) => {
      const next = !wasCollapsed;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* not worth failing the click over */
      }
      return next;
    });
  }, []);

  return (
    <NavCollapseContext.Provider value={{ collapsed, toggle }}>
      {children}
    </NavCollapseContext.Provider>
  );
}

export const useNavCollapse = () => useContext(NavCollapseContext);
