// ─────────────────────────────────────────────────────────────
// PerimeterDataCluster — Left ALT meter + Right core-temp widget
// Decorative HUD peripherals on the lock screen
// ─────────────────────────────────────────────────────────────
import React, { useEffect }     from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
}                               from 'react-native-reanimated';
import { Ionicons }             from '@expo/vector-icons';
import { Colors }               from '../../constants/colors';
import { Typography }           from '../../constants/typography';
import { Spacing }              from '../../constants/spacing';

// ── Left: ALT reading + vertical level meter ─────────────────
export const AltCluster: React.FC = () => {
  const barHeight = useSharedValue(0.5);

  useEffect(() => {
    barHeight.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1800 }),
        withTiming(0.4, { duration: 1400 }),
        withTiming(0.9, { duration: 1200 }),
        withTiming(0.5, { duration: 1600 }),
      ),
      -1,
      true
    );
  }, []);

  const animBar = useAnimatedStyle(() => ({
    height: `${barHeight.value * 100}%`,
  }));

  return (
    <View style={styles.altContainer}>
      <Text style={styles.clusterLabel}>ALT_READING</Text>
      <Text style={styles.altValue}>
        1123 <Text style={styles.altUnit}>m</Text>
      </Text>
      {/* Vertical level meter */}
      <View style={styles.levelTrack}>
        <Animated.View style={[styles.levelFill, animBar]} />
      </View>
    </View>
  );
};

// ── Right: Core temp + circular indicator ────────────────────
export const CoreTempCluster: React.FC = () => (
  <View style={styles.tempContainer}>
    {/* Circular icon frame */}
    <View style={styles.circleFrame}>
      <View style={styles.circleTopBorder} />
      <Ionicons name="radio-button-on" size={36} color={Colors.surfaceTint} />
    </View>
    <Text style={styles.clusterLabel}>CORE_TEMP</Text>
    <Text style={styles.tempValue}>34.2°C</Text>
  </View>
);

const styles = StyleSheet.create({
  // ── Alt cluster ──
  altContainer: {
    borderLeftWidth:  2,
    borderLeftColor:  Colors.surfaceTint + '4D',
    paddingLeft:      Spacing.gutter,
    paddingVertical:  Spacing.sm,
    gap:              Spacing.sm,
  },
  clusterLabel: {
    ...Typography.labelCapsXs,
    color: Colors.onSurfaceVariant,
  },
  altValue: {
    ...Typography.headlineMd,
    color:    Colors.surfaceTint,
    fontSize: 24,
    // text glow
    textShadowColor:  Colors.surfaceTint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  altUnit: {
    ...Typography.bodySm,
    color:   Colors.onSurfaceVariant,
    opacity: 0.5,
  },
  levelTrack: {
    width:           4,
    height:          100,
    backgroundColor: Colors.surfaceVariant,
    borderRadius:    2,
    overflow:        'hidden',
    justifyContent:  'flex-end',
  },
  levelFill: {
    width:           '100%',
    backgroundColor: Colors.surfaceTint,
    shadowColor:     Colors.surfaceTint,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.8,
    shadowRadius:    6,
  },
  // ── Temp cluster ──
  tempContainer: {
    borderRightWidth: 2,
    borderRightColor: Colors.surfaceTint + '4D',
    paddingRight:     Spacing.gutter,
    paddingVertical:  Spacing.sm,
    alignItems:       'flex-end',
    gap:              Spacing.sm,
  },
  circleFrame: {
    width:           80,
    height:          80,
    borderRadius:    40,
    borderWidth:     1,
    borderColor:     Colors.surfaceTint + '33',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
  },
  circleTopBorder: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    borderRadius:    40,
    borderWidth:     2,
    borderColor:     'transparent',
    borderTopColor:  Colors.surfaceTint + '99',
  },
  tempValue: {
    ...Typography.dataMonoSm,
    color: Colors.surfaceTint,
  },
});
