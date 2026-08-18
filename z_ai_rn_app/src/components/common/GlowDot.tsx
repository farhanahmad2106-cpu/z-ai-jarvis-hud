// ─────────────────────────────────────────────────────────────
// GlowDot — Small pulsing status indicator dot
// Use for: ACTIVE badge, MIC status, network alive indicator
// ─────────────────────────────────────────────────────────────
import React, { useEffect }     from 'react';
import { StyleSheet }           from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
}                               from 'react-native-reanimated';
import { Colors }               from '../../constants/colors';

type GlowDotColor = 'cyan' | 'green' | 'error' | 'muted';

interface GlowDotProps {
  color?:   GlowDotColor;
  size?:    number;   // diameter in px, default 8
  pulse?:   boolean;  // animated pulse, default true
}

const DOT_COLORS: Record<GlowDotColor, string> = {
  cyan:  Colors.surfaceTint,
  green: Colors.statusGreen,
  error: Colors.error,
  muted: Colors.outlineVariant,
};

const GlowDot: React.FC<GlowDotProps> = ({
  color = 'cyan',
  size  = 8,
  pulse = true,
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,  // infinite
      true // reverse
    );
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dotColor = DOT_COLORS[color];

  return (
    <Animated.View
      style={[
        {
          width:           size,
          height:          size,
          borderRadius:    size / 2,
          backgroundColor: dotColor,
          // Glow shadow
          shadowColor:     dotColor,
          shadowOffset:    { width: 0, height: 0 },
          shadowOpacity:   0.8,
          shadowRadius:    size * 0.8,
        },
        animStyle,
      ]}
    />
  );
};

export default GlowDot;
