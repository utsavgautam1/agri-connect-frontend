import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CACHE_TTL_MS } from '../utils/constants';

/**
 * offline.js
 *
 * Two responsibilities:
 *  1. Cache API responses so the app shows data when offline.
 *  2. Maintain an offline action queue so user actions made
 *     offline are replayed when connectivity is restored.
 */

// ── Cache helpers ─────────────────────────────────────────────────────────────

/**
 * Save data to AsyncStorage with a timestamp.
 * @param {string} key   — one of STORAGE_KEYS
 * @param {any}    data  — JSON-serialisable value
 */
export const cacheData = async (key, data) => {
  try {
    const payload = JSON.stringify({ data, cachedAt: Date.now() });
    await AsyncStorage.setItem(key, payload);
  } catch (err) {
    console.warn('[Offline] cacheData failed:', err.message);
  }
};

/**
 * Retrieve cached data.
 * Returns { data, cachedAt, isStale } or null if not found.
 * @param {string} key
 * @param {number} ttlMs — optional custom TTL (defaults to CACHE_TTL_MS)
 */
export const getCachedData = async (key, ttlMs = CACHE_TTL_MS) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const { data, cachedAt } = JSON.parse(raw);
    const isStale = Date.now() - cachedAt > ttlMs;

    return { data, cachedAt, isStale };
  } catch {
    return null;
  }
};

/** Remove a single cache entry. */
export const invalidateCache = async (key) => {
  try { await AsyncStorage.removeItem(key); } catch { /* silent */ }
};

/** Clear all Agri-Connect cache keys. */
export const clearAllCache = async () => {
  const keys = [
    STORAGE_KEYS.WEATHER_CACHE,
    STORAGE_KEYS.MARKET_CACHE,
    STORAGE_KEYS.ADVISORY_CACHE,
  ];
  try { await AsyncStorage.multiRemove(keys); } catch { /* silent */ }
};

// ── Offline Action Queue ──────────────────────────────────────────────────────

/**
 * Enqueue an action to be replayed when the device comes online.
 * @param {{ type: string, payload: any }} action
 */
export const enqueueOfflineAction = async (action) => {
  try {
    const existing = await getOfflineQueue();
    const updated  = [...existing, { ...action, queuedAt: Date.now(), id: `${Date.now()}-${Math.random()}` }];
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.warn('[Offline] enqueueOfflineAction failed:', err.message);
  }
};

/**
 * Read the full offline queue.
 * @returns {Promise<object[]>}
 */
export const getOfflineQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Remove a specific action from the queue by id (after it's been replayed).
 */
export const dequeueOfflineAction = async (id) => {
  try {
    const queue   = await getOfflineQueue();
    const updated = queue.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.warn('[Offline] dequeueOfflineAction failed:', err.message);
  }
};

/** Clear the entire queue (e.g. after all actions replayed successfully). */
export const clearOfflineQueue = async () => {
  try { await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE); } catch { /* silent */ }
};

// ── Convenience: cache common API responses ────────────────────────────────

export const cacheWeatherData    = (data) => cacheData(STORAGE_KEYS.WEATHER_CACHE,  data);
export const cacheMarketData     = (data) => cacheData(STORAGE_KEYS.MARKET_CACHE,   data);
export const cacheAdvisoryData   = (data) => cacheData(STORAGE_KEYS.ADVISORY_CACHE, data);

export const getCachedWeather    = ()     => getCachedData(STORAGE_KEYS.WEATHER_CACHE);
export const getCachedMarket     = ()     => getCachedData(STORAGE_KEYS.MARKET_CACHE);
export const getCachedAdvisory   = ()     => getCachedData(STORAGE_KEYS.ADVISORY_CACHE);