import {
  Axis3d,
  Bird,
  Calculator,
  CircleFadingPlus,
  Earth,
  FileArchive,
  GlobeLock,
  Grid3x2,
  LucideIcon,
  MessageCircleMore,
  MessageCircleMoreIcon,
  RefreshCcw,
  RotateCcwIcon,
  UndoDot,
} from 'lucide-react';

export interface QuickAccessMenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
}

export const QuickAccessMenuItems: QuickAccessMenuItem[] = [
  { name: 'Calculator', icon: Calculator, href: '/' },
  { name: 'Message', icon: MessageCircleMoreIcon, href: '/' },
  { name: 'Waivers', icon: Bird, href: '/' },
  { name: 'Parcels', icon: Grid3x2, href: '/' },
  { name: 'Refresh', icon: RefreshCcw, href: '/' },
  { name: 'ExportFile', icon: FileArchive, href: '/' },
  { name: 'Grid', icon: UndoDot, href: '/' },
  { name: 'BaseMap', icon: Earth, href: '/' },
  { name: 'LockView', icon: GlobeLock, href: '/' },
  { name: 'AddItems', icon: CircleFadingPlus, href: '/' },
];
