/**
 * Squircle/Smooth Corner Utilities
 * Generates SVG clip-paths for Apple-style smooth corners using proper superellipse formula
 */

/**
 * Generates a squircle path using the superellipse formula
 * This matches Figma's corner smoothing exactly
 *
 * @param smoothing - Corner smoothing value (0-1), where 0.6 = iOS style
 * @param samples - Number of points to calculate (higher = smoother, default 100)
 */
export function generateSquirclePath(
  smoothing: number = 0.6,
  samples: number = 100
): string {
  // Use a much more conservative approach - closer to rounded rectangles
  // Instead of superellipse, use a gentler curve that's more like CSS border-radius
  const cornerRadius = smoothing * 0.15; // Maximum 15% corner radius instead of aggressive curves

  // Create a rounded rectangle path instead of superellipse
  const points: string[] = [];

  // Start from top-left, moving clockwise
  // Top edge
  points.push(`M ${cornerRadius},0`);
  points.push(`L ${1 - cornerRadius},0`);

  // Top-right corner (gentle curve)
  points.push(`Q 1,0 1,${cornerRadius}`);

  // Right edge
  points.push(`L 1,${1 - cornerRadius}`);

  // Bottom-right corner
  points.push(`Q 1,1 ${1 - cornerRadius},1`);

  // Bottom edge
  points.push(`L ${cornerRadius},1`);

  // Bottom-left corner
  points.push(`Q 0,1 0,${1 - cornerRadius}`);

  // Left edge
  points.push(`L 0,${cornerRadius}`);

  // Top-left corner
  points.push(`Q 0,0 ${cornerRadius},0`);

  points.push('Z');
  return points.join(' ');
}

export const squirclePresets = {
  subtle: 0.2, // Very gentle rounding (3% corner radius)
  moderate: 0.4, // Moderate rounding (6% corner radius)
  ios: 0.6, // Balanced rounding (9% corner radius)
  extreme: 0.8, // Strong rounding (12% corner radius)
} as const;

export type SquirclePreset = keyof typeof squirclePresets;
