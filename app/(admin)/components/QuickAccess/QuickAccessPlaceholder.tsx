'use client';

import { Suspense } from 'react';

import {
  FileDown,
  MousePointerClick,
  Settings,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react';
import { PaymentActivity } from './PaymentActivity';
import { WardsPanel } from './WardsPanel';
import { AuditPanel } from './AuditPanel';

interface Hint {
  icon: LucideIcon;
  title: string;
  body: string;
}

const routeHints: [string, Hint][] = [
  ['/reports', { icon: FileDown, title: 'Reports', body: 'Pick the year or dates next to a report, then download it as a PDF or an Excel workbook.' }],
  ['/data_entry', { icon: Upload, title: 'Data entry', body: 'Upload a zipped shapefile (.shp, .shx, .dbf, .prj) to import parcels for a sub-county and ward.' }],
  ['/account', { icon: User, title: 'Account', body: 'Your profile details and role in the rates office.' }],
  ['/settings', { icon: Settings, title: 'Settings', body: 'Theme and display preferences for this dashboard.' }],
];

const parcelPreviewRows = ['Owner', 'Plot no.', 'Area', 'Rates status'];

export function QuickAccessPlaceholder({ pathname }: { pathname: string | null }) {
  const isMapRoute =
    !!pathname && (pathname.includes('/home') || pathname.includes('/parcels-map'));

  if (isMapRoute) {
    return (
      <section className="border-border-default mt-2 space-y-3 border-t-[0.5px] pt-3">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
            <MousePointerClick className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">Select a parcel</p>
            <p className="text-xs text-text-tertiary">
              Click any parcel on the map to see its details here.
            </p>
          </div>
        </div>

        <dl
          aria-hidden
          className="squircle-xl border-border-default divide-border-default divide-y-[0.5px] divide-dashed border-[0.5px] border-dashed text-sm"
        >
          {parcelPreviewRows.map((label) => (
            <div key={label} className="flex items-center justify-between px-3 py-2.5">
              <dt className="text-text-tertiary">{label}</dt>
              <dd className="bg-hover-surface h-2.5 w-16 rounded-full" />
            </div>
          ))}
        </dl>
      </section>
    );
  }

  if (pathname?.includes('/rate-payments')) return <PaymentActivity />;
  if (pathname?.includes('/dashboard/audit'))
    return (
      <Suspense fallback={null}>
        <AuditPanel />
      </Suspense>
    );
  if (pathname?.includes('/defaulters'))
    return (
      <Suspense fallback={null}>
        <WardsPanel />
      </Suspense>
    );

  const hint = routeHints.find(([route]) => pathname?.includes(route))?.[1];
  if (!hint) return null;
  const Icon = hint.icon;

  return (
    <section className="border-border-default mt-2 border-t-[0.5px] pt-3">
      <div className="squircle-xl border-border-default flex gap-3 border-[0.5px] border-dashed p-3">
        <div className="bg-hover-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-4 w-4 text-text-tertiary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-secondary">{hint.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-text-tertiary">{hint.body}</p>
        </div>
      </div>
    </section>
  );
}
