// ─────────────────────────────────────────────────────────────
// ScanlineOverlay — CRT scanline effect across entire screen
// Fixed position, pointer-events none, z-index 100
// Used on: all 4 screens
// ─────────────────────────────────────────────────────────────
import React                       from 'react';
import { StyleSheet, View }        from 'react-native';
import { LinearGradient }          from 'expo-linear-gradient';
import { Colors }                  from '../../constants/colors';

const STRIPE_HEIGHT = 4; // px per scanline cycle

const ScanlineOverlay: React.FC = () => (
  <View style={styles.container} pointerEvents="none">
    {/*
      Approximate the CSS `repeating-linear-gradient` scanline effect.
      React Native doesn't support repeating gradients, so we tile
      a tiny LinearGradient using an absolute-fill approach.
      The effect is subtle — opacity 0.08 — just enough for depth.
    */}
    <LinearGradient
      colors={[
        'rgba(0,219,231,0.04)',
        'rgba(0,0,0,0.08)',
        'rgba(0,219,231,0.04)',
        'rgba(0,0,0,0.08)',
      ]}
      locations={[0, 0.499, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex:  100,
    opacity: 0.35,
  },
});

export default ScanlineOverlay;
