// ─────────────────────────────────────────────────────────────
// StatusModule — Right wing panel on Main HUD
// Shows STATUS, MIC indicator, waveform SVG, CPU/TEMP grid
// Props: isOnline, micState — received from parent screen
// ─────────────────────────────────────────────────────────────
import React              from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path }      from 'react-native-svg';
import GlassPanel         from '../common/GlassPanel';
import LabelCaps          from '../common/LabelCaps';
import GlowDot            from '../common/GlowDot';
import { Colors }         from '../../constants/colors';
import { Typography }     from '../../constants/typography';
import { Spacing }        from '../../constants/spacing';
import { MicState }       from '../../store/appStore';

interface StatusModuleProps {
  isOnline: boolean;
  micState: MicState;
}

const StatusModule: React.FC<StatusModuleProps> = ({ isOnline, micState }) => {
  const statusColor = isOnline ? Colors.statusGreen : Colors.error;
  const statusText  = isOnline ? 'ONLINE' : 'OFFLINE';
  const micColor    = micState === 'ON' ? Colors.statusGreen : Colors.onSurfaceVariant;
  const micText     = micState === 'ON' ? 'ACTIVE' : 'OFF';

  return (
    <View style={styles.column}>
      {/* Status + Mic panel */}
      <GlassPanel style={styles.panel}>
        {/* STATUS row */}
        <View style={styles.row}>
          <LabelCaps color={Colors.onSurfaceVariant}>STATUS:</LabelCaps>
          <LabelCaps color={statusColor} glow>{statusText}</LabelCaps>
        </View>

        {/* MIC row */}
        <View style={[styles.row, { marginTop: Spacing.sm }]}>
          <LabelCaps color={Colors.onSurfaceVariant}>MIC:</LabelCaps>
          <GlowDot color={micState === 'ON' ? 'green' : 'muted'} size={8} />
          <LabelCaps color={micColor}>{micText}</LabelCaps>
        </View>
      </GlassPanel>

      {/* V_INPUT waveform panel */}
      <GlassPanel style={styles.wavePanel}>
        <LabelCaps color={Colors.surfaceTint} style={{ marginBottom: Spacing.sm }}>
          V_INPUT
        </LabelCaps>
        <Svg width="100%" height={48} viewBox="0 0 100 30">
          {/* Background wave */}
          <Path
            d="M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15"
            stroke={Colors.surfaceTint}
            strokeWidth={1}
            fill="none"
            opacity={0.5}
          />
          {/* Foreground wave */}
          <Path
            d="M0 15 Q 5 25, 10 15 T 20 15 T 30 15 T 40 15 T 50 15 T 60 15 T 70 15 T 80 15 T 90 15 T 100 15"
            stroke={Colors.surfaceTint}
            strokeWidth={1}
            fill="none"
            opacity={0.8}
          />
        </Svg>
      </GlassPanel>

      {/* CPU / TEMP mini grid */}
      <View style={styles.grid}>
        <GlassPanel style={styles.gridCell}>
          <Text style={styles.gridLabel}>CPU_LOAD</Text>
          <Text style={styles.gridValue}>42.8%</Text>
        </GlassPanel>
        <GlassPanel style={styles.gridCell}>
          <Text style={styles.gridLabel}>TEMP_CR</Text>
          <Text style={styles.gridValue}>34°C</Text>
        </GlassPanel>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    gap: Spacing.gutter,
    alignItems: 'flex-end',
  },
  panel: {
    width:   160,
    padding: Spacing.containerPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'flex-end',
    gap:           Spacing.sm,
  },
  wavePanel: {
    width:   160,
    padding: Spacing.gutter,
  },
  grid: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  gridCell: {
    width:   72,
    padding: Spacing.sm,
  },
  gridLabel: {
    ...Typography.labelCapsXs,
    color: Colors.onSurfaceVariant,
  },
  gridValue: {
    ...Typography.dataMonoSm,
    color:     Colors.surfaceTint,
    marginTop: Spacing.xs,
  },
});

export default StatusModule;
