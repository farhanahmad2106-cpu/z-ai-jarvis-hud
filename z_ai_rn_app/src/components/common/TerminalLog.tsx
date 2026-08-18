// ─────────────────────────────────────────────────────────────
// TerminalLog — Scrollable terminal output panel
// Used on: MainHudScreen (default theme), OfflineHudScreen (error theme)
// Moved to common/ — shared across screens (see code review R-02)
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ViewStyle,
}                                   from 'react-native';
import { Ionicons }                 from '@expo/vector-icons';
import GlassPanel                   from './GlassPanel';
import { Colors }                   from '../../constants/colors';
import { Typography }               from '../../constants/typography';
import { Spacing }                  from '../../constants/spacing';

type TerminalTheme = 'default' | 'error';

interface TerminalLogProps {
  lines:   string[];
  theme?:  TerminalTheme;
  label?:  string;         // header label, e.g. 'SYSTEM_LOG [MOD_082]'
  footer?: {
    latency: string;
    buffer:  string;
  };
  style?:  ViewStyle;
}

const TerminalLog: React.FC<TerminalLogProps> = ({
  lines,
  theme   = 'default',
  label   = 'SYSTEM_LOG [MOD_082]',
  footer,
  style,
}) => {
  const scrollRef  = useRef<ScrollView>(null);
  const promptColor = theme === 'error' ? Colors.error : Colors.surfaceTint;
  const labelColor  = theme === 'error' ? Colors.error : Colors.surfaceTint;

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [lines]);

  const emptyLine = theme === 'error'
    ? '> ERROR: CONNECTION LOST. FALLBACK TO LOCAL.'
    : '> System initialized... awaiting command';

  const displayLines = lines.length > 0 ? lines : [emptyLine];

  return (
    <GlassPanel
      variant={theme === 'error' ? 'error' : 'default'}
      style={style}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="terminal-outline" size={14} color={labelColor} />
          <Text style={[styles.headerLabel, { color: labelColor }]}>
            {label}
          </Text>
        </View>
        <Text style={styles.version}>STABLE_V4.2</Text>
      </View>

      {/* Log lines */}
      <ScrollView
        ref={scrollRef}
        style={styles.logArea}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {displayLines.map((line, i) => {
          // Lines starting with '> ' get a coloured prompt
          const isPrompt = line.startsWith('> ');
          const text     = isPrompt ? line.slice(2) : line;

          // Fade older lines slightly
          const opacity = Math.max(0.2, 1 - (displayLines.length - 1 - i) * 0.15);

          return (
            <View key={i} style={[styles.logLine, { opacity }]}>
              {isPrompt && (
                <Text style={[styles.prompt, { color: promptColor }]}>{'>'}</Text>
              )}
              <Text style={styles.logText}>{isPrompt ? text : line}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Optional footer */}
      {footer && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>LATENCY: {footer.latency}</Text>
          <Text style={styles.footerText}>BUFFER: {footer.buffer}</Text>
        </View>
      )}
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '50', // 30% opacity
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
  },
  headerLabel: {
    ...Typography.labelCaps,
  },
  version: {
    ...Typography.dataMonoXs,
    color:   Colors.onSurfaceVariant,
    opacity: 0.5,
  },
  logArea: {
    maxHeight:       128,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sm,
  },
  logLine: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    marginBottom:  Spacing.xs,
  },
  prompt: {
    ...Typography.dataMono,
  },
  logText: {
    ...Typography.dataMono,
    color:      Colors.onSurfaceVariant,
    flexShrink: 1,
  },
  footer: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.xs,
    borderTopWidth:   1,
    borderTopColor:   Colors.outlineVariant + '30',
  },
  footerText: {
    ...Typography.dataMonoXs,
    color:   Colors.surfaceTint,
    opacity: 0.4,
  },
});

export default TerminalLog;
