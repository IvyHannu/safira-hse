export const colors = {
  graphite: '#242522',
  softBlack: '#171816',
  saffron: '#D8A617',
  warmBone: '#F4F1E9',
  white: '#FFFFFF',
  success: '#267A53',
  warning: '#A66A00',
  critical: '#B43732',
  information: '#2563A6',
} as const;

export const spacing = {
  0: 0,
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
} as const;

export const radius = { sm: 4, md: 8, lg: 12, xl: 16 } as const;
export const typography = { fontFamily: 'Inter' } as const;

export const tokens = { colors, spacing, radius, typography } as const;
