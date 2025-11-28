'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Database,
  Palette,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/theme-toggle';
import AdminProfile from '../../components/AdminProfile';

export default function SettingsPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-text-primary mb-2 text-3xl font-bold">
              System Settings
            </h1>
            <p className="text-text-secondary text-sm">
              Configure your application preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <div className="squircle-lg bg-card-bg border-border-default border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Palette className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Appearance
                </h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-sm font-medium">Theme</p>
                  <p className="text-text-secondary text-xs">
                    Choose your preferred color scheme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Notifications */}
            <div className="squircle-lg bg-card-bg border-border-default border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Bell className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Notifications
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Email Notifications
                    </p>
                    <p className="text-text-secondary text-xs">
                      Receive updates via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Push Notifications
                    </p>
                    <p className="text-text-secondary text-xs">
                      Get browser notifications
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded" />
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="squircle-lg bg-card-bg border-border-default border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Globe className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Regional Settings
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary mb-1 text-sm font-medium">
                      Currency
                    </p>
                    <select className="bg-white dark:bg-neutral-800/30 border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-4 py-2 text-sm focus:outline-none">
                      <option>USD ($)</option>
                      <option>ZWL (Z$)</option>
                      <option>ZAR (R)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary mb-1 text-sm font-medium">
                      Time Zone
                    </p>
                    <select className="bg-white dark:bg-neutral-800/30 border-border-default text-text-primary focus:border-primary w-full rounded-lg border px-4 py-2 text-sm focus:outline-none">
                      <option>Africa/Harare (GMT+2)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-card-bg border-border-default rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Shield className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Privacy & Security
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Activity Logging
                    </p>
                    <p className="text-text-secondary text-xs">
                      Track all system activities
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Session Timeout
                    </p>
                    <p className="text-text-secondary text-xs">
                      Auto-logout after inactivity
                    </p>
                  </div>
                  <select className="bg-white dark:bg-neutral-800/30 border-border-default text-text-primary focus:border-primary rounded-lg border px-4 py-2 text-sm focus:outline-none">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-card-bg border-border-default rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <Database className="text-primary h-5 w-5" />
                <h2 className="text-text-primary text-lg font-semibold">
                  Data Management
                </h2>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
              </div>
            </div>

            {/* Save Changes */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
