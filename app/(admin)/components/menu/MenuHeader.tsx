'use client';

import { motion } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface MenuHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const MenuHeader = ({
  isCollapsed,
  onToggleCollapse,
}: MenuHeaderProps) => {
  return (
    <div
      className={`flex w-full flex-row items-center transition-all duration-300 ${
        isCollapsed ? 'justify-center' : 'justify-between px-2'
      }`}
    >
      <motion.p
        className="text-regular-md"
        initial={false}
        animate={{
          opacity: isCollapsed ? 0 : 1,
          x: isCollapsed ? -10 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      >
        {!isCollapsed && 'Menu'}
      </motion.p>
      <button
        className="squircle-md p-1.5 transition-colors duration-200 hover:bg-gray-500/20"
        onClick={onToggleCollapse}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {isCollapsed ? (
            <PanelLeftOpen
              size={16}
              className="text-gray-400 hover:text-gray-300"
            />
          ) : (
            <PanelLeftClose
              size={16}
              className="text-gray-400 hover:text-gray-300"
            />
          )}
        </motion.div>
      </button>
    </div>
  );
};
