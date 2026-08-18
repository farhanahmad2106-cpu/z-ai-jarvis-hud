// ─────────────────────────────────────────────────────────────
// PasscodeProgress — 4-dot progress indicator
// First dot lit = 1 digit entered, all 4 lit = ready to submit
// ─────────────────────────────────────────────────────────────
import React        from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors }   from '../../constants/colors';
import { Spacing }  from '../../constants/spacing';

interface PasscodeProgressProps {
  filled: number; // 0–4 digits entered
}

const PasscodeProgress: React.FC<PasscodeProgressProps> = ({ filled }) => (
  <View style={styles.row}>
    {Array.from({ length: 4 }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i < filled
            ? styles.dotFilled
            : styles.dotEmpty,
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           Spacing.gutter,
    alignItems:    'center',
    justifyContent: 'center',
  },
  dot: {
    width:        12,
    height:       12,
    borderRadius: 2,
  },
  dotFilled: {
    backgroundColor: Colors.surfaceTint,
    shadowColor:     Colors.surfaceTint,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.8,
    shadowRadius:    8,
    elevation:       4,
  },
  dotEmpty: {
    backgroundColor: Colors.surfaceVariant,
  },
});

export default PasscodeProgress;
