// ─────────────────────────────────────────────────────────────
// SecurityLockScreen — Entry gate for the entire app
// Renders: HUD bg, scanlines, top bar, biometric scanner,
//          passcode button, 4-dot progress, perimeter clusters
//
// Auth logic: calls setAuthState('AUTHENTICATED') on success.
// Navigation: AppNavigator watches authState — no navigation.replace() here.
// ─────────────────────────────────────────────────────────────
import React, { useState }        from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
}                                 from 'react-native';
import { useSafeAreaInsets }      from 'react-native-safe-area-context';
import { Ionicons }               from '@expo/vector-icons';

import HudBackground              from '../components/common/HudBackground';
import ScanlineOverlay            from '../components/common/ScanlineOverlay';
import HudTopBar                  from '../components/common/HudTopBar';
import GlowDot                    from '../components/common/GlowDot';
import MonoText                   from '../components/common/MonoText';
import LabelCaps                  from '../components/common/LabelCaps';
import BiometricScanner           from '../components/lock/BiometricScanner';
import PasscodeButton             from '../components/lock/PasscodeButton';
import PasscodeProgress           from '../components/lock/PasscodeProgress';
import { AltCluster, CoreTempCluster } from '../components/lock/PerimeterDataCluster';

import { useAppStore }            from '../store/appStore';
import { Colors }                 from '../constants/colors';
import { Typography }             from '../constants/typography';
import { Spacing }                from '../constants/spacing';

type ScannerState = 'scanning' | 'error';
type ViewState    = 'biometric' | 'passcode';

const SecurityLockScreen: React.FC = () => {
  const insets                = useSafeAreaInsets();
  const { setAuthState, setSessionToken, appendLog } = useAppStore();

  const [viewState,    setViewState]    = useState<ViewState>('biometric');
  const [scannerState, setScannerState] = useState<ScannerState>('scanning');
  const [passcode,     setPasscode]     = useState('');

  // ── Auth handlers ─────────────────────────────────────────
  const handlePasscodeChange = (text: string) => {
    // Digits only, max 4
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setPasscode(digits);
    if (digits.length === 4) {
      handlePasscodeSubmit(digits);
    }
  };

  const handlePasscodeSubmit = (code: string) => {
    // No backend logic — connect to AuthService in Sprint 6
    if (code === '0000') {
      appendLog('> AUTH: Password verified. Session active.');
      setSessionToken('dev_token_placeholder');
      setAuthState('AUTHENTICATED');
    } else {
      setScannerState('error');
      setPasscode('');
      appendLog('> AUTH_ERROR: Invalid passcode. Access denied.');
      setTimeout(() => setScannerState('scanning'), 2000);
    }
  };

  const handleBiometricBypass = () => {
    setViewState('passcode');
    appendLog('> AUTH: Biometric bypassed. Password entry required.');
  };

  return (
    <View style={styles.root}>
      <HudBackground />
      <ScanlineOverlay />

      <HudTopBar statusLabel="Status: Secure Link" />

      {/* Perimeter left cluster */}
      <View style={[styles.perimeterLeft, { top: insets.top + 72 }]}>
        <AltCluster />
      </View>

      {/* Perimeter right cluster */}
      <View style={[styles.perimeterRight, { top: insets.top + 72 }]}>
        <CoreTempCluster />
      </View>

      {/* Main content */}
      <KeyboardAvoidingView
        style={styles.center}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* System label */}
        <LabelCaps color={Colors.onSurfaceVariant} style={styles.systemLabel}>
          SYSTEM_ADMINISTRATION_OVERRIDE
        </LabelCaps>
        <MonoText size="sm" color={Colors.primary} style={styles.idLabel}>
          IDENTIFICATION REQUIRED
        </MonoText>

        {/* Biometric scanner */}
        <View style={styles.scannerWrap}>
          <BiometricScanner state={scannerState} size={240} />
        </View>

        {/* Passcode input (shown when biometric bypassed) */}
        {viewState === 'passcode' && (
          <View style={styles.passcodeWrap}>
            <TextInput
              value={passcode}
              onChangeText={handlePasscodeChange}
              placeholder="Enter 4-digit code"
              placeholderTextColor={Colors.surfaceTint + '40'}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              secureTextEntry
              autoFocus
              maxLength={4}
            />
            <PasscodeProgress filled={passcode.length} />
          </View>
        )}

        {/* CTA */}
        <View style={styles.cta}>
          {viewState === 'biometric' ? (
            <PasscodeButton onPress={handleBiometricBypass} />
          ) : (
            <TouchableOpacity
              onPress={() => { setViewState('biometric'); setPasscode(''); }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.onSurfaceVariant} />
              <LabelCaps color={Colors.onSurfaceVariant}>USE BIOMETRIC</LabelCaps>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Bottom status strip */}
      <View style={[styles.bottomStrip, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <View style={styles.logSection}>
          <Ionicons name="terminal-outline" size={18} color={Colors.surfaceTint} />
          <View>
            <LabelCaps size="xs" color={Colors.onSurfaceVariant}>LOG_ACTIVITY</LabelCaps>
            <MonoText size="xs" color={Colors.surfaceTint}>
              MOD_082: ATTEMPTING HANDSHAKE...
            </MonoText>
          </View>
        </View>
        <View style={styles.activeChip}>
          <GlowDot color="cyan" size={8} />
          <LabelCaps size="xs" color={Colors.surfaceTint}>ACTIVE</LabelCaps>
        </View>
      </View>

      {/* Decorative corner data */}
      <View style={[styles.cornerTL, { top: insets.top + 68 }]} pointerEvents="none">
        <MonoText size="xs" color={Colors.onSurfaceVariant} style={{ opacity: 0.4 }}>
          {'SYS_INIT: OK\nKER_VER: 5.15.0-JRV\nSEC_LVL: 09\nTRC_ROUTE: HIDDEN'}
        </MonoText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingTop:     80, // top bar clearance
    paddingBottom:  60, // bottom strip clearance
  },
  systemLabel: {
    textAlign:    'center',
    marginBottom: Spacing.xs,
    opacity:      0.8,
  },
  idLabel: {
    textAlign: 'center',
    opacity:   0.6,
  },
  scannerWrap: {
    marginVertical: Spacing.xxxl,
    alignItems:     'center',
  },
  passcodeWrap: {
    alignItems:    'center',
    marginBottom:  Spacing.xl,
    gap:           Spacing.gutter,
  },
  hiddenInput: {
    position: 'absolute',
    opacity:  0,
    height:   0,
  },
  cta: {
    width: '100%',
    maxWidth: 320,
  },
  backButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
    paddingVertical: Spacing.md,
  },
  perimeterLeft: {
    position: 'absolute',
    left:     Spacing.marginSafe,
  },
  perimeterRight: {
    position: 'absolute',
    right:    Spacing.marginSafe,
  },
  bottomStrip: {
    position:         'absolute',
    bottom:           0,
    left:             0,
    right:            0,
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingTop:       Spacing.md,
    backgroundColor:  Colors.surfaceContainerLowest + 'CC',
    borderTopWidth:   1,
    borderTopColor:   Colors.outlineVariant,
  },
  logSection: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.gutter,
  },
  activeChip: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical:  Spacing.xs,
    backgroundColor:  Colors.surfaceTint + '1A',
    borderWidth:      1,
    borderColor:      Colors.surfaceTint + '4D',
  },
  cornerTL: {
    position: 'absolute',
    left:     Spacing.gutter,
  },
});

export default SecurityLockScreen;
