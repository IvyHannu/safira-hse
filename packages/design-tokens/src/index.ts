export const colors = {
  signalYellow: '#FFD21A',
  graphite: '#202220',
  deepCharcoal: '#121412',
  coolConcrete: '#E9EBE7',
  coolSurface: '#F6F7F5',
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

// Shared layout rhythm. Single source for page width, section rhythm,
// type scale, and control sizing so Admin + Worker stay aligned.
export const layout = {
  pageMaxWidth: 1120,
  narrowMaxWidth: 720,
  pagePaddingX: 16,
  pagePaddingY: 24,
  sectionGap: 24,
  cardGap: 16,
  contentMaxWidth: 768,
} as const;

export const typeScale = {
  pageTitle: { size: 22, lineHeight: 28, weight: 600 },
  sectionTitle: { size: 16, lineHeight: 24, weight: 600 },
  cardTitle: { size: 15, lineHeight: 22, weight: 600 },
  body: { size: 14, lineHeight: 21, weight: 400 },
  small: { size: 12, lineHeight: 18, weight: 400 },
} as const;

export const controls = {
  height: 36,
  paddingX: 12,
  radius: 8,
  fontSize: 14,
  fontWeight: 600,
} as const;

export const tokens = {
  colors,
  spacing,
  radius,
  typography,
  layout,
  typeScale,
  controls,
} as const;
