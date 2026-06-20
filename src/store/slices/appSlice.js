import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';


const STORAGE_KEYS = {
  THEME: '@agri_theme',
  NOTIFICATIONS: '@agri_notifications',
  LANGUAGE: '@agri_language',
};

// ── Thunk: restore persisted settings on app launch ──────────────────────────
export const loadPersistedSettings = createAsyncThunk(
  'app/loadPersistedSettings',
  async () => {
    try {
      const [theme, notifications, language] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
      ]);
      return {
        theme: theme || 'light',
        notifications: notifications ? JSON.parse(notifications) : null,
        language: language || 'en',
      };
    } catch (e) {
      console.warn('[appSlice] Failed to load persisted settings:', e);
      return {};
    }
  }
);

const initialState = {
  isOnline:     true,
  theme:        'light',
  language:     'en',
  isFirstLaunch: true,
  isHydrated:   false,
  notifications: {
    enabled:  true,
    weather:  true,
    market:   true,
    advisory: true,
  },
  offlineQueueCount: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus(state, action) {
      state.isOnline = !!action.payload;
    },

    setTheme(state, action) {
      state.theme = action.payload;
      // Persist immediately
      AsyncStorage.setItem(STORAGE_KEYS.THEME, action.payload).catch(() => {});
    },

    setLanguage(state, action) {
      state.language = action.payload;
      AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, action.payload).catch(() => {});
    },

    setFirstLaunch(state, action) {
      state.isFirstLaunch = action.payload;
    },

    setHydrated(state) {
      state.isHydrated = true;
    },

    updateNotificationSettings(state, action) {
      state.notifications = { ...state.notifications, ...action.payload };
      // Persist immediately
      AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(state.notifications)
      ).catch(() => {});
    },

    setOfflineQueueCount(state, action) {
      state.offlineQueueCount = action.payload;
    },

    incrementOfflineQueue(state) {
      state.offlineQueueCount += 1;
    },

    decrementOfflineQueue(state) {
      state.offlineQueueCount = Math.max(0, state.offlineQueueCount - 1);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadPersistedSettings.fulfilled, (state, action) => {
        const { theme, notifications, language } = action.payload;
        if (theme)         state.theme = theme;
        if (notifications) state.notifications = notifications;
        if (language)      state.language = language;
        state.isHydrated = true;  // ✅ unblocks the render gate in App.js
      })
      // ── CRITICAL FIX ──────────────────────────────────────────────────────
      // If AsyncStorage throws (first launch, permissions issue, etc.),
      // the app was previously stuck on the loading spinner forever because
      // isHydrated was never set to true in the rejected case.
      .addCase(loadPersistedSettings.rejected, (state) => {
        state.isHydrated = true;  // ✅ always unblock, even on failure
      });
  },
});

export const {
  setOnlineStatus,
  setTheme,
  setLanguage,
  setFirstLaunch,
  setHydrated,
  updateNotificationSettings,
  setOfflineQueueCount,
  incrementOfflineQueue,
  decrementOfflineQueue,
} = appSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectIsOnline          = (state) => state.app.isOnline;
export const selectTheme             = (state) => state.app.theme;
export const selectLanguage          = (state) => state.app.language;
export const selectIsFirstLaunch     = (state) => state.app.isFirstLaunch;
export const selectIsHydrated        = (state) => state.app.isHydrated;
export const selectNotifications     = (state) => state.app.notifications;
export const selectOfflineQueueCount = (state) => state.app.offlineQueueCount;

export default appSlice.reducer;