'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface CollapsibleContextValue {
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(
  undefined
);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible');
  }
  return context;
};

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

    const handleToggle = React.useCallback(() => {
      const newState = !isOpen;
      setIsOpen(newState);
      onOpenChange?.(newState);
    }, [isOpen, onOpenChange]);

    return (
      <CollapsibleContext.Provider value={{ isOpen, onToggle: handleToggle }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ children, className, asChild = false, onClick, ...props }, ref) => {
  const { isOpen, onToggle } = useCollapsible();
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        onToggle();
      }}
      className={cn(asChild ? '' : 'w-full', className)}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </Comp>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ children, className, ...props }, ref) => {
  const { isOpen } = useCollapsible();

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden transition-all',
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
