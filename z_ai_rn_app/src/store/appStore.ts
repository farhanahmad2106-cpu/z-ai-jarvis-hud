// ─────────────────────────────────────────────────────────────
// Z-AI — Global App Store (Zustand)
//
// Scope: UI state machine + auth session + permissions + log
// Rule:  Screens are smart (read store). Components are dumb (receive props).
// Rule:  sessionToken lives here ONLY — never in AsyncStorage/SecureStore.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { AppPermission, DEFAULT_PERMISSIONS } from '../types/permissions';

// ── State machine types ───────────────────────────────────────

/** Core HUD animation state — drives HologramCore variant */
export type HudMode =
  | 'IDLE'       // rings spin slowly, dim glow
  | 'LISTENING'  // rings spin fast, bright glow, mic active
  | 'THINKING'   // rings pulse, waiting for API response
  | 'SPEAKING'   // rings pulse in sync with TTS audio
  | 'OFFLINE';   // rings flicker, error colour

/** Authentication gate state */
export type AuthState = 'LOCKED' | 'AUTHENTICATED';

/** Microphone toggle */
export type MicState = 'ON' | 'OFF';

// ── Store interface ───────────────────────────────────────────

interface AppStore {
  // ── HUD state machine ─────────────────────────────────────
  hudMode:    HudMode;
  setHudMode: (mode: HudMode) => void;

  // ── Auth ──────────────────────────────────────────────────
  authState:    AuthState;
  setAuthState: (state: AuthState) => void;

  // JWT: memory-only, 5-min expiry, never persisted
  sessionToken:    string | null;
  setSessionToken: (token: string | null) => void;

  // ── Connectivity ──────────────────────────────────────────
  isOnline:  boolean;
  setOnline: (online: boolean) => void;

  // ── Microphone ────────────────────────────────────────────
  micState:   MicState;
  toggleMic:  () => void;

  // ── Terminal log (capped at 50 lines) ─────────────────────
  terminalLog: string[];
  appendLog:   (line: string) => void;
  clearLog:    () => void;

  // ── Permissions ───────────────────────────────────────────
  permissions:      AppPermission[];
  setPermissions:   (perms: AppPermission[]) => void;
  togglePermission: (appId: string) => void;
}

// ── Store implementation ──────────────────────────────────────

export const useAppStore = create<AppStore>((set) => ({
  // ── HUD state machine ─────────────────────────────────────
  hudMode:    'IDLE',
  setHudMode: (mode) => set((s) => {
    // Rule 1: If SPEAKING, mic must be OFF
    if (mode === 'SPEAKING') {
      console.log("[Z-AI Store] SPEAKING: Forcing Mic OFF");
      return { hudMode: mode, micState: 'OFF' };
    }
    // Rule 2: If LISTENING, mic must be ON
    if (mode === 'LISTENING') {
      console.log("[Z-AI Store] LISTENING: Forcing Mic ON");
      return { hudMode: mode, micState: 'ON' };
    }
    // If THINKING or IDLE, keep current micState or default to OFF for safety
    if (mode === 'THINKING' || mode === 'IDLE') {
      return { hudMode: mode, micState: 'OFF' };
    }
    return { hudMode: mode };
  }),

  // ── Auth ──────────────────────────────────────────────────
  authState:    'LOCKED',
  setAuthState: (state) => set({ authState: state }),

  sessionToken:    null,
  setSessionToken: (token) => set({ sessionToken: token }),

  // ── Connectivity ──────────────────────────────────────────
  isOnline: true,
  setOnline: (online) =>
    set((s) => ({
      isOnline: online,
      hudMode: !online
        ? 'OFFLINE'
        : s.hudMode === 'OFFLINE'
          ? 'IDLE'
          : s.hudMode,
      micState: !online ? 'OFF' : s.micState,
    })),

  // ── Microphone ────────────────────────────────────────────
  micState:  'OFF',
  toggleMic: () =>
    set((s) => {
      const nextMicState = s.micState === 'ON' ? 'OFF' : 'ON';
      // If manually turning Mic ON, set mode to LISTENING
      // If manually turning Mic OFF, set mode to IDLE (if it was listening)
      let nextHudMode = s.hudMode;
      if (nextMicState === 'ON') {
        nextHudMode = 'LISTENING';
      } else if (s.hudMode === 'LISTENING') {
        nextHudMode = 'IDLE';
      }
      return { micState: nextMicState, hudMode: nextHudMode };
    }),

  // ── Terminal log ──────────────────────────────────────────
  terminalLog: ['> System initialized... awaiting command'],
  appendLog:   (line) =>
    set((s) => ({
      terminalLog: [...s.terminalLog.slice(-49), line],
    })),
  clearLog: () =>
    set({ terminalLog: ['> System initialized... awaiting command'] }),

  // ── Permissions ───────────────────────────────────────────
  permissions:    DEFAULT_PERMISSIONS,
  setPermissions: (perms) => set({ permissions: perms }),
  togglePermission: (appId) =>
    set((s) => ({
      permissions: s.permissions.map((p) =>
        p.appId === appId
          ? {
              ...p,
              status: p.status === 'authorized' ? 'restricted' : 'authorized',
            }
          : p
      ),
    })),
}));


// ── Selectors (memoised — use these in components, not raw store) ──

export const selectHudMode      = (s: AppStore) => s.hudMode;
export const selectAuthState    = (s: AppStore) => s.authState;
export const selectIsOnline     = (s: AppStore) => s.isOnline;
export const selectMicState     = (s: AppStore) => s.micState;
export const selectSessionToken = (s: AppStore) => s.sessionToken;
export const selectTerminalLog  = (s: AppStore) => s.terminalLog;
export const selectPermissions  = (s: AppStore) => s.permissions;
