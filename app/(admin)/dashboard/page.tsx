'use client';

import React, { useState } from 'react';
import { LenisSmoothScroll } from '@/app/components/lenis-smooth-scroll';
import MenuItem from '@/app/(admin)/components/menuItem';

export default function Page() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const sidebarWidth = isMenuCollapsed ? 72 : 200;
  const quickAccessLeft = isMenuCollapsed ? 88 : 216;
  const mainContentLeft = isMenuCollapsed ? 424 : 552;

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
        className="flex w-full transition-all duration-500 ease-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Quick Access Tools */}
        <div
          className="border-border-default bg-elevated-surface fixed top-[60px] z-30 h-[calc(100vh-60px)] w-[320px] border-r-[0.5px] p-4 transition-all duration-500 ease-out"
          style={{ left: `${quickAccessLeft}px` }}
        >
          <p className="mb-4 text-lg font-medium">Quick Access</p>
        </div>

        {/* Main Content with Smooth Scroll */}
        <div
          className="bg-elevated-surface flex-1"
          style={{ marginLeft: '336px' }}
        >
          <LenisSmoothScroll className="h-[calc(100vh-60px)]">
            <div>
              <p>Main content area with smooth scrolling</p>
              <div className="h-[1000px] bg-linear-to-b from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                <p>Scroll test content - Try scrolling with mouse wheel!</p>
                {Array.from({ length: 50 }, (_, i) => (
                  <div key={i} className="border-border-default border-b p-4">
                    <h3 className="text-lg font-semibold">
                      Content Block {i + 1}
                    </h3>
                    <p>
                      This is some content to test the smooth scrolling. Lorem
                      ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </LenisSmoothScroll>
        </div>
      </div>
    </div>
  );
}
