import {
  Earth,
  Eraser,
  Eye,
  GlobeLock,
  LucideIcon,
  RefreshCcw,
} from 'lucide-react';

export interface QuickAccessMenuItem {
  name: string;
  icon: LucideIcon;
  action?: () => void;
  requiresContext?: boolean;
}

export const QuickAccessMenuItems: QuickAccessMenuItem[] = [
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
  { name: 'Inspector', icon: Eye, requiresContext: true },
  { name: 'BaseMap', icon: Earth, requiresContext: true },
  { name: 'LockView', icon: GlobeLock, requiresContext: true },
];
