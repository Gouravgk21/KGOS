export const COLORS = {
  TEAL: '#006D77',
  TURQUOISE: '#00B4D8',
  GOLD: '#D4A017',

  INK: '#1A1A1A',
  CARBON: '#2E3A47',
  DRIFT: '#9A9590',

  ASH: '#F9F8F5',

  NIGHT: '#0B1220',
  STEEL: '#111827',
  DEEP: '#0F172A',

  SUCCESS: '#16A34A',
  WARNING: '#F59E0B',
  ERROR: '#DC2626',
} as const;

export type ColorKey = keyof typeof COLORS;

// Semantic color aliases for UI
export const SEMANTIC = {
  // Backgrounds
  bgPrimary: COLORS.NIGHT,
  bgSecondary: COLORS.STEEL,
  bgCard: COLORS.DEEP,
  bgElevated: '#1a2332',
  bgSidebar: '#021E26',

  // Borders
  borderSubtle: 'rgba(0, 180, 216, 0.08)',
  borderAccent: 'rgba(212, 160, 23, 0.20)',
  borderHover: 'rgba(0, 180, 216, 0.25)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textCode: COLORS.TURQUOISE,

  // Brand
  accentTeal: COLORS.TEAL,
  accentTurquoise: COLORS.TURQUOISE,
  accentGold: COLORS.GOLD,
  accentGoldMuted: 'rgba(212, 160, 23, 0.15)',

  // Status
  success: COLORS.SUCCESS,
  warning: COLORS.WARNING,
  error: COLORS.ERROR,
} as const;
