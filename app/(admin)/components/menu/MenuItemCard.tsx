'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import type { AnimatedIconHandle } from '@/app/components/ui/types';
import type { MenuIcon } from './menuData';

interface MenuItemCardProps {
  name: string;
  icon: MenuIcon;
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
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(
    null
  );
  const itemRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<AnimatedIconHandle>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isActive) iconRef.current?.startAnimation();
  }, [isActive]);

  useEffect(() => {
    if (!isCollapsed) setTooltip(null);
  }, [isCollapsed]);

  const showTooltip = () => {
    if (!isCollapsed || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    setTooltip({ top: rect.top + rect.height / 2, left: rect.right + 12 });
  };

  const hideTooltip = () => setTooltip(null);

  const handleEnter = () => {
    iconRef.current?.startAnimation();
    showTooltip();
  };

  const handleLeave = () => {
    iconRef.current?.stopAnimation();
    hideTooltip();
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={name}
      className="block"
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <div
        ref={itemRef}
        className="relative"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {isActive && (
          <motion.div
            layoutId="activeBackground"
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

        <motion.div
          initial={false}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
          className={`squircle-lg relative flex h-10 cursor-pointer items-center transition-colors duration-200 ${
            isCollapsed ? 'mx-auto w-10 justify-center' : 'w-full gap-3 px-3'
          } ${!isActive ? 'bg-gray-100/80 hover:bg-gray-200/90 dark:bg-[#4A4A4A]/35 dark:hover:bg-[#5A5A5A]/50' : 'hover:bg-transparent'}`}
        >
          <div
            className={
              isActive ? 'text-white' : 'text-gray-600 dark:text-[#d1d5db]'
            }
            style={{
              filter: !isActive ? 'drop-shadow(0 0 0.5px currentColor)' : 'none',
            }}
          >
            <IconComponent
              ref={iconRef}
              size={isCollapsed ? 20 : 18}
              strokeWidth={isActive ? 2.25 : 1.75}
            />
          </div>

          {!isCollapsed && (
            <motion.p
              className={`text-regular-md overflow-hidden font-medium whitespace-nowrap ${
                isActive ? 'text-white' : 'text-gray-600 dark:text-[#d1d5db]'
              }`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.18, ease: 'easeOut' }}
            >
              {name}
            </motion.p>
          )}
        </motion.div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isCollapsed && tooltip && (
              <motion.div
                key={name}
                role="tooltip"
                initial={{ opacity: 0, x: -8, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                style={{
                  position: 'fixed',
                  top: tooltip.top,
                  left: tooltip.left,
                  y: '-50%',
                  transformOrigin: 'left center',
                }}
                className="pointer-events-none z-[100001] flex items-center"
              >
                <span className="absolute -left-1 h-2 w-2 rotate-45 bg-neutral-900 dark:bg-white" />
                <span className="relative rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
                  {name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </Link>
  );
};
