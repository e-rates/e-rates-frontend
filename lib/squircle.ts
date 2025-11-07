/**
 * Squircle/Smooth Corner Utilities
 */

export function generateSquirclePath(
  smoothing: number = 0.6,
  samples: number = 100
): string {
  const cornerRadius = smoothing * 0.15;
  const points: string[] = [];

  points.push(`M ${cornerRadius},0`);
  points.push(`L ${1 - cornerRadius},0`);
  points.push(`Q 1,0 1,${cornerRadius}`);
  points.push(`L 1,${1 - cornerRadius}`);
  points.push(`Q 1,1 ${1 - cornerRadius},1`);
  points.push(`L ${cornerRadius},1`);
  points.push(`Q 0,1 0,${1 - cornerRadius}`);
  points.push(`L 0,${cornerRadius}`);
  points.push(`Q 0,0 ${cornerRadius},0`);
  points.push('Z');

  return points.join(' ');
}

export const squirclePresets = {
  subtle: 0.2,
  moderate: 0.4,
  ios: 0.6,
  extreme: 0.8,
} as const;

export type SquirclePreset = keyof typeof squirclePresets;
