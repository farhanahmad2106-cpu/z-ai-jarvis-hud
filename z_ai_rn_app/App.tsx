// ─────────────────────────────────────────────────────────────
// App.tsx — Root entry point
// Responsibilities:
//   1. Load fonts (Inter + JetBrains Mono)
//   2. Validate required env vars
//   3. Render AppNavigator (which handles all routing + NetInfo)
// ─────────────────────────────────────────────────────────────
import React        from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
}                   from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
}                   from '@expo-google-fonts/jetbrains-mono';

import { registerRootComponent } from 'expo';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors }   from './src/constants/colors';

// ── Env validation (fails fast in dev) ───────────────────────
if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    '\n[Z-AI] ⚠  EXPO_PUBLIC_API_URL is not set.\n' +
    'Create .env with: EXPO_PUBLIC_API_URL=http://localhost:3000\n'
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // Font loading state — show minimal dark splash
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={Colors.surfaceTint} size="large" />
      </View>
    );
  }

  // Font load failure — still render (system fonts will be used as fallback)
  if (fontError && __DEV__) {
    console.warn('[Z-AI] Font load failed:', fontError.message);
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  splash: {
    flex:            1,
    backgroundColor: Colors.background,
    alignItems:      'center',
    justifyContent:  'center',
  },
});
