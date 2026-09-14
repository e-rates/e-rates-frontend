'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { MenuHeader } from './MenuHeader';
import { MenuItemCard } from './MenuItemCard';
import { menuItems, bottomMenuItems, visibleMenuItems } from './menuData';
import { authService } from '@/lib/auth';

interface MenuItemProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MenuItem = ({ isCollapsed, onToggleCollapse }: MenuItemProps) => {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [role, setRole] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRole(authService.getUserRole()), []);

  const items = useMemo(() => visibleMenuItems(menuItems, role), [role]);

  // Update active index based on current path
  useEffect(() => {
    const allItems = [...items, ...bottomMenuItems];
    const currentIndex = allItems.findIndex((item) => pathname === item.href);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname, items]);

  return (
    <div className="flex h-full w-full flex-col justify-between space-y-2">
      <div>
        <MenuHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />

        <div className="relative left-0 space-y-2">
          {items.map((item, index) => (
            <MenuItemCard
              key={item.name}
              name={item.name}
              icon={item.icon}
              href={item.href}
              isActive={index === activeIndex}
              isCollapsed={isCollapsed}
              index={index}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {bottomMenuItems.map((item, index) => (
          <MenuItemCard
            key={item.name}
            name={item.name}
            icon={item.icon}
            href={item.href}
            isActive={index + items.length === activeIndex}
            isCollapsed={isCollapsed}
            index={index + items.length}
            onClick={() => setActiveIndex(index + items.length)}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuItem;
