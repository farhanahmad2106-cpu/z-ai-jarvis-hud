// ─────────────────────────────────────────────────────────────
// AltimeterModule — Left wing panel on Main HUD
// Shows ALT_METER bar stack + PITCH indicator
// Pure presentational — no store access
// ─────────────────────────────────────────────────────────────
import React, { useEffect }       from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
}                                 from 'react-native-reanimated';
import GlassPanel                 from '../common/GlassPanel';
import LabelCaps                  from '../common/LabelCaps';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';
import { Spacing }                from '../../constants/spacing';

// Static bar widths from the HTML design (as fractions 0–1)
const BAR_WIDTHS = [1, 0.8, 0.9, 0.7, 0.6, 0.85, 0.2];

const AltimeterModule: React.FC = () => {
  // Animate the first (brightest) bar to simulate live reading
  const activeBar = useSharedValue(1);

  useEffect(() => {
    activeBar.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 900 }),
        withTiming(1.0, { duration: 700 }),
        withTiming(0.8, { duration: 600 }),
      ),
      -1,
      true
    );
  }, []);

  const activeBarStyle = useAnimatedStyle(() => ({
    width: `${activeBar.value * 100}%`,
  }));

  return (
    <View style={styles.column}>
      {/* ALT_METER panel */}
      <GlassPanel style={styles.panel}>
        <LabelCaps color={Colors.surfaceTint} style={styles.title}>
          ALT_METER
        </LabelCaps>

        <View style={styles.barStack}>
          {BAR_WIDTHS.map((w, i) => (
            i === 0 ? (
              // First bar is animated
              <View key={i} style={styles.barTrack}>
                <Animated.View style={[
                  styles.barFill,
                  styles.barActive,
                  activeBarStyle,
                ]} />
              </View>
            ) : (
              <View
                key={i}
                style={[
                  styles.barFill,
                  { width: `${w * 100}%`, opacity: 0.6 },
                ]}
              />
            )
          ))}
        </View>

        <Text style={styles.readout}>1123.4 FT</Text>
      </GlassPanel>

      {/* PITCH panel */}
      <GlassPanel style={styles.panel}>
        <LabelCaps color={Colors.surfaceTint} style={styles.title}>
          PITCH
        </LabelCaps>
        <View style={styles.pitchBox}>
          {/* Horizon lines */}
          <View style={[styles.pitchLine, styles.pitchLineFaint,
            { transform: [{ rotate: '12deg' }] }]} />
          <View style={[styles.pitchLine, styles.pitchLineActive]} />
        </View>
      </GlassPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    gap: Spacing.gutter,
  },
  panel: {
    width:   120,
    padding: Spacing.containerPadding,
  },
  title: {
    marginBottom: Spacing.gutter,
  },
  barStack: {
    gap: Spacing.xs,
  },
  barTrack: {
    height:          4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius:    2,
    overflow:        'hidden',
  },
  barFill: {
    height:          4,
    backgroundColor: Colors.surfaceTint,
    borderRadius:    2,
  },
  barActive: {
    shadowColor:   Colors.surfaceTint,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius:  6,
  },
  readout: {
    ...Typography.dataMono,
    color:     Colors.surfaceTint,
    marginTop: Spacing.gutter,
  },
  pitchBox: {
    height:         80,
    justifyContent: 'center',
    overflow:       'hidden',
  },
  pitchLine: {
    position: 'absolute',
    left:     0,
    right:    0,
    height:   1,
  },
  pitchLineFaint: {
    backgroundColor: Colors.surfaceTint + '4D',
  },
  pitchLineActive: {
    backgroundColor: Colors.surfaceTint,
    shadowColor:     Colors.surfaceTint,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.6,
    shadowRadius:    4,
  },
});

export default AltimeterModule;
