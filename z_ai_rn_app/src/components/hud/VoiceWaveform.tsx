import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface VoiceWaveformProps {
  mode: 'IDLE' | 'LISTENING' | 'SPEAKING' | 'THINKING' | 'OFFLINE';
  barCount?: number;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ mode, barCount = 12 }) => {
  const bars = Array.from({ length: barCount });

  return (
    <View style={styles.container}>
      {bars.map((_, i) => (
        <WaveBar key={i} index={i} mode={mode} total={barCount} />
      ))}
    </View>
  );
};

const WaveBar: React.FC<{ index: number; mode: string; total: number }> = ({ index, mode, total }) => {
  const height = useSharedValue(4);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (mode === 'LISTENING') {
      // High frequency jitter
      height.value = withRepeat(
        withTiming(12 + Math.random() * 28, {
          duration: 100 + Math.random() * 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        -1,
        true
      );
      opacity.value = withTiming(1, { duration: 300 });
    } else if (mode === 'SPEAKING') {
      // Rhythmic wave
      const delay = (index / total) * 1000;
      height.value = withRepeat(
        withSequence(
          withTiming(32, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(8, { duration: 500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      opacity.value = withTiming(0.8, { duration: 300 });
    } else if (mode === 'THINKING') {
      // Slow pulse
      height.value = withRepeat(
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      opacity.value = withTiming(0.5, { duration: 300 });
    } else {
      // Idle
      height.value = withTiming(4, { duration: 500 });
      opacity.value = withTiming(0.3, { duration: 500 });
    }
  }, [mode]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    backgroundColor: mode === 'OFFLINE' ? Colors.error : Colors.surfaceTint,
    shadowColor: mode === 'OFFLINE' ? Colors.error : Colors.surfaceTint,
    shadowOpacity: interpolate(opacity.value, [0.3, 1], [0, 0.8]),
    shadowRadius: 4,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});

export default VoiceWaveform;
