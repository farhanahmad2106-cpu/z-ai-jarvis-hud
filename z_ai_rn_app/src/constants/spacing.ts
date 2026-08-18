// ─────────────────────────────────────────────────────────────
// Z-AI Design Tokens — Spacing
// Base unit: 4px  |  All values are multiples of the base unit
// ─────────────────────────────────────────────────────────────

export const Spacing = {
  // Base unit
  unit:             4,

  // Named tokens (match Tailwind equivalents from HTML designs)
  xs:               4,   // unit × 1
  sm:               8,   // unit × 2
  md:               12,  // terminal-indent
  gutter:           16,  // standard component gap
  lg:               20,
  containerPadding: 24,  // screen horizontal padding
  xl:               28,
  marginSafe:       32,  // outer screen edge margin
  xxl:              40,
  xxxl:             48,
} as const;

export type SpacingToken = keyof typeof Spacing;

// Border radius tokens
export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof Radius;

// Shadow / glow presets (shadowColor + elevation patterns)
export const Glow = {
  cyan: {
    shadowColor:   '#00dbe7',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  8,
    elevation:     6,
  },
  cyanStrong: {
    shadowColor:   '#00dbe7',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius:  16,
    elevation:     10,
  },
  error: {
    shadowColor:   '#930010',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  15,
    elevation:     6,
  },
  green: {
    shadowColor:   '#00ff9d',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  8,
    elevation:     4,
  },
} as const;
