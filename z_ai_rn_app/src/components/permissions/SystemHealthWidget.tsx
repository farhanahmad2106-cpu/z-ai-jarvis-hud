// ─────────────────────────────────────────────────────────────
// SystemHealthWidget — CPU and memory progress bars
// Used in PermissionDashboardScreen sidebar
// ─────────────────────────────────────────────────────────────
import React                      from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassPanel                 from '../common/GlassPanel';
import LabelCaps                  from '../common/LabelCaps';
import { Colors }                 from '../../constants/colors';
import { Typography }             from '../../constants/typography';
import { Spacing }                from '../../constants/spacing';

interface HealthMetric {
  label: string;
  value: string;
  pct:   number; // 0–1
}

const METRICS: HealthMetric[] = [
  { label: 'CPU_CORE_01', value: '24%',   pct: 0.24 },
  { label: 'MEM_ALLOC',   value: '8.2GB', pct: 0.65 },
];

const SystemHealthWidget: React.FC = () => (
  <GlassPanel style={styles.panel}>
    <LabelCaps color={Colors.onSurfaceVariant} style={styles.title}>
      SYSTEM_HEALTH
    </LabelCaps>

    {METRICS.map((m, i) => (
      <View key={i} style={styles.metric}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>{m.label}</Text>
          <Text style={styles.metricValue}>{m.value}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${m.pct * 100}%` }]} />
        </View>
      </View>
    ))}
  </GlassPanel>
);

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.md,
    borderTopWidth:  2,
    borderTopColor:  Colors.surfaceTint,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  metric: {
    marginTop: Spacing.sm,
  },
  metricHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing.xs,
  },
  metricLabel: {
    ...Typography.dataMonoXs,
    color: Colors.onSurface,
  },
  metricValue: {
    ...Typography.dataMonoXs,
    color: Colors.surfaceTint,
  },
  track: {
    height:          4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius:    2,
    overflow:        'hidden',
  },
  fill: {
    height:          '100%',
    backgroundColor: Colors.surfaceTint,
    borderRadius:    2,
  },
});

export default SystemHealthWidget;
