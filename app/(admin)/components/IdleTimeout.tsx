'use client';

import { useEffect, useRef, useState } from 'react';
import { endSession } from '@/lib/auth';
import { DEFAULT_PREFERENCES, readPreferences, type Preferences } from './usePreferences';

const ACTIVITY = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

/** Signs a rates officer out after the inactivity period they chose in Settings. */
export function IdleTimeout() {
  const [minutes, setMinutes] = useState(DEFAULT_PREFERENCES.sessionTimeoutMinutes);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMinutes(readPreferences().sessionTimeoutMinutes);
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Preferences>).detail?.sessionTimeoutMinutes;
      if (typeof next === 'number') {
        queueMicrotask(() => setMinutes(next));
      }
    };
    window.addEventListener('erates:preferences', onChange);
    return () => window.removeEventListener('erates:preferences', onChange);
  }, []);

  useEffect(() => {
    if (!minutes) return; // "Never"

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(endSession, minutes * 60_000);
    };

    reset();
    ACTIVITY.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      ACTIVITY.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [minutes]);

  return null;
}
