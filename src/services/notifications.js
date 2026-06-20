import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications only work on physical devices.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('agri-alerts', {
      name: 'Agri-Connect Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: true,
    });
  }

  try {
    // projectId is required in bare/managed workflow outside Expo Go
    const projectId =
      typeof Constants !== 'undefined' &&
      Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    console.log('[Notifications] Push token:', tokenData.data);
    return tokenData.data;
  } catch (e) {
    console.warn('[Notifications] Could not get push token:', e.message);
    return null;
  }
};

// ── Listen for notification taps (when app is backgrounded) ───────────────────
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// ── Listen for notifications received while app is open ───────────────────────
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// ── Schedule a local notification immediately ─────────────────────────────────
export const sendLocalNotification = async ({ title, body, data = {} }) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null, // null = show immediately
  });
};

// ── Schedule a notification at a specific time ────────────────────────────────
export const scheduleNotification = async ({ title, body, data = {}, date }) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: { date },
  });
};

// ── Schedule a daily repeating notification ───────────────────────────────────
export const scheduleDailyNotification = async ({ title, body, hour = 7, minute = 0 }) => {
  // Cancel existing daily notifications first to avoid duplicates
  await cancelNotificationsByTag('daily');
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data: { tag: 'daily' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

// ── Cancel all scheduled notifications ───────────────────────────────────────
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// ── Cancel notifications by tag ───────────────────────────────────────────────
export const cancelNotificationsByTag = async (tag) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content?.data?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
};

// ── Pre-built alert senders ───────────────────────────────────────────────────

export const sendWeatherAlert = async (message) => {
  await sendLocalNotification({
    title: '🌦️ Weather Alert',
    body: message,
    data: { type: 'weather' },
  });
};

export const sendMarketAlert = async (message) => {
  await sendLocalNotification({
    title: '📊 Market Update',
    body: message,
    data: { type: 'market' },
  });
};

export const sendAdvisoryAlert = async (message) => {
  await sendLocalNotification({
    title: '🌱 Farming Advisory',
    body: message,
    data: { type: 'advisory' },
  });
};

// ── Schedule morning farming tip (7:00 AM daily) ─────────────────────────────
export const scheduleMorningTip = async () => {
  await scheduleDailyNotification({
    title: '🌄 Good Morning, Farmer!',
    body: 'Check today\'s market prices and weather advisory.',
    hour: 7,
    minute: 0,
  });
};

export default {
  registerForPushNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  sendLocalNotification,
  scheduleNotification,
  scheduleDailyNotification,
  cancelAllNotifications,
  sendWeatherAlert,
  sendMarketAlert,
  sendAdvisoryAlert,
  scheduleMorningTip,
};