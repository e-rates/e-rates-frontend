'use client';

import { Toaster, resolveValue, Toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useSpring, animated } from '@react-spring/web';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

// Custom animated toast component using React Spring
function AnimatedToast({ toast }: { toast: Toast }) {
  const { theme } = useTheme();

  const springStyle = useSpring({
    from: {
      opacity: 0,
      transform: 'translate3d(0, -40px, 0) scale(0.9)',
    },
    to: {
      opacity: toast.visible ? 1 : 0,
      transform: toast.visible
        ? 'translate3d(0, 0, 0) scale(1)'
        : 'translate3d(0, -10px, 0) scale(0.9)',
    },
    config: {
      mass: 1, // You can also add mass to make it feel "heavier"
      tension: 280, // Slightly lower tension
      friction: 40, // Much higher friction to smooth it out
      clamp: false,
    },
  });

  // Determine which icon to show based on toast type
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-[#2bc76f]" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-[#ff4757]" />;
      case 'loading':
        return <Info className="h-5 w-5 text-[#3742fa]" />;
      default:
        return <AlertCircle className="h-5 w-5 text-[#ffa502]" />;
    }
  };

  return (
    <animated.div
      style={{
        ...springStyle,
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#0d0d0d',
        border: theme === 'dark' ? '1px solid #3d3d3d' : '1px solid #e0e0e0',
        fontSize: '14px',
        fontWeight: '500',
        padding: '16px',
        borderRadius: '12px',
        boxShadow:
          theme === 'dark'
            ? '0 4px 12px rgba(0, 0, 0, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Render Lucide icon based on toast type */}
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {getIcon()}
      </span>

      {/* Render the message */}
      <div style={{ flex: 1 }}>{resolveValue(toast.message, toast)}</div>
    </animated.div>
  );
}

export function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        // Toast duration in milliseconds
        duration: 5000,

        // Default style applied to all toasts
        style: {
          background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#0d0d0d',
          border: theme === 'dark' ? '1px solid #3d3d3d' : '1px solid #e0e0e0',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
          borderRadius: '12px',
          boxShadow:
            theme === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.5)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
        },

        // Success toast styles
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#2bc76f',
            secondary: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          },
        },

        // Error toast styles
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ff4757',
            secondary: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          },
        },
      }}
    >
      {(t) => <AnimatedToast toast={t} />}
    </Toaster>
  );
}
