'use client';

import { useState } from 'react';
import { MenuHeader } from './menu/MenuHeader';
import { MenuItemCard } from './menu/MenuItemCard';
import { menuItems } from './menu/menuData';

interface MenuItemProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MenuItem = ({ isCollapsed, onToggleCollapse }: MenuItemProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex w-full flex-col space-y-2">
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
  );
};

export default MenuItem;
