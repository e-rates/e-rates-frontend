import {
  Axis3d,
  Bird,
  Calculator,
  CircleFadingPlus,
  Earth,
  FileArchive,
  GlobeLock,
  Grid3x2,
  Grid3x3,
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
  href?: string;
  action?: () => void;
  isActive?: boolean;
  requiresContext?: boolean; // Flag for items that need context
}

export const QuickAccessMenuItems: QuickAccessMenuItem[] = [
  { name: 'Calculator', icon: Calculator, href: '/' },
  { name: 'Message', icon: MessageCircleMoreIcon, href: '/' },
  { name: 'Waivers', icon: Bird, href: '/' },
  { name: 'Parcels', icon: Grid3x2, href: '/' },
  {
    name: 'Refresh',
    icon: RefreshCcw,
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
  },
  { name: 'ExportFile', icon: FileArchive, href: '/' },
  { name: 'Grid', icon: Grid3x3, requiresContext: true }, // Grid toggle requires MapContext
  { name: 'BaseMap', icon: Earth, requiresContext: true }, // BaseMap toggle requires MapContext
  { name: 'LockView', icon: GlobeLock, requiresContext: true }, // LockView toggle requires MapContext
  { name: 'AddItems', icon: CircleFadingPlus, href: '/' },
];
