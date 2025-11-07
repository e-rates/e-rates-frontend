'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function AccountPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-text-primary mb-2 text-3xl font-bold">
              Account Settings
            </h1>
            <p className="text-text-secondary text-sm">
              Manage your profile and account preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-card-bg border-border-default mb-6 rounded-lg border p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
                <User className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-text-primary text-xl font-semibold">
                  John Doe
                </h2>
                <p className="text-text-secondary text-sm">Administrator</p>
              </div>
              <Button variant="outline">Change Photo</Button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="text-text-tertiary h-5 w-5" />
                <div className="flex-1">
                  <p className="text-text-secondary text-xs">Email</p>
                  <p className="text-text-primary text-sm font-medium">
                    john.doe@example.com
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="text-text-tertiary h-5 w-5" />
                <div className="flex-1">
                  <p className="text-text-secondary text-xs">Phone</p>
                  <p className="text-text-primary text-sm font-medium">
                    +263 123 456 789
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="text-text-tertiary h-5 w-5" />
                <div className="flex-1">
                  <p className="text-text-secondary text-xs">Location</p>
                  <p className="text-text-primary text-sm font-medium">
                    Harare, Zimbabwe
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="text-primary h-6 w-6" />
              <h2 className="text-text-primary text-xl font-semibold">
                Security
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    Password
                  </p>
                  <p className="text-text-secondary text-xs">
                    Last changed 3 months ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-text-secondary text-xs">Not enabled</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
