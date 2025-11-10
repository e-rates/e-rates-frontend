'use client';

import { useState } from 'react';
import { User, Crown, Camera, Upload } from 'lucide-react';

interface ProfilePictureProps {
  profilePicture?: string | null;
  username: string;
  role: string;
  isAdmin?: boolean;
  onImageChange?: (file: File) => void;
}

const ProfilePicture = ({
  profilePicture,
  username,
  role,
  isAdmin = false,
  onImageChange,
}: ProfilePictureProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Call parent handler if provided
      if (onImageChange) {
        onImageChange(file);
      }
    }
  };

  const getDefaultAvatar = () => {
    // Return different default avatars based on role
    if (isAdmin) {
      return '/avatar.svg'; // Default admin avatar
    }
    return '/avatar.svg'; // Default user avatar
  };

  const displayImage = previewUrl || profilePicture || getDefaultAvatar();
  const gradientColors = isAdmin
    ? 'from-blue-500 to-purple-600'
    : 'from-green-500 to-emerald-600';

  const iconColor = isAdmin ? 'text-yellow-500' : 'text-green-600';
  const buttonColor = isAdmin
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
      <div className="relative">
        <div
          className={`h-24 w-24 overflow-hidden rounded-full bg-gradient-to-r ${gradientColors} p-0.5`}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-neutral-800">
            {displayImage === '/avatar.svg' ? (
              // Show SVG avatar for users, Crown icon for admins
              isAdmin ? (
                <Crown className={`h-8 w-8 ${iconColor}`} />
              ) : (
                <img
                  src="/avatar.svg"
                  alt={`${username}'s profile`}
                  className="h-full w-full rounded-full object-cover"
                />
              )
            ) : (
              // Show actual uploaded image
              <img
                src={displayImage}
                alt={`${username}'s profile`}
                className="h-full w-full rounded-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Upload button */}
        <label
          htmlFor="profile-upload"
          className={`absolute -right-1 -bottom-1 cursor-pointer rounded-full ${buttonColor} p-2 text-white shadow-lg transition-colors`}
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </label>

        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="text-center md:text-left">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {username}
        </h3>
        <p className="text-sm text-neutral-600 capitalize dark:text-neutral-400">
          {role} {isAdmin && '• Administrator'}
        </p>

        <div className="mt-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <label
            htmlFor="profile-upload"
            className="cursor-pointer rounded-lg bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Upload className="mr-1 inline h-3 w-3" />
            Change Picture
          </label>

          {(previewUrl || profilePicture) && (
            <button
              onClick={() => {
                setPreviewUrl(null);
                // Could call onImageChange with null to remove image
              }}
              className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
            >
              Remove
            </button>
          )}
        </div>

        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Max 5MB • JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default ProfilePicture;
