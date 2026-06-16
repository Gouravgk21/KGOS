import { COLORS, SEMANTIC } from './colors';
import { TYPOGRAPHY } from './typography';
import { SPACING } from './spacing';
import { MOTION } from './motion';
import { SHADOWS } from './shadows';

export const theme = {
  colors: COLORS,
  semantic: SEMANTIC,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  motion: MOTION,
  shadows: SHADOWS,
} as const;

export type Theme = typeof theme;
