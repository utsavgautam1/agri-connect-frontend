import axios from 'axios';
import {
  API_BASE_URL,
  APP_ENV,
  ENABLE_OFFLINE_MODE,
} from '@env';
import { storage } from '../services/storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * ─── HOW TO SET YOUR API URL ────────────────────────────────────
 *
 *  Open your .env file and set:
 *
 *  DEVELOPMENT (your phone + computer on same Wi-Fi):
 *    API_BASE_URL=http://192.168.X.X:8000/api/v1
 *    → Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
 *    → Your phone and computer must be on the same Wi-Fi network
 *
 *  PRODUCTION (real users on the internet):
 *    API_BASE_URL=https://api.agri-connect.app/api/v1
 *    → Your backend must be deployed to a cloud server first
 *
 *  NEVER use 'localhost' — on a phone it means the phone itself
 * ────────────────────────────────────────────────────────────────
 */

const isDev = APP_ENV === 'development' || __DEV__;
const offlineModeEnabled = ENABLE_OFFLINE_MODE === 'true';

// ✅ Catch missing API URL immediately at startup — not silently later
if (!API_BASE_URL) {
  throw new Error(
    '\n\n❌ API_BASE_URL is missing from your .env file.\n' +
    'Add one of these lines to your .env:\n' +
    '  API_BASE_URL=http://192.168.X.X:8000/api/v1   ← development\n' +
    '  API_BASE_URL=https://your-backend.com/api/v1   ← production\n'
  );
}

if (isDev) {
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
}

// ─── AXIOS INSTANCE ──────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL, // No localhost fallback — .env is the single source of truth
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Check connectivity
    if (offlineModeEnabled) {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        const offlineError = new Error(
          'No internet connection. Please check your network and try again.'
        );
        offlineError.isOffline = true; // Flag so your UI can show the right message
        return Promise.reject(offlineError);
      }
    }

    // 2. Attach auth token if available
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Log requests in dev mode
    if (isDev) {
      console.log(`➡️  ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    
    if (isDev) {
      console.error('❌ API Error:', {
        url: `${originalRequest?.baseURL}${originalRequest?.url}`,
        method: originalRequest?.method?.toUpperCase(),
        status: error.response?.status ?? 'NO RESPONSE',
        message: error.message,
        data: error.response?.data,
      });
    }

    // 401: Token expired → clear session, auth context handles redirect
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await storage.clearAll();
      // Your AuthContext detects cleared token and navigates to Login
    }

    // Attach user-friendly message for your UI to display
    if (!error.response) {
      // No response = server unreachable (the "Network Error" you were seeing)
      error.userMessage =
        'Cannot reach the server. Please check your internet or try again later.';
    } else {
      switch (error.response.status) {
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid request. Please check your inputs.';
          break;
        case 401:
          error.userMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          error.userMessage = 'You do not have permission to do this.';
          break;
        case 404:
          error.userMessage = 'The requested resource was not found.';
          break;
        case 422:
          error.userMessage = error.response.data?.message || 'Validation failed.';
          break;
        case 500:
        default:
          error.userMessage = 'Server error. Please try again later.';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;