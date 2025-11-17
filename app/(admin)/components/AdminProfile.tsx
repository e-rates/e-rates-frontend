'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
} from 'lucide-react';
import { userService } from '@/lib/auth';
import ProfilePicture from '@/app/components/ProfilePicture';

interface AdminProfile {
  user_id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
}

const AdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        } else if (response.user_id) {
          // Direct API response without wrapper
          setProfile(response);
        } else {
          setError(response.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="squircle-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="squircle-lg bg-neutral-50 p-4 dark:bg-neutral-800">
        <div className="text-neutral-600 dark:text-neutral-400">
          No profile data found
        </div>
      </div>
    );
  }

  return (
    <div className="squircle-xl bg-white p-6 shadow-lg dark:bg-neutral-900">
      <div className="mb-6 flex items-center space-x-3">
        <Crown className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Admin Profile
        </h2>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-8">
        <ProfilePicture
          profilePicture={profile.profile_picture}
          username={profile.username}
          role={profile.role}
          isAdmin={true}
          onImageChange={(file) => {
            // Handle image upload here
            console.log('Image selected:', file.name);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Username
              </p>
              <p className="text-neutral-900 dark:text-white">
                {profile.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Email
              </p>
              <p className="text-neutral-900 dark:text-white">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Phone
              </p>
              <p className="text-neutral-900 dark:text-white">
                {profile.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Member Since
              </p>
              <p className="text-neutral-900 dark:text-white">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Role
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-neutral-900 capitalize dark:text-white">
                  {profile.role}
                </p>
                {profile.role === 'admin' && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {profile.is_verified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Verification Status
              </p>
              <p
                className={`${profile.is_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {profile.is_verified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {profile.is_active ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Account Status
              </p>
              <p
                className={`${profile.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {profile.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {profile.is_staff !== undefined && (
            <div className="flex items-center space-x-3">
              {profile.is_staff ? (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              ) : (
                <XCircle className="h-5 w-5 text-neutral-400" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Staff Status
                </p>
                <p
                  className={`${profile.is_staff ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {profile.is_staff ? 'Staff Member' : 'Not Staff'}
                </p>
              </div>
            </div>
          )}

          {profile.is_superuser !== undefined && (
            <div className="flex items-center space-x-3">
              {profile.is_superuser ? (
                <Crown className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-neutral-400" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Superuser Status
                </p>
                <p
                  className={`${profile.is_superuser ? 'text-yellow-600 dark:text-yellow-400' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {profile.is_superuser ? 'Superuser' : 'Regular Admin'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <div className="grid grid-cols-1 gap-4 text-xs text-neutral-500 md:grid-cols-2 dark:text-neutral-400">
          <p>User ID: {profile.user_id}</p>
          <p>Last Updated: {new Date(profile.updated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
