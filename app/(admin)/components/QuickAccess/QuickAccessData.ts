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
  Eraser,
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
  showExportMenu?: boolean; // Flag for items that show export submenu
}

export const QuickAccessMenuItems: QuickAccessMenuItem[] = [
  { name: 'Calculator', icon: Calculator, href: '/' },
  { name: 'Message', icon: MessageCircleMoreIcon, href: '/' },
  { name: 'Waivers', icon: Bird, href: '/' },
  { name: 'Clear Highlights', icon: Eraser, requiresContext: true },
  {
    name: 'Refresh',
    icon: RefreshCcw,
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
  },
  { name: 'ExportFile', icon: FileArchive, showExportMenu: true }, // Show export menu
  { name: 'Inspector', icon: Eye, requiresContext: true }, // Parcel Inspector Mode
  { name: 'BaseMap', icon: Earth, requiresContext: true }, // BaseMap toggle requires MapContext
  { name: 'LockView', icon: GlobeLock, requiresContext: true }, // LockView toggle requires MapContext
  { name: 'AddItems', icon: CircleFadingPlus, href: '/' },
];
