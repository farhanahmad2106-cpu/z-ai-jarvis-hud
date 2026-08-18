// ─────────────────────────────────────────────────────────────
// HudBackground — Full-screen radial gradient base layer
// Used on: all 4 screens
// ─────────────────────────────────────────────────────────────
import React        from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient }   from 'expo-linear-gradient';
import { Colors }           from '../../constants/colors';

interface HudBackgroundProps {
  /** Override gradient for offline/error state */
  variant?: 'default' | 'offline';
}

const HudBackground: React.FC<HudBackgroundProps> = ({ variant = 'default' }) => {
  const colors: [string, string] =
    variant === 'offline'
      ? ['#1a0a0a', Colors.background]   // dark red tint for offline
      : ['#131d23', Colors.background];  // standard dark teal-black

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Radial gradient — expo-linear-gradient approximates via diagonal */}
      <LinearGradient
        colors={colors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export default HudBackground;
