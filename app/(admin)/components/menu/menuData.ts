import {
  House,
  Percent,
  MapPin,
  UserX,
  BarChart3,
  Clock,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
}

export const menuItems: MenuItem[] = [
  { name: 'Home', icon: House, href: '/dashboard/home' },
  { name: 'Rate Payments', icon: Percent, href: '/dashboard/rate-payments' },
  { name: 'Parcels Map', icon: MapPin, href: '/dashboard/parcels-map' },
  { name: 'Defaulters', icon: UserX, href: '/dashboard/defaulters' },
  { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
  { name: 'History', icon: Clock, href: '/dashboard/history' },
];

export const bottomMenuItems: MenuItem[] = [
  { name: 'Account', icon: User, href: '/dashboard/account' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export const shortLabels: Record<string, string> = {
  Home: 'Home',
  'Rate Payments': 'Rates',
  'Parcels Map': 'Map',
  Defaulters: 'Defaulters',
  Reports: 'Reports',
  History: 'History',
  Account: 'Account',
  Settings: 'Settings',
};
