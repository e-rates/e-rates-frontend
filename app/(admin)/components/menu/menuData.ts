import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type {
  AnimatedIconHandle,
  AnimatedIconProps,
} from '@/app/components/ui/types';
import HomeIcon from '@/app/components/ui/home-icon';
import WalletIcon from '@/app/components/ui/wallet-icon';
import MapPinIcon from '@/app/components/ui/map-pin-icon';
import TriangleAlertIcon from '@/app/components/ui/triangle-alert-icon';
import ChartBarIcon from '@/app/components/ui/chart-bar-icon';
import HistoryCircleIcon from '@/app/components/ui/history-circle-icon';
import UploadIcon from '@/app/components/ui/upload-icon';
import UserIcon from '@/app/components/ui/user-icon';
import GearIcon from '@/app/components/ui/gear-icon';
import SparklesIcon from '@/app/components/ui/sparkles-icon';

export type MenuIcon = ForwardRefExoticComponent<
  AnimatedIconProps & RefAttributes<AnimatedIconHandle>
>;

export interface MenuItem {
  name: string;
  icon: MenuIcon;
  href: string;
  isActive?: boolean;
  /** Roles allowed to see this item. Required so a new item cannot leak by omission. */
  roles: string[];
}

export const OPERATIONS_ROLES = ['admin'];
export const OVERSIGHT_ROLES = ['admin', 'auditor', 'owner'];

export const menuItems: MenuItem[] = [
  { name: 'Home', icon: HomeIcon, href: '/dashboard/home', roles: ['admin', 'auditor', 'owner'] },
  { name: 'Counties', icon: MapPinIcon, href: '/dashboard/counties', roles: ['owner'] },
  { name: 'Rate Payments', icon: WalletIcon, href: '/dashboard/rate-payments', roles: OPERATIONS_ROLES },
  { name: 'Parcels Map', icon: MapPinIcon, href: '/dashboard/parcels-map', roles: OPERATIONS_ROLES },
  { name: 'Land Owners', icon: UserIcon, href: '/dashboard/land-owners', roles: OPERATIONS_ROLES },
  { name: 'Allocations', icon: UserIcon, href: '/dashboard/allocations', roles: OPERATIONS_ROLES },
  { name: 'Defaulters', icon: TriangleAlertIcon, href: '/dashboard/defaulters', roles: ['admin', 'auditor'] },
  { name: 'Ask AI', icon: SparklesIcon, href: '/dashboard/ask-ai', roles: ['admin', 'auditor', 'owner'] },
  { name: 'Deletions', icon: TriangleAlertIcon, href: '/dashboard/deletion-requests', roles: OVERSIGHT_ROLES },
  { name: 'Reports', icon: ChartBarIcon, href: '/dashboard/reports', roles: ['admin', 'auditor'] },
  { name: 'Audit Log', icon: HistoryCircleIcon, href: '/dashboard/audit', roles: OVERSIGHT_ROLES },
  { name: 'Data Entry', icon: UploadIcon, href: '/dashboard/data_entry', roles: OPERATIONS_ROLES },
];

export const visibleMenuItems = (items: MenuItem[], role: string | null) =>
  items.filter((item) => role !== null && item.roles.includes(role));

export const bottomMenuItems: MenuItem[] = [
  { name: 'Account', icon: UserIcon, href: '/dashboard/account', roles: ['admin', 'auditor', 'owner'] },
  { name: 'Settings', icon: GearIcon, href: '/dashboard/settings', roles: ['admin', 'auditor', 'owner'] },
];

export const isRouteAllowed = (role: string | null, pathname: string | null) => {
  if (!pathname) return true;
  const match = [...menuItems, ...bottomMenuItems]
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!match) return true;
  return role !== null && match.roles.includes(role);
};
