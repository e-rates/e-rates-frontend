import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center">
      <div className="bg-hover-surface mb-1 flex h-10 w-10 items-center justify-center rounded-full">
        <Icon className="h-5 w-5 text-text-tertiary" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {message && (
        <p className="max-w-[24rem] text-xs text-text-tertiary">{message}</p>
      )}
    </div>
  );
}
