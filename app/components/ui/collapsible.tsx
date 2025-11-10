'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false);

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    const handleToggle = (newState: boolean) => {
      setIsOpen(newState);
      onOpenChange?.(newState);
    };

    return (
      <div ref={ref} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onToggle: handleToggle,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Collapsible.displayName = 'Collapsible';

// Omit any existing 'onToggle' from the native button props to avoid
// a type conflict with our simplified onToggle signature
interface CollapsibleTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ isOpen, onToggle, children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      onClick={() => onToggle?.(!isOpen)}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ isOpen, children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden transition-all',
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
