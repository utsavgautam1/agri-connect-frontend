import React, { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import store from './src/store';
import { ThemeProvider, LIGHT, DARK } from './src/context/ThemeContext';
import { I18nProvider } from './src/utils/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import AnimatedSplashScreen from './AnimatedSplashScreen';
import * as NS from './src/services/notifications';
import {
  loadPersistedSettings,
  selectIsHydrated,
  selectTheme,
} from './src/store/slices/appSlice';

// ── Keep native splash alive until we take over with JS animation ────────────
SplashScreen.preventAutoHideAsync();

const buildNavTheme = (isDark) => ({
  ...(isDark ? DarkTheme : DefaultTheme),
  dark: isDark,
  colors: {
    ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
    primary:      isDark ? DARK.primary  : LIGHT.primary,
    background:   isDark ? DARK.bg       : LIGHT.bg,
    card:         isDark ? DARK.headerBg : LIGHT.headerBg,
    text:         isDark ? DARK.textDark : LIGHT.textDark,
    border:       isDark ? DARK.border   : LIGHT.border,
    notification: isDark ? DARK.accent   : LIGHT.accent,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const dispatch    = useDispatch();
  const isHydrated  = useSelector(selectIsHydrated);
  const themeMode   = useSelector(selectTheme);
  const isDark      = themeMode === 'dark';
  const navTheme    = buildNavTheme(isDark);

  // Controls whether the animated splash is still showing
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(loadPersistedSettings());
    NS.registerForPushNotifications().catch(console.warn);
    NS.scheduleMorningTip().catch(console.warn);

    const sub = NS.addNotificationResponseListener((response) => {
      const { type } = response.notification.request.content.data || {};
      console.log('[App] Notification tapped, type:', type);
    });
    return () => sub.remove();
  }, [dispatch]);

  // Called by AnimatedSplashScreen when its animation completes
  const onSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#1B5E20' }}>
      {/* ── Main app — rendered beneath the splash overlay ── */}
      {isHydrated && (
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      )}

      {/* ── Animated splash overlay — shown until animation ends ── */}
      {showSplash && (
        <AnimatedSplashScreen
          isReady={isHydrated}   // waits for Redux before animating
          onFinish={onSplashFinish}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <I18nProvider>
          <SafeAreaProvider>
            <AppInner />
          </SafeAreaProvider>
        </I18nProvider>
      </ThemeProvider>
    </Provider>
  );
}