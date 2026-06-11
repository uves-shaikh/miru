export const Colors = {
  bg: '#0D0D0F',
  surface: '#1A1A1F',
  surfaceHigh: '#242429',
  border: '#2A2A30',
  accent: '#6366F1',
  accentSoft: '#818CF8',
  accentMuted: 'rgba(99,102,241,0.15)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#4B5563',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;
