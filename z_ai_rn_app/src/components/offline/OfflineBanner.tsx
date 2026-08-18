// ─────────────────────────────────────────────────────────────
// OfflineBanner — Red pulsing "NETWORK FAILURE" top banner
// Appears above HudTopBar when isOnline === false
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
import { Ionicons }               from '@expo/vector-icons';
import { useSafeAreaInsets }      from 'react-native-safe-area-context';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';
import { Spacing }                from '../../constants/spacing';

const OfflineBanner: React.FC = () => {
  const opacity = useSharedValue(1);
  const insets  = useSafeAreaInsets();

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 600 }),
        withTiming(1.0, { duration: 600 }),
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.inner, animStyle]}>
        <Ionicons name="warning-outline" size={16} color={Colors.onErrorContainer} />
        <Text style={styles.label}>NETWORK FAILURE — LOCAL MODE ACTIVE</Text>
        <Text style={styles.code}>ERR_CODE: 0x82_CONN_LOST</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    zIndex:          200,
    backgroundColor: Colors.errorContainer + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: Colors.offlineError,
  },
  inner: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.sm,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.sm,
  },
  label: {
    ...Typography.labelCaps,
    color:     Colors.onErrorContainer,
    flex:      1,
  },
  code: {
    ...Typography.dataMonoXs,
    color: Colors.onErrorContainer,
  },
});

export default OfflineBanner;
