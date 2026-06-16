export const TYPOGRAPHY = {
  fontBrand: 'var(--font-display)',    // Cinzel
  fontUI: 'var(--font-sans)',          // Inter
  fontCode: 'var(--font-mono)',        // JetBrains Mono

  // Size scale
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',

  // Weight
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '900',

  // Tracking
  tight: '-0.025em',
  normal_tracking: '0em',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.2em',
} as const;
