'use client';

import React, { useState } from 'react';
import { LenisSmoothScroll } from '@/app/components/lenis-smooth-scroll';
import MenuItem from '@/app/(admin)/components/menu/MenuItem';
import MapComponent from '@/app/(admin)/components/map/MapComponent';
import QuickAcessTools from '../components/QuickAccess/QuickAcessTools';

export default function Page() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const sidebarWidth = isMenuCollapsed ? 72 : 200;
  const quickAccessLeft = isMenuCollapsed ? 88 : 216;
  const quickAccessWidth = 320;
  const gap = isMenuCollapsed ? 16 : 16; // gap between quick access and main content

  return (
    <div className="bg-panel-bg flex min-h-screen w-full">
      {/* Side Menu */}
      <div
        className="border-border-default bg-elevated-surface fixed top-[60px] z-40 h-[calc(100vh-60px)] overflow-hidden border-r-[0.5px] py-4 transition-all duration-500 ease-out"
        style={{
          width: `${sidebarWidth}px`,
          paddingLeft: isMenuCollapsed ? '12px' : '16px',
          paddingRight: isMenuCollapsed ? '12px' : '16px',
        }}
      >
        <MenuItem
          isCollapsed={isMenuCollapsed}
          onToggleCollapse={() => setIsMenuCollapsed(!isMenuCollapsed)}
        />
      </div>

      {/* Content Area (offset by sidebar width) */}
      <div
        className="flex h-[calc(100vh-60px)] gap-2 transition-all duration-500 ease-out"
        style={{
          marginLeft: `${sidebarWidth}px`,
          paddingLeft: '8px',
          paddingRight: '8px',
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
      >
        {/* Quick Access Tools */}
        <div className="border-border-default bg-elevated-surface fixed h-full w-[320px] shrink-0 border-r-[0.5px] p-4">
          <div>
            <QuickAcessTools />
          </div>
        </div>

        {/* Main Content with Smooth Scroll */}
        <div className="bg-elevated-surface ml-[328px] flex min-w-0 flex-1 flex-col">
          <div className="bg-panel-bg sticky top-[60px] z-20 h-[55px] w-full px-2 py-2">
            <p>Quick tools here</p>
          </div>
          <div className="w-full flex-1">
            <MapComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
