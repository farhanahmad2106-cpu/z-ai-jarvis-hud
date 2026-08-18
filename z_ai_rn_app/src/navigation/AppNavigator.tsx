// ─────────────────────────────────────────────────────────────
// Z-AI — App Navigator
// Architecture:
//   RootStack (NativeStack)
//     ├── SecurityLockScreen  ← initial route, full-screen gate
//     └── AppTabs (BottomTabs) ← rendered when authState = AUTHENTICATED
//           ├── MainHud
//           ├── Permissions
//           ├── Analytics     ← __DEV__ only stub
//           └── Topology      ← __DEV__ only stub
//
// Auth routing lives HERE — screens never call navigation.replace()
// ─────────────────────────────────────────────────────────────
import React, { useEffect }                   from 'react';
import { Platform }                            from 'react-native';
import { NavigationContainer }                 from '@react-navigation/native';
import { createNativeStackNavigator }          from '@react-navigation/native-stack';
import { createBottomTabNavigator }            from '@react-navigation/bottom-tabs';
import NetInfo                                 from '@react-native-community/netinfo';
import { Ionicons }                            from '@expo/vector-icons';

import { useAppStore, selectAuthState, selectIsOnline } from '../store/appStore';
import { RootStackParamList, AppTabParamList }           from '../types/navigation';
import { Colors }                                        from '../constants/colors';
import { Spacing }                                       from '../constants/spacing';

// ── Screen imports (placeholder until screens are written) ────
import SecurityLockScreen        from '../screens/SecurityLockScreen';
import MainHudScreen             from '../screens/MainHudScreen';
import PermissionDashboardScreen from '../screens/PermissionDashboardScreen';

// ── Navigators ───────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppTab    = createBottomTabNavigator<AppTabParamList>();

// ── Tab icon map ─────────────────────────────────────────────
type TabRoute = 'MainHud' | 'Permissions' | 'Analytics' | 'Topology';

const TAB_ICONS: Record<TabRoute, { active: string; inactive: string }> = {
  MainHud:     { active: 'radio-button-on',   inactive: 'radio-button-off' },
  Permissions: { active: 'shield',            inactive: 'shield-outline' },
  Analytics:   { active: 'analytics',         inactive: 'analytics-outline' },
  Topology:    { active: 'git-network',       inactive: 'git-network-outline' },
};

// ── Bottom Tab Navigator ──────────────────────────────────────
const AppTabNavigator: React.FC = () => (
  <AppTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderTopColor:  Colors.outlineVariant,
        borderTopWidth:  1,
        paddingBottom:   Platform.OS === 'ios' ? Spacing.gutter : Spacing.sm,
        height:          Platform.OS === 'ios' ? 80 : 60,
      },
      tabBarActiveTintColor:   Colors.surfaceTint,
      tabBarInactiveTintColor: Colors.onSurfaceVariant,
      tabBarShowLabel:         false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = TAB_ICONS[route.name as TabRoute];
        const name  = focused ? icons.active : icons.inactive;
        return (
          <Ionicons
            name={(name as any)}
            size={size}
            color={color}
            style={focused ? {
              // Glow effect on active tab icon
              shadowColor:   Colors.surfaceTint,
              shadowOffset:  { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius:  6,
            } : undefined}
          />
        );
      },
    })}
  >
    <AppTab.Screen name="MainHud"     component={MainHudScreen} />
    <AppTab.Screen name="Permissions" component={PermissionDashboardScreen} />

    {/* V2 placeholder tabs — only visible in dev builds */}
    {__DEV__ && (
      <>
        <AppTab.Screen
          name="Analytics"
          component={PlaceholderScreen}
          options={{ tabBarLabel: 'Analytics' }}
        />
        <AppTab.Screen
          name="Topology"
          component={PlaceholderScreen}
          options={{ tabBarLabel: 'Topology' }}
        />
      </>
    )}
  </AppTab.Navigator>
);

// ── Placeholder screen for V2 tabs ───────────────────────────
const PlaceholderScreen: React.FC = () => {
  const { View, Text } = require('react-native');
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background,
                   alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: Colors.onSurfaceVariant, fontFamily: 'JetBrainsMono_400Regular' }}>
        {'> V2 MODULE — NOT YET ACTIVE'}
      </Text>
    </View>
  );
};

// ── Root Navigator ────────────────────────────────────────────
// Auth state drives which screen renders — SecurityLock is never in
// the back stack when the user is authenticated.
const RootNavigator: React.FC = () => {
  const authState = useAppStore(selectAuthState);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {authState === 'LOCKED' ? (
        <RootStack.Screen
          name="SecurityLock"
          component={SecurityLockScreen}
          options={{
            gestureEnabled:    false, // no swipe-back from lock screen
            animationTypeForReplace: 'pop',
          }}
        />
      ) : (
        <RootStack.Screen
          name="App"
          component={AppTabNavigator}
        />
      )}
    </RootStack.Navigator>
  );
};

// ── Network watcher + Navigation container ────────────────────
const AppNavigator: React.FC = () => {
  const setOnline = useAppStore((s) => s.setOnline);

  useEffect(() => {
    // Subscribe to network state — cleanup on unmount
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected alone isn't enough — check reachability too
      const online =
        state.isConnected === true &&
        state.isInternetReachable !== false;
      setOnline(online);
    });
    return unsubscribe;
  }, [setOnline]);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
