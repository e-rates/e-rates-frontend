'use client';

import React, { useState, useRef, useEffect } from 'react';
import MenuItem from '@/app/(admin)/components/menu/MenuItem';
import QuickAcessTools from '../components/QuickAccess/QuickAcessTools';
import QuickToolsBar from '../components/QuickTools/QuickToolsBar';
import { MapProvider } from '../context/MapContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [showQuickTools, setShowQuickTools] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarWidth = isMenuCollapsed ? 72 : 200;

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsMenuCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const handleToggleCollapse = () => {
    const newState = !isMenuCollapsed;
    setIsMenuCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));

    // Trigger multiple resize events to ensure map updates properly
    // First immediately, then after animation completes
    window.dispatchEvent(new Event('resize'));

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 350);

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 550);
  };

  return (
    <MapProvider>
      <div className="bg-panel-bg sticky top-[60px] flex h-[calc(100vh-60px)] overflow-hidden">
        {/* Side Menu */}
        <div
          className="border-border-default bg-elevated-surface h-full shrink-0 overflow-hidden border-r py-4 transition-[width] duration-500 ease-out"
          style={{
            width: `${sidebarWidth}px`,
            paddingLeft: isMenuCollapsed ? '12px' : '16px',
            paddingRight: isMenuCollapsed ? '12px' : '16px',
          }}
        >
          <MenuItem
            isCollapsed={isMenuCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>

        {/* Quick Access Tools */}
        <div className="border-border-default bg-elevated-surface h-full w-[320px] shrink-0 overflow-y-auto border-r p-4">
          <QuickAcessTools />
        </div>

        {/* Main Content Container */}
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {/* Quick tools header - hides on scroll */}
          <div
            className={`border-border-default dark:bg-panel-bg shrink-0 border-b bg-gray-50 transition-all duration-300 ${
              showQuickTools ? 'h-[55px] opacity-100' : 'h-0 py-0 opacity-0'
            }`}
          >
            {showQuickTools && <QuickToolsBar />}
          </div>

          {/* Scrollable content - Native scroll */}
          <div
            ref={scrollContainerRef}
            className="relative h-full w-full flex-1 overflow-x-hidden overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              willChange: 'auto',
            }}
          >
            <div className="h-full w-full">{children}</div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
}
