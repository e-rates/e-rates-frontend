import {
  House,
  Percent,
  MapPin,
  UserX,
  BarChart3,
  Clock,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export const menuItems: MenuItem[] = [
  { name: 'Home', icon: House },
  { name: 'Rate Payments', icon: Percent },
  { name: 'Parcels Map', icon: MapPin },
  { name: 'Defaulters', icon: UserX },
  { name: 'Reports', icon: BarChart3 },
  { name: 'History', icon: Clock },
];

export const shortLabels: Record<string, string> = {
  Home: 'Home',
  'Rate Payments': 'Rates',
  'Parcels Map': 'Map',
  Defaulters: 'Defaulters',
  Reports: 'Reports',
  History: 'History',
};
