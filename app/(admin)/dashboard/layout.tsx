'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AdminNav } from '../components/AdminNav';
import QuickAcessTools from '../components/QuickAccess/QuickAcessTools';
import QuickToolsBar from '../components/QuickTools/QuickToolsBar';
import { MapProvider } from '../context/MapContext';
import { useNavCollapse } from '../components/NavCollapse';

/** Routes whose side panel holds real tools or live data; everywhere else runs full width. */
const SIDE_PANEL_ROUTES = [
  '/dashboard/home',
  '/dashboard/parcels-map',
  '/dashboard/rate-payments',
  '/dashboard/defaulters',
  '/dashboard/audit',
];

/** The parcel search bar only makes sense where parcels are on screen. */
const PARCEL_SEARCH_ROUTES = ['/dashboard/home', '/dashboard/parcels-map', '/dashboard/allocations'];

type PanelState = 'hidden' | 'normal' | 'wide';
const PANEL_KEY = 'erates.sidePanel';

const panelButton =
  'text-text-tertiary hover:text-text-primary border-border-default bg-main-bg hover:bg-hover-surface flex items-center gap-1 border px-1.5 py-0.5 text-[10.5px] font-medium transition-colors';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidePanel = SIDE_PANEL_ROUTES.some((route) => pathname?.startsWith(route));
  const showQuickTools = PARCEL_SEARCH_ROUTES.some((route) => pathname?.startsWith(route));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useNavCollapse();
  const [panel, setPanel] = useState<PanelState>('normal');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PANEL_KEY);
      if (saved === 'hidden' || saved === 'normal' || saved === 'wide') setPanel(saved);
    } catch {}
  }, []);

  const changePanel = (next: PanelState) => {
    setPanel(next);
    try {
      localStorage.setItem(PANEL_KEY, next);
    } catch {}
  };

  return (
    <MapProvider>
      <AdminNav />
      <div
        className={`bg-panel-bg flex overflow-hidden ${
          collapsed ? 'h-[calc(100vh-60px)]' : 'h-[calc(100vh-106px)]'
        }`}
      >
        {showSidePanel &&
          (panel === 'hidden' ? (
            <div className="border-border-default bg-elevated-surface flex h-full w-9 shrink-0 flex-col items-center border-r pt-3">
              <button
                onClick={() => changePanel('normal')}
                title="Show sidebar"
                aria-label="Show sidebar"
                className="text-text-tertiary hover:text-text-primary hover:bg-hover-surface p-1.5 transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={`border-border-default bg-elevated-surface h-full shrink-0 overflow-y-auto border-r p-3.5 transition-[width] duration-200 ${
                panel === 'wide' ? 'w-[480px]' : 'w-[360px]'
              }`}
            >
              <div className="flex justify-end gap-1.5 pb-1">
                <button onClick={() => changePanel(panel === 'wide' ? 'normal' : 'wide')} className={panelButton}>
                  {panel === 'wide' ? (
                    <>
                      <Minimize2 className="h-3 w-3" />
                      <span>Narrow</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3 w-3" />
                      <span>Expand</span>
                    </>
                  )}
                </button>
                <button onClick={() => changePanel('hidden')} title="Hide sidebar" className={panelButton}>
                  <PanelLeftClose className="h-3 w-3" />
                  <span>Hide</span>
                </button>
              </div>
              <QuickAcessTools />
            </div>
          ))}

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {showQuickTools && (
            <div className="border-border-default dark:bg-panel-bg h-[55px] shrink-0 border-b bg-gray-50">
              <QuickToolsBar />
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className="relative h-full w-full flex-1 overflow-x-hidden overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="h-full w-full">{children}</div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
}
