'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import { bottomMenuItems, menuItems, visibleMenuItems } from './menu/menuData';
import { useNavCollapse } from './NavCollapse';

export function AdminNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const { collapsed } = useNavCollapse();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRole(authService.getUserRole()), []);

  const items = useMemo(() => visibleMenuItems(menuItems, role), [role]);
  const trailing = useMemo(
    () => visibleMenuItems(bottomMenuItems, role).filter((item) => item.name === 'Settings'),
    [role]
  );

  if (collapsed) return null;

  return (
    <nav
      aria-label="Main"
      id="admin-main-nav"
      className="border-border-default bg-panel-bg sticky top-[60px] z-[1050] flex h-[46px] w-full items-stretch gap-1 overflow-x-auto border-b-[0.5px] px-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex shrink-0 items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors ${
              isActive
                ? 'font-semibold text-text-primary'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            {item.name}
            {isActive && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
          </Link>
        );
      })}

      <span className="flex-1" />

      {trailing.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex shrink-0 items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors ${
              isActive
                ? 'font-semibold text-text-primary'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            {item.name}
            {isActive && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
