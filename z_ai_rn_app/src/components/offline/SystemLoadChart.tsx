// ─────────────────────────────────────────────────────────────
// SystemLoadChart — Bar chart with error-colour spike
// Used on the offline HUD screen (bottom-right panel)
// ─────────────────────────────────────────────────────────────
import React                      from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons }               from '@expo/vector-icons';
import GlassPanel                 from '../common/GlassPanel';
import LabelCaps                  from '../common/LabelCaps';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';
import { Spacing }                from '../../constants/spacing';

// Heights as fraction 0–1, matching HTML design values
// The 4th bar spikes red (system overload)
const BARS: Array<{ h: number; error: boolean }> = [
  { h: 0.50, error: false },
  { h: 0.67, error: false },
  { h: 0.75, error: false },
  { h: 1.00, error: true  },  // ← red spike
  { h: 0.83, error: true  },  // ← red aftermath
  { h: 0.75, error: false },
  { h: 0.67, error: false },
];

const SystemLoadChart: React.FC = () => (
  <GlassPanel variant="default" style={styles.panel}>
    {/* Header */}
    <View style={styles.header}>
      <LabelCaps color={Colors.surfaceTint} size="xs">SYSTEM_LOAD</LabelCaps>
      <Text style={styles.pct}>82%</Text>
    </View>

    {/* Bar chart */}
    <View style={styles.chartArea}>
      {BARS.map((bar, i) => (
        <View key={i} style={styles.barWrapper}>
          <View style={[
            styles.bar,
            {
              height:          `${bar.h * 100}%`,
              backgroundColor: bar.error ? Colors.error : Colors.surfaceTint,
              opacity:         bar.error ? 1 : 0.5 + bar.h * 0.4,
            },
          ]} />
        </View>
      ))}
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>BFPC: Claude</Text>
      <Ionicons name="radio-outline" size={14} color={Colors.surfaceTint} />
    </View>
  </GlassPanel>
);

const styles = StyleSheet.create({
  panel: {
    width:   220,
    padding: Spacing.gutter,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.sm,
  },
  pct: {
    ...Typography.dataMonoXs,
    color: Colors.onSurfaceVariant,
  },
  chartArea: {
    height:         64,
    flexDirection:  'row',
    alignItems:     'flex-end',
    gap:            2,
  },
  barWrapper: {
    flex:           1,
    height:         '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width:        '100%',
    borderRadius: 1,
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      Spacing.gutter,
    paddingTop:     Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  footerText: {
    ...Typography.dataMonoXs,
    color: Colors.onSurfaceVariant,
  },
});

export default SystemLoadChart;
