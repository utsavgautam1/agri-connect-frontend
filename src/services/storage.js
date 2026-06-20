import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'agri_connect_auth_token';
const USER_KEY  = 'agri_connect_user';

// ─── Helpers ────────────────────────────────────────────────────────────────

const secureSet = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore unavailable (e.g. web) — silently ignore
  }
};

const secureGet = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const secureDelete = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // silently ignore
  }
};

// ─── Token ──────────────────────────────────────────────────────────────────

export const saveToken = async (token) => {
  await secureSet(TOKEN_KEY, token);
};

export const getToken = async () => {
  return secureGet(TOKEN_KEY);
};

export const removeToken = async () => {
  await secureDelete(TOKEN_KEY);
};

// ─── User Profile ───────────────────────────────────────────────────────────

export const saveUser = async (user) => {
  await secureSet(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await secureGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const removeUser = async () => {
  await secureDelete(USER_KEY);
};

// ─── Clear All ──────────────────────────────────────────────────────────────

export const clearAll = async () => {
  await Promise.all([removeToken(), removeUser()]);
};