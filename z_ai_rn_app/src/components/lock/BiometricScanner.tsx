// ─────────────────────────────────────────────────────────────
// BiometricScanner — Central lock screen scanner
// Layers: outer ping ring, pulse ring, main disc,
//         dashed inner ring, fingerprint icon, scanning sweep line,
//         spinning border-t/b ring
//
// States:
//   scanning → cyan rings, SCANNING... label
//   error    → error red rings, BIOMETRIC MISMATCH label
// ─────────────────────────────────────────────────────────────
import React, { useEffect }             from 'react';
import { View, Text, StyleSheet }       from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
}                                       from 'react-native-reanimated';
import { Ionicons }                     from '@expo/vector-icons';
import { Colors }                       from '../../constants/colors';
import { Typography }                   from '../../constants/typography';

type ScannerState = 'scanning' | 'error';

interface BiometricScannerProps {
  state?: ScannerState;
  size?:  number;  // disc diameter, default 260
}

const BiometricScanner: React.FC<BiometricScannerProps> = ({
  state = 'scanning',
  size  = 260,
}) => {
  const isError    = state === 'error';
  const tintColor  = isError ? Colors.error      : Colors.surfaceTint;
  const ringColor  = isError ? Colors.offlineError : Colors.surfaceTint;

  // ── Animations ──────────────────────────────────────────
  const outerPing  = useSharedValue(1);
  const outerPulse = useSharedValue(0.4);
  const spinAngle  = useSharedValue(0);
  const scanY      = useSharedValue(0);      // scanning sweep line
  const errorPulse = useSharedValue(1);

  useEffect(() => {
    // Outer ping — expand and fade
    outerPing.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1.0, { duration: 0 }),
      ),
      -1,
      false
    );

    // Mid pulse — scale breathe
    outerPulse.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );

    // Spinning half-ring (border-t / border-b)
    spinAngle.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
      false
    );

    // Scanning sweep line bounce
    scanY.value = withRepeat(
      withSequence(
        withTiming(size,  { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0,     { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false
    );

    // Error: pulsing red opacity
    if (isError) {
      errorPulse.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 400 }),
          withTiming(1.0, { duration: 400 }),
        ),
        -1,
        true
      );
    } else {
      errorPulse.value = withTiming(1.0, { duration: 200 });
    }
  }, [state]);

  const outerPingStyle  = useAnimatedStyle(() => ({
    opacity:   Math.max(0, 1.3 - outerPing.value),
    transform: [{ scale: outerPing.value }],
  }));

  const midPulseStyle   = useAnimatedStyle(() => ({
    opacity: outerPulse.value,
  }));

  const spinStyle       = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinAngle.value}deg` }],
  }));

  const scanLineStyle   = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value - size / 2 }],
  }));

  const errorOpacity    = useAnimatedStyle(() => ({
    opacity: errorPulse.value,
  }));

  const outerSize = size + 128;
  const midSize   = size + 64;

  return (
    <Animated.View style={[styles.root, { width: outerSize, height: outerSize }, errorOpacity]}>

      {/* Outermost ping ring */}
      <Animated.View style={[
        styles.ring,
        outerPingStyle,
        {
          width:        outerSize,
          height:       outerSize,
          borderRadius: outerSize / 2,
          borderWidth:  1,
          borderColor:  ringColor + '1A',
        },
      ]} />

      {/* Mid pulse ring */}
      <Animated.View style={[
        styles.ring,
        midPulseStyle,
        {
          width:        midSize,
          height:       midSize,
          borderRadius: midSize / 2,
          borderWidth:  1,
          borderColor:  ringColor + '33',
        },
      ]} />

      {/* Main scanner disc */}
      <View style={[
        styles.ring,
        {
          width:           size,
          height:          size,
          borderRadius:    size / 2,
          borderWidth:     2,
          borderColor:     ringColor + '4D',
          backgroundColor: Colors.surfaceContainerLow + 'AA',
          overflow:        'hidden',
          shadowColor:     ringColor,
          shadowOffset:    { width: 0, height: 0 },
          shadowOpacity:   0.4,
          shadowRadius:    35,
          elevation:       15,
        },
      ]}>
        {/* Dashed inner ring */}
        <View style={[
          styles.ring,
          {
            width:        size - 24,
            height:       size - 24,
            borderRadius: (size - 24) / 2,
            borderWidth:  1,
            borderColor:  ringColor + '33',
            borderStyle:  'dashed',
          },
        ]} />

        {/* Fingerprint icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="finger-print"
            size={84}
            color={tintColor}
            style={{
              shadowColor:   tintColor,
              shadowOffset:  { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius:  8,
            } as const}
          />

          <Text style={[styles.scanLabel, { color: tintColor }]}>
            {isError ? 'MISMATCH' : 'SCANNING...'}
          </Text>
          <View style={[styles.labelLine, { backgroundColor: tintColor }]} />

          {isError && (
            <Text style={styles.errorDetail}>
              ACCESS DENIED
            </Text>
          )}
        </View>

        {/* Scanning sweep line */}
        {!isError && (
          <Animated.View style={[
            styles.scanLine,
            scanLineStyle,
            { backgroundColor: tintColor + '80' },
          ]} />
        )}
      </View>

      {/* Spinning half-ring (border-top + border-bottom) */}
      <Animated.View style={[
        styles.ring,
        spinStyle,
        {
          width:            size + 8,
          height:           size + 8,
          borderRadius:     (size + 8) / 2,
          borderTopWidth:   4,
          borderBottomWidth: 4,
          borderLeftWidth:  0,
          borderRightWidth: 0,
          borderColor:      ringColor + '80',
        },
      ]} />

    </Animated.View>
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
  iconContainer: {
    alignItems: 'center',
    zIndex:     10,
  },
  scanLabel: {
    ...Typography.labelCaps,
    letterSpacing: 6,
    marginTop:     12,
  },
  labelLine: {
    width:     64,
    height:    1,
    marginTop: 6,
  },
  errorDetail: {
    ...Typography.labelCapsXs,
    color:     Colors.error,
    marginTop: 6,
    letterSpacing: 3,
  },
  scanLine: {
    position: 'absolute',
    left:     0,
    right:    0,
    height:   1,
    shadowColor:   Colors.surfaceTint,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius:  6,
  },
});

export default BiometricScanner;
