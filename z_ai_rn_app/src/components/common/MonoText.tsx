// ─────────────────────────────────────────────────────────────
// MonoText — JetBrains Mono text wrapper
// Use for: terminal output, data values, hex codes, metric readouts
// ─────────────────────────────────────────────────────────────
import React          from 'react';
import { Text, TextStyle } from 'react-native';
import { Typography } from '../../constants/typography';
import { Colors }     from '../../constants/colors';

type MonoSize = 'md' | 'sm' | 'xs';

interface MonoTextProps {
  children: React.ReactNode;
  size?:    MonoSize;
  color?:   string;
  style?:   TextStyle;
  /** Prompt prefix — renders a coloured '>' before content */
  prompt?:  boolean;
  promptColor?: string;
}

const SIZE_MAP: Record<MonoSize, TextStyle> = {
  md: Typography.dataMono,
  sm: Typography.dataMonoSm,
  xs: Typography.dataMonoXs,
};

const MonoText: React.FC<MonoTextProps> = ({
  children,
  size         = 'md',
  color        = Colors.onSurfaceVariant,
  style,
  prompt       = false,
  promptColor  = Colors.surfaceTint,
}) => (
  <Text style={[SIZE_MAP[size], { color }, style]}>
    {prompt && (
      <Text style={{ color: promptColor }}>{'> '}</Text>
    )}
    {children}
  </Text>
);

export default MonoText;
