'use client';

import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { shortLabels } from './menuData';

interface MenuItemCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  index: number;
  onClick: () => void;
}

export const MenuItemCard = ({
  name,
  icon: IconComponent,
  href,
  isActive,
  isCollapsed,
  index,
  onClick,
}: MenuItemCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Link href={href} onClick={onClick} className="block">
      <div className="relative">
        {/* Animated active background */}
        {isActive && (
          <motion.div
            layoutId="activeBackground"
            // Apple blue background for active state
            className="squircle-lg absolute inset-0 bg-[#007AFF]"
            initial={false}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 35,
              mass: 1.2,
              duration: 0.6,
            }}
          />
        )}

        {/* Menu item content */}
        <motion.div
          initial={false}
          animate={{
            scale: isCollapsed ? 0.95 : 1,
          }}
          transition={{
            delay: index * 0.05,
            duration: 0.4,
            ease: 'easeOut',
          }}
          className={`squircle-lg relative flex cursor-pointer items-center transition-all duration-500 ${
            isCollapsed
              ? 'mx-auto h-auto w-12 flex-col justify-center gap-1 px-1 py-2'
              : 'h-10 w-full gap-3 px-3'
          } ${!isActive ? 'bg-gray-100/80 hover:bg-gray-200/90 dark:bg-[#4A4A4A]/35 dark:hover:bg-[#5A5A5A]/50' : 'hover:bg-transparent'}`}
          title={name}
        >
          <div
            className={`${
              isActive ? 'text-white' : 'text-gray-600 dark:text-[#d1d5db]'
            }`}
            style={{
              filter: !isActive
                ? 'drop-shadow(0 0 0.5px currentColor)'
                : 'none',
            }}
          >
            <IconComponent
              size={16}
              fill={isActive ? 'currentColor' : 'none'}
              strokeWidth={!isActive ? 1.5 : 2}
            />
          </div>

          {isCollapsed ? (
            <motion.span
              className={`text-center text-[9px] leading-tight font-medium ${
                isActive ? 'text-white' : 'text-gray-600 dark:text-[#d1d5db]'
              }`}
              initial={false}
              animate={{
                opacity: isCollapsed ? 1 : 0,
                y: isCollapsed ? 0 : -5,
              }}
              transition={{
                delay: 0.3 + index * 0.05,
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {shortLabels[name]}
            </motion.span>
          ) : (
            <motion.p
              className={`text-regular-md overflow-hidden font-medium whitespace-nowrap ${
                isActive ? 'text-white' : 'text-gray-600 dark:text-[#d1d5db]'
              }`}
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                x: isCollapsed ? -10 : 0,
              }}
              transition={{
                delay: isActive ? 0.3 + index * 0.05 : index * 0.05,
                duration: 0.4,
                ease: 'easeOut',
              }}
            >
              {name}
            </motion.p>
          )}
        </motion.div>
      </div>
    </Link>
  );
};
