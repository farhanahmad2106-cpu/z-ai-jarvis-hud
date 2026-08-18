// ─────────────────────────────────────────────────────────────
// HudTopBar — Shared top app bar
// Renders: ZAYD logo (left) + status label + settings icon (right)
// Used on: all 4 screens
// ─────────────────────────────────────────────────────────────
import React                    from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
}                               from 'react-native';
import { useSafeAreaInsets }    from 'react-native-safe-area-context';
import { Ionicons }             from '@expo/vector-icons';
import { Colors }               from '../../constants/colors';
import { Typography }           from '../../constants/typography';
import { Spacing }              from '../../constants/spacing';

interface HudTopBarProps {
  statusLabel?:  string;          // right-side status text
  onMenuPress?:  () => void;
  onSettingsPress?: () => void;
  /** Show error styling (offline state) */
  errorMode?:    boolean;
}

const HudTopBar: React.FC<HudTopBarProps> = ({
  statusLabel    = 'SEC_LEVEL_09',
  onMenuPress,
  onSettingsPress,
  errorMode      = false,
}) => {
  const insets    = useSafeAreaInsets();
  const tintColor = errorMode ? Colors.error : Colors.surfaceTint;

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + Spacing.xs },
    ]}>
      {/* Left: Menu + Logo */}
      <View style={styles.left}>
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color={tintColor} />
        </TouchableOpacity>

        <Text style={[styles.logo, { color: tintColor,
          textShadowColor: tintColor, }]}>
          ZAYD
        </Text>
      </View>

      {/* Right: Status label + Settings */}
      <View style={styles.right}>
        <Text style={[styles.statusLabel, { color: tintColor }]}>
          {statusLabel}
        </Text>
        <TouchableOpacity
          onPress={onSettingsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={tintColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    zIndex:          50,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom:   Spacing.xs,
    backgroundColor: 'rgba(10,21,27,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    // Backdrop blur not supported natively — use semi-transparent bg
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.gutter,
  },
  logo: {
    ...Typography.headlineMd,
    letterSpacing:   8,
    textShadowOffset:  { width: 0, height: 0 },
    textShadowRadius:  8,
  },
  right: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.gutter,
  },
  statusLabel: {
    ...Typography.labelCaps,
    opacity: 0.7,
  },
});

export default HudTopBar;
