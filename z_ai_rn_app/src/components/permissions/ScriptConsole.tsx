// ─────────────────────────────────────────────────────────────
// ScriptConsole — Terminal input + scrollable output
// Used in PermissionDashboardScreen
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
}                                  from 'react-native';
import { Ionicons }                from '@expo/vector-icons';
import GlowDot                     from '../common/GlowDot';
import { Colors }                  from '../../constants/colors';
import { Typography }              from '../../constants/typography';
import { Spacing }                 from '../../constants/spacing';

interface ConsoleLine {
  text:   string;
  type:   'output' | 'input' | 'system';
}

const INITIAL_LINES: ConsoleLine[] = [
  { text: 'initializing_permission_override...', type: 'system'  },
  { text: 'loading crypt_engine_v4.2... [OK]',   type: 'system'  },
  { text: 'root@jarvis:~$ awaiting input',        type: 'output'  },
];

const ScriptConsole: React.FC = () => {
  const [lines,   setLines]   = useState<ConsoleLine[]>(INITIAL_LINES);
  const [input,   setInput]   = useState('');
  const scrollRef             = useRef<ScrollView>(null);

  const handleSend = () => {
    const cmd = input.trim();
    if (!cmd) return;

    // Add the typed command as input line
    setLines((prev) => [
      ...prev,
      { text: `root@jarvis:~$ ${cmd}`, type: 'input' },
      { text: `Unable to execute [${cmd}]. Check local permissions.`, type: 'output' },
    ]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const promptColor = (type: ConsoleLine['type']) => {
    if (type === 'input')  return Colors.primary;
    if (type === 'system') return Colors.onSurfaceVariant;
    return Colors.onSurfaceVariant;
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="code-slash-outline" size={14} color={Colors.surfaceTint} />
          <Text style={styles.headerLabel}>Manual Script Execution</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.termId}>TERM_ID: 94-X</Text>
          <GlowDot color="cyan" size={8} />
        </View>
      </View>

      {/* Output area */}
      <ScrollView
        ref={scrollRef}
        style={styles.output}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, i) => (
          <View key={i} style={styles.line}>
            <Text style={styles.prompt}>&gt;</Text>
            <Text style={[styles.lineText, { color: promptColor(line.type) }]}>
              {line.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputRow}>
          <Ionicons name="chevron-forward" size={16} color={Colors.surfaceTint} />
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholder="Scanning for system command..."
            placeholderTextColor={Colors.surfaceTint + '33'}
            style={styles.input}
            returnKeyType="send"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={handleSend} activeOpacity={0.7}>
            <Ionicons name="send" size={18} color={Colors.surfaceTint} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest + 'CC',
    borderWidth:     1,
    borderColor:     Colors.surfaceTint + '33',
    borderRadius:    8,
    overflow:        'hidden',
  },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.sm,
    backgroundColor:  Colors.surfaceContainerHigh,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceTint + '4D',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  headerLabel: {
    ...Typography.labelCaps,
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  termId: {
    ...Typography.dataMonoXs,
    color:   Colors.onSurfaceVariant,
    opacity: 0.4,
  },
  output: {
    maxHeight:        180,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.sm,
  },
  line: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    marginBottom:  Spacing.xs,
  },
  prompt: {
    ...Typography.dataMono,
    color: Colors.surfaceTint,
  },
  lineText: {
    ...Typography.dataMono,
    flexShrink: 1,
  },
  inputRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.sm,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical:  Spacing.md,
    borderTopWidth:   1,
    borderTopColor:   Colors.outlineVariant,
    backgroundColor:  Colors.surfaceContainerLowest,
  },
  input: {
    flex:       1,
    ...Typography.dataMono,
    color:      Colors.primary,
    paddingVertical: 0,
  },
});

export default ScriptConsole;
