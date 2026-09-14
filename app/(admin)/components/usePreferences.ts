'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'eratesPreferences';

export interface Preferences {
  /** Minutes of inactivity before sign-out; 0 means never. */
  sessionTimeoutMinutes: number;
  /** Show a desktop alert when a payment is confirmed. */
  browserNotifications: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  sessionTimeoutMinutes: 30,
  browserNotifications: false,
};

export function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Preferences live per browser, so every read and write has to survive blocked storage. */
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPreferences(readPreferences());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* blocked storage: the change still applies for this page */
      }
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('erates:preferences', { detail: next }));
        });
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      window.dispatchEvent(new CustomEvent('erates:preferences', { detail: DEFAULT_PREFERENCES }));
    } catch {
      /* nothing to clear */
    }
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, update, reset, loaded };
}
