import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Eraser,
  LucideIcon,
} from 'lucide-react';

export interface QuickToolItem {
  name: string;
  icon: LucideIcon;
  action: string;
}

export const QuickToolsItems: QuickToolItem[] = [
  { name: 'Zoom In', icon: ZoomIn, action: 'zoom-in' },
  { name: 'Zoom Out', icon: ZoomOut, action: 'zoom-out' },
  { name: 'Reset Zoom', icon: RotateCcw, action: 'reset-zoom' },
  { name: 'Clear Highlights', icon: Eraser, action: 'clear-highlights' },
  { name: 'Print', icon: Printer, action: 'print' },
];
