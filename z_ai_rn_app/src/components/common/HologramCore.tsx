// ─────────────────────────────────────────────────────────────
// HologramCore — Animated 3-ring holographic core
// Moved to common/ — used by MainHudScreen AND OfflineHudScreen
// (Code review fix R-01: merged HologramCore + OfflineHologramCore)
//
// Variants:
//   active  → cyan rings, normal spin speed
//   offline → error-red rings, flicker animation
//   idle    → cyan rings, slow/dim
//
// PURE COMPONENT — receives mode as prop, no store access inside.
// Parent screen reads from store and passes it down.
// ─────────────────────────────────────────────────────────────
import React, { useEffect }       from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
  useDerivedValue,
}                                 from 'react-native-reanimated';
import { HudMode }                from '../../store/appStore';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';

export type HologramVariant = 'active' | 'offline' | 'idle';

interface HologramCoreProps {
  mode:    HudMode;       // from parent screen — never read store here
  size?:   number;        // outer ring diameter, default 300
}

// Map HudMode → visual variant
const modeToVariant = (mode: HudMode): HologramVariant => {
  if (mode === 'OFFLINE') return 'offline';
  if (mode === 'IDLE')    return 'idle';
  return 'active';
};

const HologramCore: React.FC<HologramCoreProps> = ({
  mode,
  size = 300,
}) => {
  const variant = modeToVariant(mode);

  // ── Shared animation values ─────────────────────────────
  // Ring 1: outer dashed ring — slow spin (20s)
  const ring1Rotation = useSharedValue(0);
  // Ring 2: mid ring — faster, opposite direction (10s)
  const ring2Rotation = useSharedValue(0);
  // Core: opacity flicker for offline variant
  const coreOpacity   = useSharedValue(1);
  // Core: glow pulse for LISTENING / SPEAKING
  const glowIntensity = useSharedValue(0.3);

  // Ring colours based on variant
  const ringColor = variant === 'offline'
    ? Colors.offlineError
    : Colors.surfaceTint;

  const innerBorderColor = variant === 'offline'
    ? Colors.offlineError
    : Colors.surfaceTint;

  const coreText = variant === 'offline'
    ? Colors.onTertiaryFixedVariant ?? Colors.offlineError
    : Colors.surfaceTint;

  const statusText = variant === 'offline' ? 'LOCAL_KERNEL_V4' : (mode === 'THINKING' ? 'PROCESSING...' : 'ACTIVE');
  const statusColor = variant === 'offline' ? Colors.error : Colors.onSurfaceVariant;

  // ── Start animations ────────────────────────────────────
  useEffect(() => {
    const isThinking = mode === 'THINKING';
    const speed = variant === 'idle' ? 30000 : (isThinking ? 5000 : 20000);

    // Outer ring spins clockwise
    ring1Rotation.value = withRepeat(
      withTiming(360, { duration: speed, easing: Easing.linear }),
      -1,
      false
    );

    // Mid ring spins counter-clockwise at 2× speed
    ring2Rotation.value = withRepeat(
      withTiming(-360, { duration: speed / 2, easing: Easing.linear }),
      -1,
      false
    );

    // Flicker for offline or thinking
    if (variant === 'offline' || isThinking) {
      coreOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: isThinking ? 50 : 100 }),
          withTiming(0.9, { duration: isThinking ? 100 : 200 }),
          withTiming(0.2, { duration: isThinking ? 40 : 80  }),
          withTiming(0.9, { duration: isThinking ? 1000 : 3000 }),
        ),
        -1,
        false
      );
    } else {
      coreOpacity.value = withTiming(1, { duration: 300 });
    }

    // Glow pulse for active voice states
    if (mode === 'LISTENING' || mode === 'SPEAKING') {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 600 }),
          withTiming(0.4, { duration: 600 }),
        ),
        -1,
        true
      );
    } else if (isThinking) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 150 }),
          withTiming(0.3, { duration: 150 }),
        ),
        -1,
        true
      );
    } else {
      glowIntensity.value = withTiming(0.3, { duration: 400 });
    }
  }, [variant, mode]);

  // ── Animated styles ─────────────────────────────────────
  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring1Rotation.value}deg` }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring2Rotation.value}deg` }],
  }));

  const coreWrapStyle = useAnimatedStyle(() => ({
    opacity: coreOpacity.value,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value,
  }));

  // ── Derived sizes ───────────────────────────────────────
  const midSize   = size * 0.8;
  const innerSize = size * 0.52;

  return (
    <View style={[styles.root, { width: size, height: size }]}>

      {/* Outer dashed ring — slowest spin */}
      <Animated.View style={[
        styles.ring,
        ring1Style,
        {
          width:        size,
          height:       size,
          borderRadius: size / 2,
          borderColor:  ringColor + '33', // 20% opacity
          borderStyle:  'dashed',
          borderWidth:  2,
        },
      ]} />

      {/* Mid ring — opposite direction, 2 sided (border-l + border-r effect) */}
      <Animated.View style={[
        styles.ring,
        ring2Style,
        {
          width:           midSize,
          height:          midSize,
          borderRadius:    midSize / 2,
          borderTopWidth:  4,
          borderBottomWidth: 4,
          borderLeftWidth:  0,
          borderRightWidth: 0,
          borderColor:     ringColor + '99', // 60% opacity
        },
      ]} />

      {/* Inner solid core */}
      <Animated.View style={[
        styles.ring,
        coreWrapStyle,
        innerGlowStyle,
        {
          width:           innerSize,
          height:          innerSize,
          borderRadius:    innerSize / 2,
          borderWidth:     2,
          borderColor:     innerBorderColor,
          backgroundColor: ringColor + '1A', // ~10% fill
          // Glow
          shadowColor:     ringColor,
          shadowOffset:    { width: 0, height: 0 },
          shadowRadius:    20,
          elevation:       10,
        },
      ]}>
        <View style={styles.coreContent}>
          <Text style={[styles.coreLabel, { color: coreText,
            textShadowColor: ringColor }]}>
            ZAYD
          </Text>
          <Text style={[styles.coreStatus, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  ring: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  coreContent: {
    alignItems: 'center',
  },
  coreLabel: {
    ...Typography.displayLg,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  coreStatus: {
    ...Typography.labelCaps,
    marginTop: 4,
  },
});

export default HologramCore;
