import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  title2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  title3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
