/**
 * constants.js
 * Centralised app-wide constants (non-theme, non-color).
 * Import from here instead of hard-coding values in components.
 */

// ── App metadata ──────────────────────────────────────────────────────────────
export const APP_NAME    = 'Agri-Connect';
export const APP_VERSION = '1.0.0';

// ── API & network ─────────────────────────────────────────────────────────────
export const API_TIMEOUT_MS   = 15000;  // 15 s general timeout
export const AI_TIMEOUT_MS    = 30000;  // 30 s for AI inference endpoints
export const CACHE_TTL_MS     = 30 * 60 * 1000; // 30 min stale threshold

// ── Storage keys ──────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN:       'agri_connect_auth_token',
  USER_PROFILE:     'agri_connect_user',
  WEATHER_CACHE:    'agri_connect_weather_cache',
  MARKET_CACHE:     'agri_connect_market_cache',
  ADVISORY_CACHE:   'agri_connect_advisory_cache',
  OFFLINE_QUEUE:    'agri_connect_offline_queue',
  ONBOARDING_DONE:  'agri_connect_onboarding_done',
  PUSH_TOKEN:       'agri_connect_push_token',
  SETTINGS:         'agri_connect_settings',
};

// ── Navigation route names ────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  LOGIN:    'Login',
  REGISTER: 'Register',
  // Main tabs
  HOME:       'Home',
  WEATHER:    'Weather',
  DISEASE:    'Disease',
  MARKET:     'Market',
  // Stack screens
  ADVISORY:   'Advisory',
  SOIL:       'SoilAnalysis',
  SMS:        'SMS',
  SETTINGS:   'Settings',
};

// ── Crop categories ───────────────────────────────────────────────────────────
export const CROP_CATEGORIES = [
  'Cereals', 'Legumes', 'Vegetables', 'Fruits', 'Cash Crops', 'Livestock',
];

// ── Soil pH ranges ────────────────────────────────────────────────────────────
export const SOIL_PH = {
  VERY_ACIDIC:    { min: 0,   max: 5.0, label: 'Very Acidic',    action: 'Apply heavy lime treatment.' },
  ACIDIC:         { min: 5.0, max: 5.5, label: 'Acidic',         action: 'Apply agricultural lime.' },
  SLIGHTLY_ACIDIC:{ min: 5.5, max: 6.5, label: 'Slightly Acidic',action: 'Monitor; suitable for most crops.' },
  NEUTRAL:        { min: 6.5, max: 7.5, label: 'Neutral',        action: 'Ideal for most crops.' },
  ALKALINE:       { min: 7.5, max: 14,  label: 'Alkaline',       action: 'Add sulfur or organic matter.' },
};

// ── Advisory categories ───────────────────────────────────────────────────────
export const ADVISORY_CATEGORIES = [
  { id: 'planting',   label: 'Planting Tips',       icon: 'leaf'          },
  { id: 'pest',       label: 'Pest & Disease',      icon: 'bug'           },
  { id: 'irrigation', label: 'Irrigation',          icon: 'water'         },
  { id: 'fertilizer', label: 'Fertilizer Guide',    icon: 'flask'         },
  { id: 'harvest',    label: 'Harvest Calendar',    icon: 'calendar'      },
  { id: 'market',     label: 'Market Insights',     icon: 'trending-up'   },
];

// ── Notification channels ─────────────────────────────────────────────────────
export const NOTIFICATION_CHANNELS = {
  WEATHER:  { id: 'weather_alerts',  name: 'Weather Alerts',  desc: 'Rain and extreme weather warnings' },
  MARKET:   { id: 'market_prices',   name: 'Market Prices',   desc: 'Price change notifications' },
  ADVISORY: { id: 'advisory',        name: 'Expert Advisory', desc: 'Farming tips and seasonal advice' },
  DISEASE:  { id: 'disease_alert',   name: 'Disease Alerts',  desc: 'Regional disease outbreak warnings' },
};

// ── Supported languages ───────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English'   },
  { code: 'sw', label: 'Swahili'   },
  { code: 'fr', label: 'Français'  },
  { code: 'am', label: 'Amharic'   },
];

// ── Units ─────────────────────────────────────────────────────────────────────
export const TEMP_UNITS  = ['°C', '°F'];
export const AREA_UNITS  = ['Acres', 'Hectares'];
export const PRICE_CURRENCIES = ['KES', 'USD', 'UGX', 'TZS', 'ETB'];

// ── Offline queue action types ────────────────────────────────────────────────
export const OFFLINE_ACTIONS = {
  POST_ADVISORY_QUESTION: 'POST_ADVISORY_QUESTION',
  SUBMIT_SOIL_READING:    'SUBMIT_SOIL_READING',
  SEND_SMS_ALERT:         'SEND_SMS_ALERT',
};