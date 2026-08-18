// ─────────────────────────────────────────────────────────────
// Z-AI Design Tokens — Typography
// Fonts: Inter (UI) + JetBrains Mono (data/terminal)
// ─────────────────────────────────────────────────────────────
import { TextStyle } from 'react-native';

// Font family names — must match expo-google-fonts export names
export const Fonts = {
  inter:            'Inter_400Regular',
  interSemiBold:    'Inter_600SemiBold',
  interBold:        'Inter_700Bold',
  interExtraBold:   'Inter_800ExtraBold',
  jetbrainsMono:    'JetBrainsMono_400Regular',
  jetbrainsMonoBold:'JetBrainsMono_700Bold',
} as const;

export type FontToken = keyof typeof Fonts;

// Text style presets — use these in StyleSheet, never raw numbers
export const Typography: Record<string, TextStyle> = {
  // Large holographic display (ZAYD core label)
  displayLg: {
    fontFamily:    Fonts.interBold,
    fontSize:      48,
    lineHeight:    56,
    letterSpacing: -0.96,
    fontWeight:    '700',
  },

  // Section headings (screen titles, card titles)
  headlineMd: {
    fontFamily:    Fonts.interSemiBold,
    fontSize:      24,
    lineHeight:    32,
    letterSpacing: 2.4,
    fontWeight:    '600',
  },

  // Mobile-optimised heading
  headlineMdMobile: {
    fontFamily:    Fonts.interSemiBold,
    fontSize:      20,
    lineHeight:    28,
    fontWeight:    '600',
  },

  // Body copy (card descriptions, general text)
  bodySm: {
    fontFamily:    Fonts.inter,
    fontSize:      14,
    lineHeight:    20,
    fontWeight:    '400',
  },

  // Terminal / data readouts (mono)
  dataMono: {
    fontFamily:    Fonts.jetbrainsMono,
    fontSize:      14,
    lineHeight:    20,
    letterSpacing: 0.7,
    fontWeight:    '400',
  },

  // Smaller mono (status values, hex codes)
  dataMonoSm: {
    fontFamily:    Fonts.jetbrainsMono,
    fontSize:      11,
    lineHeight:    16,
    letterSpacing: 0.5,
    fontWeight:    '400',
  },

  // Extra small mono (decorative HUD labels)
  dataMonoXs: {
    fontFamily:    Fonts.jetbrainsMono,
    fontSize:      10,
    lineHeight:    14,
    letterSpacing: 0.4,
    fontWeight:    '400',
  },

  // Uppercase tracking label (ALL CAPS section labels)
  labelCaps: {
    fontFamily:    Fonts.interExtraBold,
    fontSize:      11,
    lineHeight:    16,
    letterSpacing: 2.2,
    fontWeight:    '800',
    textTransform: 'uppercase',
  },

  // Tiny uppercase label (9-10px decorative)
  labelCapsXs: {
    fontFamily:    Fonts.interExtraBold,
    fontSize:      9,
    lineHeight:    12,
    letterSpacing: 1.8,
    fontWeight:    '800',
    textTransform: 'uppercase',
  },
} as const;
