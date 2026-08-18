// ─────────────────────────────────────────────────────────────
// GlassPanel — Reusable glassmorphic card
// Used on: all screens (module cards, terminal, status widgets)
//
// Variants:
//   default → semi-transparent surface, cyan border glow
//   accent  → 4px cyan top border (permission cards)
//   error   → red/error border (offline mode panels)
// ─────────────────────────────────────────────────────────────
import React            from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
}                       from 'react-native';
import { BlurView }     from 'expo-blur';
import { Colors }       from '../../constants/colors';
import { Radius }       from '../../constants/spacing';

export type GlassPanelVariant = 'default' | 'accent' | 'error';

interface GlassPanelProps {
  children:   React.ReactNode;
  variant?:   GlassPanelVariant;
  intensity?: number;   // blur intensity 0–100, default 20
  style?:     ViewStyle;
}

const BORDER_COLORS: Record<GlassPanelVariant, string> = {
  default: 'rgba(0,219,231,0.2)',
  accent:  Colors.surfaceTint,
  error:   Colors.offlineError,
};

const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant   = 'default',
  intensity = 20,
  style,
}) => {
  const borderColor = BORDER_COLORS[variant];
  const borderTopW  = variant === 'accent' ? 4 : 1;

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      borderColor,
      borderTopWidth: borderTopW,
      borderWidth:    variant === 'accent' ? 1 : 1,
    },
    style ?? {},
  ];

  // Android: BlurView has performance issues at intensity > 50
  // Use solid semi-transparent background as fallback
  if (Platform.OS === 'android') {
    return (
      <View style={[containerStyle, styles.androidFallback]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={containerStyle}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    overflow:     'hidden',
    // Inner glow effect via shadow (iOS only)
    shadowColor:   Colors.surfaceTint,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius:  10,
  },
  androidFallback: {
    backgroundColor: 'rgba(23,33,39,0.85)',
  },
});

export default GlassPanel;
