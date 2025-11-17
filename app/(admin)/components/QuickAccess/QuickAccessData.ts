import {
  Axis3d,
  Bird,
  Calculator,
  CircleFadingPlus,
  Earth,
  FileArchive,
  GlobeLock,
  Grid3x2,
  Eye,
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
  { name: 'Inspector', icon: Eye, requiresContext: true }, // Parcel Inspector Mode
  { name: 'BaseMap', icon: Earth, requiresContext: true }, // BaseMap toggle requires MapContext
  { name: 'LockView', icon: GlobeLock, requiresContext: true }, // LockView toggle requires MapContext
  { name: 'AddItems', icon: CircleFadingPlus, href: '/' },
];
