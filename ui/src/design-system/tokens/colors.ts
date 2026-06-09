export const colors = {
  background: '#FAF8F4',
  backgroundElevated: '#FFFFFF',

  surface: '#FFFFFF',
  surfaceMuted: '#F1EDE6',
  surfaceSoft: '#F7F3EC',

  textPrimary: '#1C1C1E',
  textSecondary: '#6E6A64',
  textMuted: '#9A948B',
  textInverse: '#FFFFFF',

  border: '#E5DED4',
  borderSoft: '#EFE7DD',

  accent: '#0F3D3E',
  accentHover: '#0B3132',
  accentSoft: '#E7F0ED',

  gold: '#B89B5E',
  goldSoft: '#F3EBD7',

  success: '#2F6F4E',
  successSoft: '#E7F3EC',

  warning: '#B7791F',
  warningSoft: '#FFF4DD',

  danger: '#B42318',
  dangerSoft: '#FDECEC',
} as const;

export type ColorToken = keyof typeof colors;
