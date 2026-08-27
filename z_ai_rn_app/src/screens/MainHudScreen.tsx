// ─────────────────────────────────────────────────────────────
// MainHudScreen — Primary JARVIS dashboard
// Layout: HUD core centre, altimeter left, status right,
//         terminal log bottom-left, offline view when !isOnline
// Smart layer: reads store, passes values down as props
// ─────────────────────────────────────────────────────────────
import React                      from 'react';
import { View, StyleSheet }       from 'react-native';
import { useSafeAreaInsets }      from 'react-native-safe-area-context';

import HudBackground              from '../components/common/HudBackground';
import ScanlineOverlay            from '../components/common/ScanlineOverlay';
import HudTopBar                  from '../components/common/HudTopBar';
import HologramCore               from '../components/common/HologramCore';
import TerminalLog                from '../components/common/TerminalLog';
import OfflineBanner              from '../components/offline/OfflineBanner';
import AltimeterModule            from '../components/hud/AltimeterModule';
import StatusModule               from '../components/hud/StatusModule';
import SystemLoadChart            from '../components/offline/SystemLoadChart';
import VoiceWaveform              from '../components/hud/VoiceWaveform';

import {
  useAppStore,
  selectHudMode,
  selectIsOnline,
  selectMicState,
  selectTerminalLog,
}                                 from '../store/appStore';
import { Colors }                 from '../constants/colors';
import { Spacing }                from '../constants/spacing';

const MainHudScreen: React.FC = () => {
  const insets     = useSafeAreaInsets();
  const hudMode    = useAppStore(selectHudMode);
  const isOnline   = useAppStore(selectIsOnline);
  const micState   = useAppStore(selectMicState);
  const termLog    = useAppStore(selectTerminalLog);
  const toggleMic  = useAppStore((s) => s.toggleMic);

  const isOffline  = !isOnline;

  return (
    <View style={styles.root}>
      {/* Layer 0: Background */}
      <HudBackground variant={isOffline ? 'offline' : 'default'} />
      <ScanlineOverlay />

      {/* Offline error banner (above top bar) */}
      {isOffline && <OfflineBanner />}

      {/* Top bar */}
      <HudTopBar
        statusLabel={isOffline ? '[LOCAL_OFFLINE_MODE]' : '[ZAYD_JARVIS_HUD_v1.1]'}
        errorMode={isOffline}
      />

      {/* HUD canvas */}
      <View style={[styles.canvas, {
        paddingTop:    insets.top + (isOffline ? 88 : 56),
        paddingBottom: insets.bottom + 64,
      }]}>

        {/* Left wing — Altimeter */}
        <View style={styles.leftWing}>
          <AltimeterModule />
        </View>

        {/* Centre — Hologram core */}
        <View style={styles.centre}>
          <HologramCore mode={hudMode} size={280} />
          <View style={styles.waveformWrap}>
            <VoiceWaveform mode={hudMode} />
          </View>
        </View>

        {/* Right wing — Status + offline chart */}
        <View style={styles.rightWing}>
          {isOffline ? (
            <SystemLoadChart />
          ) : (
            <StatusModule isOnline={isOnline} micState={micState} />
          )}
        </View>

        {/* Bottom-left — Terminal log */}
        <View style={[styles.terminal, { bottom: insets.bottom + 72 }]}>
          <TerminalLog
            lines={termLog}
            theme={isOffline ? 'error' : 'default'}
            footer={{ latency: '14ms', buffer: '2048KB' }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  canvas: {
    flex:     1,
    position: 'relative',
  },
  leftWing: {
    position: 'absolute',
    left:     Spacing.marginSafe,
    top:      '50%',
    transform: [{ translateY: -80 }],
  },
  centre: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
  },
  rightWing: {
    position: 'absolute',
    right:    Spacing.marginSafe,
    top:      '50%',
    transform: [{ translateY: -80 }],
  },
  terminal: {
    position: 'absolute',
    left:     Spacing.marginSafe,
    right:    '40%',
  },
  waveformWrap: {
    marginTop: 40,
  },
});

export default MainHudScreen;
