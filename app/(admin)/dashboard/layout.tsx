'use client';

import React, { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AdminNav } from '../components/AdminNav';
import QuickAcessTools from '../components/QuickAccess/QuickAcessTools';
import QuickToolsBar from '../components/QuickTools/QuickToolsBar';
import { MapProvider } from '../context/MapContext';
import { useNavCollapse } from '../components/NavCollapse';
import { AiPanel } from '../components/Assistant/AskAiButton';
import { useAuth } from '@/hooks/useAuth';

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidePanel = SIDE_PANEL_ROUTES.some((route) => pathname?.startsWith(route));
  const showQuickTools = PARCEL_SEARCH_ROUTES.some((route) => pathname?.startsWith(route));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useNavCollapse();
  const { userRole } = useAuth();
  const [panelExpanded, setPanelExpanded] = useState(false);

  return (
    <MapProvider>
      <AdminNav />
      <div
        className={`bg-panel-bg flex overflow-hidden ${
          collapsed ? 'h-[calc(100vh-60px)]' : 'h-[calc(100vh-106px)]'
        }`}
      >
        {showSidePanel && (
          <div
            className={`border-border-default bg-elevated-surface h-full shrink-0 overflow-y-auto border-r p-3.5 transition-[width] duration-200 ${
              panelExpanded ? 'w-[480px]' : 'w-[360px]'
            }`}
          >
            <div className="flex justify-end pb-1">
              <button
                onClick={() => setPanelExpanded(!panelExpanded)}
                title={panelExpanded ? 'Narrow sidebar' : 'Expand sidebar'}
                className="text-text-tertiary hover:text-text-primary px-1.5 py-0.5 text-[10.5px] font-medium flex items-center gap-1 border border-border-default bg-main-bg hover:bg-hover-surface transition-colors"
              >
                {panelExpanded ? (
                  <>
                    <Minimize2 className="h-3 w-3" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3 w-3" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            </div>
            <QuickAcessTools />
          </div>
        )}

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

        {/* AI panel pushes layout — no overlay */}
        <AiPanel userRole={userRole} />
      </div>
    </MapProvider>
  );
}
