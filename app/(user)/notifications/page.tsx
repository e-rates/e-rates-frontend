'use client';

import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle2,
      title: 'Payment Received',
      message: 'Your rate payment for Plot #12345 has been confirmed',
      time: '2 hours ago',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      id: 2,
      type: 'warning',
      icon: Clock,
      title: 'Payment Due Soon',
      message: 'Your next rate payment is due in 5 days',
      time: '1 day ago',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      id: 3,
      type: 'info',
      icon: CheckCircle2,
      title: 'Waiver Approved',
      message: 'Your waiver request has been approved',
      time: '3 days ago',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Notifications
        </h2>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 rounded-full p-2 ${notification.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                      {notification.time}
                    </p>
                  </div>
                </div>

                {/* Subtle gradient overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-neutral-900/0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
