'use client';

import { useState } from 'react';
import { MenuHeader } from './MenuHeader';
import { MenuItemCard } from './MenuItemCard';
import { menuItems, bottomMenuItems } from './menuData';

interface MenuItemProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MenuItem = ({ isCollapsed, onToggleCollapse }: MenuItemProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
