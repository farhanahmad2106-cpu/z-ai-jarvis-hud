// ─────────────────────────────────────────────────────────────
// LabelCaps — Uppercase tracking label
// Renders styled ALL-CAPS text using the labelCaps token.
// Use for: section labels, module IDs, status indicators
// ─────────────────────────────────────────────────────────────
import React          from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors }     from '../../constants/colors';

interface LabelCapsProps {
  children: React.ReactNode;
  color?:   string;
  size?:    'sm' | 'xs';   // sm = 11px (default), xs = 9px
  style?:   TextStyle;
  glow?:    boolean;        // cyan text-shadow glow
}

const LabelCaps: React.FC<LabelCapsProps> = ({
  children,
  color = Colors.onSurfaceVariant,
  size  = 'sm',
  style,
  glow  = false,
}) => {
  const baseStyle = size === 'xs' ? Typography.labelCapsXs : Typography.labelCaps;

  const glowStyle: TextStyle = glow
    ? {
        textShadowColor:  Colors.surfaceTint,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
      }
    : {};

  return (
    <Text style={[baseStyle, { color }, glowStyle, style]}>
      {children}
    </Text>
  );
};

export default LabelCaps;
