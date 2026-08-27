// ─────────────────────────────────────────────────────────────
// Z-AI Design Tokens — Color Palette
// Source: HTML screen designs (security_lock, main_hud,
//         permission_dashboard, offline_state_hud)
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────
  background:             '#0a151b',
  surfaceContainer:       '#172127',
  surfaceContainerLowest: '#060f16',
  surfaceContainerLow:    '#131d23',
  surfaceContainerHigh:   '#212b32',
  surfaceVariant:         '#2c363d',

  // ── Primary (Cyan) ───────────────────────────────────────
  surfaceTint:            '#00f2ff', // primary Aether cyan — all glow effects
  cyan:                   '#00f2ff',
  primary:                '#e1fdff', // near-white tinted cyan
  primaryFixed:           '#74f5ff',
  electricBlue:           '#568dff',

  // ── On-surface Text ──────────────────────────────────────
  onSurface:              '#d9e4ed',
  onSurfaceVariant:       '#b9cacb',
  onBackground:           '#d9e4ed',
  onPrimary:              '#00363a',

  // ── Outlines / Dividers ──────────────────────────────────
  outline:                '#849495',
  outlineVariant:         '#3a494b',

  // ── Error / Offline ──────────────────────────────────────
  error:                  '#ffb4ab',
  errorContainer:         '#93000a',
  onErrorContainer:       '#ffdad6',
  offlineError:           '#930010', // ring + border colour in offline mode

  // ── Status ───────────────────────────────────────────────
  statusGreen:            '#00ff9d', // MIC: ACTIVE, STATUS: ONLINE indicator

  // ── Secondary ────────────────────────────────────────────
  secondary:              '#b0c6ff',
  secondaryContainer:     '#568dff',
} as const;

export type ColorToken = keyof typeof Colors;
