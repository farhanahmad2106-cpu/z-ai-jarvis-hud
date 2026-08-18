// ─────────────────────────────────────────────────────────────
// PasscodeButton — "ENTER PASSCODE" CTA on lock screen
// ─────────────────────────────────────────────────────────────
import React                          from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
}                                     from 'react-native';
import { Ionicons }                   from '@expo/vector-icons';
import { Colors }                     from '../../constants/colors';
import { Typography }                 from '../../constants/typography';
import { Spacing }                    from '../../constants/spacing';

interface PasscodeButtonProps {
  onPress: () => void;
  label?:  string;
}

const PasscodeButton: React.FC<PasscodeButtonProps> = ({
  onPress,
  label = 'ENTER PASSCODE',
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={styles.button}
  >
    <View style={styles.inner}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={Colors.surfaceTint} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width:           '100%',
    borderWidth:     1,
    borderColor:     Colors.surfaceTint + '80',
    backgroundColor: Colors.surfaceTint + '0D', // ~5% fill
    paddingVertical: Spacing.gutter,
    // Glow
    shadowColor:     Colors.surfaceTint,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.2,
    shadowRadius:    15,
    elevation:       4,
  },
  inner: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
  },
  label: {
    ...Typography.labelCaps,
    color:        Colors.surfaceTint,
    letterSpacing: 6,
  },
});

export default PasscodeButton;
