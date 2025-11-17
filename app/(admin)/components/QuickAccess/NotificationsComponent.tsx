'use client';

import { User2Icon } from 'lucide-react';
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
        <h1 className="text-medium-md tracking-normal">Notifications</h1>
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
        <div className="space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="squircle-xl border-border-default flex h-fit w-full flex-row space-x-2 border-[0.5px] bg-emerald-400/10 px-2 pt-2 pb-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex w-full flex-col">
                {/*  */}
                <div className="flex w-full flex-row items-center justify-start space-x-2">
                  {/* <div className="squircle-xl flex h-full w-[50px] flex-col items-center justify-center">
                    <User2Icon className="h-6 w-6" />
                  </div> */}
                  <p className="text-regular-md tracking-tight">
                    {notification.user}
                  </p>
                  {/*  */}
                </div>
                {/*  */}
                <div className="flex w-full flex-row items-center justify-start space-x-2">
                  <p className="text-regular-md space-x-2 tracking-tight">
                    <span>P.NO</span>
                    <span>{notification.parcel}</span>
                  </p>
                  <p className="text-body-md tracking-tight">
                    {notification.location}
                  </p>
                </div>
                {/*  */}
                <div className="flex h-full flex-col items-start justify-center">
                  <p className="text-regular-md tracking-tight">
                    {notification.message}
                  </p>
                </div>
              </div>
              {/* {!notification.read && (
                <div className="flex h-full items-start justify-center pt-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
