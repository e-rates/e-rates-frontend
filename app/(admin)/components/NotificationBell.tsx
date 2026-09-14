'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, Bell } from 'lucide-react';
import { backendJson } from '@/lib/backend';
import { formatMoney, timeAgo } from '@/lib/format';
import { paidAt, parcelOf, type Paginated, type Payment } from '@/lib/payments';

const LAST_SEEN_KEY = 'notifications_last_seen';
const REFRESH_MS = 60_000;

const readLastSeen = () => {
  try {
    return Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
  } catch {
    return 0;
  }
};

const writeLastSeen = (value: number) => {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(value));
  } catch {}
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSeen, setLastSeen] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const page = await backendJson<Paginated<Payment>>(
        '/api/payments/?status=completed&ordering=-updated_at'
      );
      setPayments(page.results.slice(0, 8));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    setLastSeen(readLastSeen());
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const unread = (payments ?? []).filter(
    (p) => new Date(paidAt(p)).getTime() > lastSeen
  ).length;

  const toggle = () => {
    if (!open) {
      const now = Date.now();
      writeLastSeen(now);
      setTimeout(() => setLastSeen(now), 600);
      load();
    }
    setOpen((value) => !value);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="hover:bg-hover-surface relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary"
      >
        <motion.span
          key={unread}
          animate={unread ? { rotate: [0, -14, 12, -8, 6, 0] } : undefined}
          transition={{ duration: 0.6 }}
          className="flex"
        >
          <Bell className="h-[18px] w-[18px]" />
        </motion.span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-[var(--main-bg)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="border-border-default bg-card-bg absolute top-full right-0 z-[100002] mt-2 w-80 overflow-hidden rounded-2xl border-[0.5px] shadow-xl"
          >
            <div className="border-border-default flex items-baseline justify-between border-b-[0.5px] px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">Notifications</p>
              <span className="text-xs text-text-tertiary">Completed payments</span>
            </div>

            {error ? (
              <p className="px-4 py-6 text-center text-xs text-text-tertiary">
                Couldn’t load notifications.
              </p>
            ) : !payments ? (
              <div className="space-y-3 p-4">
                {[0, 1].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3">
                    <div className="bg-hover-surface h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="bg-hover-surface h-2.5 w-2/3 rounded" />
                      <div className="bg-hover-surface h-2 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
                <div className="bg-hover-surface mb-1 flex h-10 w-10 items-center justify-center rounded-full">
                  <Bell className="h-5 w-5 text-text-tertiary" />
                </div>
                <p className="text-sm font-medium text-text-secondary">You’re all caught up</p>
                <p className="text-xs text-text-tertiary">
                  Completed rate payments will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-border-default max-h-96 divide-y-[0.5px] overflow-y-auto">
                {payments.map((payment) => {
                  const isNew = new Date(paidAt(payment)).getTime() > lastSeen;
                  return (
                    <li
                      key={payment.payment_id}
                      className="hover:bg-hover-surface flex items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Banknote className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-primary">
                          <span className="font-medium">{payment.user_username}</span> paid{' '}
                          <span className="font-medium tabular-nums">
                            {formatMoney(payment.amount, payment.currency)}
                          </span>
                        </p>
                        <p className="truncate text-xs text-text-tertiary">
                          {parcelOf(payment) ? `Plot ${parcelOf(payment)}` : 'Rate payment'}
                          {payment.payment_year ? ` · ${payment.payment_year} rates` : ''} · {timeAgo(paidAt(payment))}
                        </p>
                      </div>
                      {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-[#007AFF]" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
