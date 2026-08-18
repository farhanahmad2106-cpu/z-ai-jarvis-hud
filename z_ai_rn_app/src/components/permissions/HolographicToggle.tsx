// ─────────────────────────────────────────────────────────────
// HolographicToggle — Custom cyan glowing toggle switch
// Used in AppCard on the Permission Dashboard
// No third-party toggle library — pure Reanimated
// ─────────────────────────────────────────────────────────────
import React, { useEffect }       from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
}                                 from 'react-native-reanimated';
import { Colors }                 from '../../constants/colors';

interface HolographicToggleProps {
  value:    boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const TRACK_W  = 44;
const TRACK_H  = 24;
const THUMB_SZ = 16;
const TRAVEL   = TRACK_W - THUMB_SZ - 8; // thumb travel distance

const HolographicToggle: React.FC<HolographicToggleProps> = ({
  value,
  onToggle,
  disabled = false,
}) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 250,
      easing:   Easing.inOut(Easing.ease),
    });
  }, [value]);

  // Thumb slides left → right
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  // Track background interpolates surfaceVariant → surfaceTint
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.surfaceVariant, Colors.surfaceTint]
    ),
    shadowOpacity: progress.value * 0.8,
  }));

  // Thumb colour interpolates onSurfaceVariant → background
  const thumbColorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.onSurfaceVariant, Colors.background]
    ),
  }));

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onToggle}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.track, trackStyle, {
        shadowColor:  Colors.surfaceTint,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 12,
        elevation:    value ? 4 : 0,
      }]}>
        <Animated.View style={[styles.thumb, thumbStyle, thumbColorStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width:          TRACK_W,
    height:         TRACK_H,
    borderRadius:   TRACK_H / 2,
    paddingVertical: 4,
    paddingLeft:    4,
    justifyContent: 'center',
  },
  thumb: {
    width:        THUMB_SZ,
    height:       THUMB_SZ,
    borderRadius: THUMB_SZ / 2,
  },
});

export default HolographicToggle;
