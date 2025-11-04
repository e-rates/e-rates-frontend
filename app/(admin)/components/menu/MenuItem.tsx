'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MenuHeader } from './MenuHeader';
import { MenuItemCard } from './MenuItemCard';
import { menuItems, bottomMenuItems } from './menuData';

interface MenuItemProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MenuItem = ({ isCollapsed, onToggleCollapse }: MenuItemProps) => {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active index based on current path
  useEffect(() => {
    const allItems = [...menuItems, ...bottomMenuItems];
    const currentIndex = allItems.findIndex((item) => pathname === item.href);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  return (
    <div className="flex h-full w-full flex-col justify-between space-y-2">
      <div>
        <MenuHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />

        <div className="relative left-0 space-y-2">
          {menuItems.map((item, index) => (
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
            isActive={index + menuItems.length === activeIndex}
            isCollapsed={isCollapsed}
            index={index + menuItems.length}
            onClick={() => setActiveIndex(index + menuItems.length)}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuItem;
