'use client';

interface LenisSmoothScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function LenisSmoothScroll({
  children,
  className = '',
}: LenisSmoothScrollProps) {
  return (
    <div
      className={className}
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
      }}
    >
      <div style={{ width: '100%' }}>{children}</div>
    </div>
  );
}
