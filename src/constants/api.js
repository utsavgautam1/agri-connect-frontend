/**
 * api.js
 *
 * Centralised API endpoint constants.
 * All base URLs and endpoint paths live here — no magic strings in API files.
 *
 * Usage:
 *   import { WEATHER_API, ENDPOINTS } from '../constants/api';
 *   const url = `${WEATHER_API.BASE_URL}${ENDPOINTS.WEATHER.CURRENT}`;
 */

// ─── Base URLs ────────────────────────────────────────────────────────────────
// Pulled from environment variables set in .env
// Fallbacks provided for development without a .env file.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.agri-connect.app/v1';

export const WEATHER_BASE_URL =
  process.env.EXPO_PUBLIC_WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

export const MARKET_BASE_URL =
  process.env.EXPO_PUBLIC_MARKET_API_URL || API_BASE_URL;

export const DISEASE_BASE_URL =
  process.env.EXPO_PUBLIC_DISEASE_API_URL || API_BASE_URL;

export const SOIL_BASE_URL =
  process.env.EXPO_PUBLIC_SOIL_API_URL || API_BASE_URL;

export const ADVISORY_BASE_URL =
  process.env.EXPO_PUBLIC_ADVISORY_API_URL || API_BASE_URL;

// ─── API Keys (read from .env, never hardcoded) ───────────────────────────────
export const API_KEYS = {
  OPENWEATHER: process.env.EXPO_PUBLIC_OPENWEATHER_KEY || '',
  MARKET:      process.env.EXPO_PUBLIC_MARKET_API_KEY  || '',
  DISEASE:     process.env.EXPO_PUBLIC_DISEASE_API_KEY || '',
};

// ─── Timeouts (ms) ────────────────────────────────────────────────────────────
export const TIMEOUTS = {
  DEFAULT:  15000,  // 15 s — standard API calls
  WEATHER:  10000,  // 10 s — weather is time-sensitive
  UPLOAD:   30000,  // 30 s — image upload for disease AI
  ADVISORY: 15000,
};

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN:    '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT:   '/auth/logout',
  REFRESH:  '/auth/refresh',
  PROFILE:  '/auth/profile',
};

// ─── Weather Endpoints ────────────────────────────────────────────────────────
export const WEATHER_ENDPOINTS = {
  CURRENT:  '/weather',        // GET ?lat=&lon=&appid=
  FORECAST: '/forecast',       // GET ?lat=&lon=&appid= (5-day/3-hour)
  AIR:      '/air_pollution',  // GET ?lat=&lon=&appid=
};

// ─── Market Endpoints ─────────────────────────────────────────────────────────
export const MARKET_ENDPOINTS = {
  PRICES:        '/market/prices',          // GET ?category=&limit=
  PRICE_HISTORY: '/market/prices/:id/history', // GET ?days=
  CATEGORIES:    '/market/categories',      // GET
};

// ─── Disease Detection Endpoints ─────────────────────────────────────────────
export const DISEASE_ENDPOINTS = {
  ANALYZE: '/disease/analyze',    // POST multipart/form-data
  COMMON:  '/disease/common',     // GET ?crop=
};

// ─── Soil Endpoints ───────────────────────────────────────────────────────────
export const SOIL_ENDPOINTS = {
  ANALYZE: '/soil/analyze',   // POST { n, p, k, ph, location? }
  HISTORY: '/soil/history',   // GET
};

// ─── Advisory Endpoints ───────────────────────────────────────────────────────
export const ADVISORY_ENDPOINTS = {
  LIST:      '/advisory',              // GET ?category=&limit=
  DETAIL:    '/advisory/:id',          // GET
  QUESTIONS: '/advisory/questions',    // POST { question, cropType, location }
};

// ─── SMS / Notification Endpoints ─────────────────────────────────────────────
export const SMS_ENDPOINTS = {
  SEND:        '/sms/send',          // POST { phone, message }
  SUBSCRIBE:   '/sms/subscribe',     // POST { phone, types[] }
  UNSUBSCRIBE: '/sms/unsubscribe',   // POST { phone, types[] }
};

export const PUSH_ENDPOINTS = {
  REGISTER: '/push/register',    // POST { token, platform }
  DEREGISTER: '/push/deregister', // DELETE { token }
};


export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
};


export const HTTP_STATUS = {
  OK:           200,
  CREATED:      201,
  NO_CONTENT:   204,
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  TOO_MANY:     429,
  SERVER_ERROR: 500,
  BAD_GATEWAY:  502,
  UNAVAILABLE:  503,
};


/**
 * buildUrl('/market/prices/:id/history', { id: '42' })
 * → '/market/prices/42/history'
 */
export const buildUrl = (template, params = {}) =>
  Object.entries(params).reduce(
    (url, [key, val]) => url.replace(`:${key}`, encodeURIComponent(val)),
    template
  );

export default {
  API_BASE_URL,
  WEATHER_BASE_URL,
  MARKET_BASE_URL,
  DISEASE_BASE_URL,
  SOIL_BASE_URL,
  ADVISORY_BASE_URL,
  API_KEYS,
  TIMEOUTS,
  AUTH_ENDPOINTS,
  WEATHER_ENDPOINTS,
  MARKET_ENDPOINTS,
  DISEASE_ENDPOINTS,
  SOIL_ENDPOINTS,
  ADVISORY_ENDPOINTS,
  SMS_ENDPOINTS,
  PUSH_ENDPOINTS,
  PAGINATION,
  HTTP_STATUS,
  buildUrl,
};