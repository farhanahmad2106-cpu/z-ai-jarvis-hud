---
name: Aether HUD
colors:
  surface: '#0a151b'
  surface-dim: '#0a151b'
  surface-bright: '#303a42'
  surface-container-lowest: '#060f16'
  surface-container-low: '#131d23'
  surface-container: '#172127'
  surface-container-high: '#212b32'
  surface-container-highest: '#2c363d'
  on-surface: '#d9e4ed'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d9e4ed'
  inverse-on-surface: '#283239'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#b0c6ff'
  on-secondary: '#002d6f'
  secondary-container: '#568dff'
  on-secondary-container: '#002661'
  tertiary: '#fff5f4'
  on-tertiary: '#680008'
  tertiary-container: '#ffd0cb'
  on-tertiary-container: '#c20018'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001945'
  on-secondary-fixed-variant: '#00429c'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#930010'
  background: '#0a151b'
  on-background: '#d9e4ed'
  surface-variant: '#2c363d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.2em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
spacing:
  unit: 4px
  gutter: 16px
  margin-safe: 32px
  container-padding: 24px
  terminal-indent: 12px
---

## Brand & Style

The design system is centered on a high-fidelity, futuristic HUD (Heads-Up Display) aesthetic designed for power users, developers, and tech enthusiasts. The brand personality is hyper-intelligent, precise, and immersive—evoking the feeling of commanding an advanced AI terminal. 

The visual style is a fusion of **Glassmorphism** and **Futuristic HUD** elements. It utilizes semi-transparent surfaces with high-intensity "light-piping" borders that glow with holographic energy. Visual depth is achieved through micro-scanning line textures and layered informational clusters, creating a dense but organized information environment. The emotional response is one of high-stakes capability and cinematic sophistication.

## Colors

The palette is strictly dark and functional. The foundation is **Midnight Blue (#00050A)**, providing a void-like depth that makes holographic elements pop. 

- **Cyan (#00F2FF):** Used for primary interactions, active data points, and sharp focal highlights.
- **Electric Blue (#0070FF):** Used for secondary UI structures, steady-state data, and structural grouping.
- **Amber/Red (#FF3B3B):** Reserved exclusively for warnings, system errors, or offline status indicators.

Surfaces use varying levels of transparency. Use `surface_glass` for container backgrounds and `border_glow` for the characteristic HUD "light-pipe" edge effect.

## Typography

This design system utilizes a dual-font approach to balance readability with a technical aesthetic. **Inter** serves as the primary geometric sans-serif for UI labels and navigational elements, providing clarity even at small sizes. **JetBrains Mono** is utilized for all "data" output—terminal logs, coordinates, timestamps, and mathematical values—reinforcing the system's mechanical nature.

All labels should utilize high letter spacing and occasional uppercase styling to mimic tactical military displays. Avoid large blocks of serif or decorative text.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a "safe area" margin that anchors content away from the physical edges of the screen, mimicking a visor or monitor display. 

1. **Information Clusters:** Content is organized into modular blocks (widgets) that snap to a 4px baseline grid.
2. **Peripheral Navigation:** Core system status indicators (battery, signal, time) are pinned to the corners, while the central area remains reserved for primary focus tasks.
3. **Responsive Reflow:** On mobile, the multi-column HUD collapses into a single-column vertical stack, with the most critical "holographic" widget positioned at the top.

## Elevation & Depth

Depth is not communicated through traditional shadows, but through **additive light and blur**.

- **Z-Index Layers:** Base content sits on the background. Active widgets sit on `surface_glass` layers with a 20px backdrop-blur.
- **Inner Glows:** Instead of drop shadows, use 1px inner borders with a soft glow effect (`0px 0px 8px`) in the primary cyan color.
- **Scan Lines:** A global overlay of horizontal scan lines (1px height, 5% opacity) should sit between the background and the UI layer to simulate a screen projection.

## Shapes

The shape language is strictly **Sharp (0)**. All containers, buttons, and input fields must have square corners to maintain a clinical, military-spec feel. 

Visual interest is added through "clipped" corners (45-degree chamfers) on larger containers rather than rounded radii. Use thin, 1px lines for all structural borders. Decorative "bracket" shapes should be used at the corners of high-priority data modules.

## Components

- **HUD Buttons:** Rectangular, 1px Cyan borders. Hover states trigger a subtle flicker animation and a filled Cyan background with black text.
- **Data Chips:** Small JetBrains Mono text wrapped in a 1px Blue border, used for metadata tags.
- **Terminal Lists:** No visible borders between rows; use cyan "chevron" prefixes (`>`) for active line items.
- **Input Fields:** Bottom-border only (1px Cyan). When focused, the border glows and a "Scanning..." micro-label appears briefly.
- **HUD Cards:** Semi-transparent containers with a heavy top-border. Includes a "header" area with a condensed uppercase label and a unique ID (e.g., `MOD_082`).
- **Gauges:** Circular progress indicators and line graphs should use 1px stroke weights and no fills.