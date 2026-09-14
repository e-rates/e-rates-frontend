'use client';

import Avatar from 'boring-avatars';

const palette = ['#007AFF', '#34C759', '#FF9500', '#5AC8FA', '#AF52DE'];

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ name, src, size = 32, className = '' }: UserAvatarProps) {
  const label = name ? `${name}'s profile picture` : 'Profile picture';

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`}
    >
      <Avatar name={name || 'user'} size={size} variant="beam" colors={palette} />
    </span>
  );
}
