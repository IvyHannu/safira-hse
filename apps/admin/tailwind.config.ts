import type { Config } from 'tailwindcss';
import { colors, radius, spacing, typography } from '@safira/design-tokens';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([key, value]) => [key, `${value}px`]),
      ),
      borderRadius: Object.fromEntries(
        Object.entries(radius).map(([key, value]) => [key, `${value}px`]),
      ),
      fontFamily: { sans: [typography.fontFamily, 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
