export const MOTION = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    xslow: '500ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    ease: 'ease-in-out',
  },
} as const;
