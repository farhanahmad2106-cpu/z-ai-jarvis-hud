// ─────────────────────────────────────────────────────────────
// Z-AI — Navigation Type Definitions
// ─────────────────────────────────────────────────────────────
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp }   from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp }   from '@react-navigation/native';

// ── Root stack: Lock screen → App ────────────────────────────
export type RootStackParamList = {
  SecurityLock: undefined;
  App:          undefined;
};

// ── App tabs: main navigation behind the lock screen ─────────
// NOTE: OfflineHud is NOT a tab — it's a view variant of MainHud
// Analytics and Topology are V2 stubs (guarded by __DEV__)
export type AppTabParamList = {
  MainHud:     undefined;
  Permissions: undefined;
  Analytics:   undefined;
  Topology:    undefined;
};

// ── Composite nav prop helpers ────────────────────────────────
// Use these as prop types in screen components

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export type MainHudNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'MainHud'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type PermissionsNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Permissions'>,
  NativeStackNavigationProp<RootStackParamList>
>;
