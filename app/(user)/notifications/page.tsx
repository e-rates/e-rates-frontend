'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BadgePercent,
  Bell,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { backendJson } from '@/lib/backend';
import { formatDate, formatMoney, timeAgo } from '@/lib/format';
import { parcelOf, type Paginated, type Payment } from '@/lib/payments';
import type { MyWaiver } from '@/lib/rates';

interface NotificationItem {
  id: string;
  icon: LucideIcon;
  tone: string;
  title: string;
  message: string;
  time: string;
  href?: string;
}

const toWaiverNotification = (w: MyWaiver): NotificationItem => ({
  id: `waiver-${w.waiver_id}`,
  icon: BadgePercent,
  tone: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  title: `${Number(w.percent)}% waiver available`,
  message: `${w.county} is offering ${w.name} on plot ${w.plots.filter((p) => !w.claimed_plots.includes(p)).join(', ')}. Claim it to reduce your bill.`,
  time: timeAgo(w.created_at),
  href: '/waivers',
});

const toNotification = (p: Payment): NotificationItem => {
  const amount = formatMoney(p.amount, p.currency);
  const parcel = parcelOf(p) ? ` for plot ${parcelOf(p)}` : '';
  const base = { id: p.payment_id, time: timeAgo(p.updated_at || p.created_at) };
  switch (p.status) {
    case 'completed':
      return { ...base, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400', title: 'Payment received', message: `Your payment of ${amount}${parcel} was confirmed.` };
    case 'refunded':
      return { ...base, icon: RotateCcw, tone: 'text-neutral-600 bg-neutral-500/10 dark:text-neutral-300', title: 'Payment refunded', message: `${amount}${parcel} was refunded.` };
    case 'failed':
      return { ...base, icon: XCircle, tone: 'text-red-600 bg-red-500/10 dark:text-red-400', title: 'Payment failed', message: `Your payment of ${amount}${parcel} did not go through.` };
    default:
      if (p.is_defaulter) {
        return { ...base, icon: AlertCircle, tone: 'text-red-600 bg-red-500/10 dark:text-red-400', title: 'Payment overdue', message: `${amount}${parcel} is ${p.days_overdue ?? 0} day(s) overdue.` };
      }
      return {
        ...base,
        icon: Clock,
        tone: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
        title: p.deadline ? 'Payment due' : 'Payment pending',
        message: p.deadline ? `${amount}${parcel} is due on ${formatDate(p.deadline)}.` : `${amount}${parcel} is awaiting confirmation.`,
      };
  }
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      backendJson<Paginated<Payment>>('/api/payments/?ordering=-updated_at'),
      backendJson<MyWaiver[]>('/api/waivers/mine/'),
    ])
      .then(([page, waivers]) =>
        setItems([
          ...waivers.filter((w) => w.status !== 'ended' && w.plots.some((p) => !w.claimed_plots.includes(p))).map(toWaiverNotification),
          ...page.results.map(toNotification),
        ])
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Notifications
        </h2>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : !items ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="squircle-2xl flex flex-col items-center gap-2 border border-dashed border-neutral-200 px-6 py-14 text-center dark:border-neutral-700">
            <Bell className="h-6 w-6 text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">You’re all caught up</p>
            <p className="text-xs text-neutral-500">Payment confirmations and due dates will appear here.</p>
          </div>
        ) : (
          <div className="squircle-2xl divide-y divide-neutral-200 overflow-hidden border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <div className={`shrink-0 rounded-full p-2 ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</p>
                      <span className="shrink-0 text-xs text-neutral-500">{item.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{item.message}</p>
                    {item.href && (
                      <Link href={item.href} className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                        Claim waiver →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
