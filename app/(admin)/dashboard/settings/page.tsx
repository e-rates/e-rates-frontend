'use client';

import React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BUTTON, ControlRow, Row, SELECT, Section, ToggleRow } from '../../components/forms/Section';
import { usePreferences } from '../../components/usePreferences';

const TIMEOUTS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 0, label: 'Never' },
];

const CACHE_KEYS = ['mapState', 'countyName'];

export default function SettingsPage() {
  const { preferences, update, reset, loaded } = usePreferences();

  const enableBrowserNotifications = async (next: boolean) => {
    if (!next) {
      update({ browserNotifications: false });
      return;
    }
    if (typeof Notification === 'undefined') {
      toast.error('This browser cannot show desktop notifications.');
      return;
    }
    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Chrome blocked notifications for this site. Allow them in site settings.');
      return;
    }
    update({ browserNotifications: true });
    toast.success('Desktop alerts on for confirmed payments.');
  };

  const clearCache = () => {
    try {
      CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
      toast.success('Cached map data cleared. It reloads on the next map view.');
    } catch {
      toast.error('This browser is blocking local storage.');
    }
  };

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto px-6 pb-10">
      <div className="border-border-default border-b-[0.5px] py-6">
        <h1 className="text-text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          Preferences for this browser. They are not shared with other rates officers.
        </p>
      </div>

      <Section title="Account" description="Your username, contact details and password.">
        <ControlRow label="Your profile" hint="Email, phone number and password are managed on the Account page.">
          <Link href="/dashboard/account" className={`${BUTTON} flex items-center`}>
            Open account
          </Link>
        </ControlRow>
      </Section>

      <Section title="Regional" description="How amounts and times are shown across the dashboard.">
        <dl>
          <Row label="Currency" value="Kenyan shilling (KES)" />
          <Row label="Time zone" value="Africa/Nairobi (EAT, GMT+3)" />
          <Row label="Rating year" value="Calendar year, per the county rates gazette" />
        </dl>
        <p className="text-text-tertiary mt-3 text-xs">
          Fixed for Kenyan land rates. Payment timestamps and deadlines use this zone.
        </p>
      </Section>

      <Section title="Security" description="How long a session lasts before it signs you out.">
        <ControlRow label="Session timeout" hint="Sign out automatically after this much inactivity.">
          <select
            aria-label="Session timeout"
            value={preferences.sessionTimeoutMinutes}
            disabled={!loaded}
            onChange={(e) => update({ sessionTimeoutMinutes: Number(e.target.value) })}
            className={SELECT}
          >
            {TIMEOUTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </ControlRow>
        <ControlRow
          label="Activity logging"
          hint="Always on. Every action is recorded for rates compliance and cannot be disabled."
        >
          <Link href="/dashboard/audit" className={`${BUTTON} flex items-center`}>
            View Audit Log
          </Link>
        </ControlRow>
      </Section>

      <Section title="Notifications" description="Desktop alerts when a payment is confirmed.">
        <ToggleRow
          label="Browser notifications"
          hint="Show a desktop alert when an M-Pesa payment clears."
          checked={preferences.browserNotifications}
          disabled={!loaded}
          onChange={enableBrowserNotifications}
        />
      </Section>

      <Section title="Data" description="Reports and locally cached map data.">
        <ControlRow label="Rates reports" hint="Collections, arrears and the valuation register, as PDF or Excel.">
          <Link href="/dashboard/reports" className={`${BUTTON} flex items-center`}>
            Go to Reports
          </Link>
        </ControlRow>
        <ControlRow label="Cached map data" hint="Clears the saved map position so parcels reload fresh.">
          <button onClick={clearCache} className={BUTTON}>
            Clear cache
          </button>
        </ControlRow>
      </Section>

      <div className="flex items-center justify-between gap-8 py-6">
        <p className="text-text-tertiary text-xs">Changes above save as you make them.</p>
        <button
          onClick={() => {
            reset();
            toast.success('Preferences reset to defaults.');
          }}
          className={BUTTON}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
