'use client';

import { User2Icon, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  user: string;
  location: string;
  timestamp: string;
  read: boolean;
  parcel: string;
}

interface NotificationsComponentProps {
  className?: string;
}

export function NotificationsComponent({
  className = '',
}: NotificationsComponentProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications from backend
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/notifications');
        // const data = await response.json();

        // Mock data for now - replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Payment Received',
            message: 'Payment received for John Kimathi',
            user: 'John Kimathi',
            location: 'Nyeri County',
            parcel: '343',

            timestamp: new Date().toISOString(),
            read: false,
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Don't render if no notifications and not loading
  if (!loading && notifications.length === 0) {
    return null;
  }

  return (
    <div className={`border-border-default border-t-[0.5px] pt-2 ${className}`}>
      <div className="px-2">
        <h1 className="text-medium-md tracking-normal text-text-primary">Notifications</h1>
      </div>

      {loading ? (
        <div className="squircle-xl bg-elevated-surface border-border-default flex h-[60px] w-full animate-pulse flex-row space-x-2 border-[0.5px]">
          <div className="squircle-xl flex h-full w-[50px] flex-col items-center justify-center">
            <div className="h-6 w-6 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="flex w-full flex-col justify-center space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-2 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="squircle-2xl group relative overflow-hidden border-[0.5px] border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              {/* Subtle shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative p-4 space-y-2">
                {/* Header with icon */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                      {notification.user}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                  )}
                </div>

                {/* Parcel info */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-300">
                    PNO {notification.parcel}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-400 dark:bg-neutral-600"></span>
                  <span className="text-gray-600 dark:text-neutral-400">
                    {notification.location}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
                  {notification.message}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
