import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken, getUser, clearAll } from '../../services/storage';

// ── Restore session on app launch ─────────────────────────────────────────────
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const token = await getToken();
    const user  = await getUser();
    if (token && user) return { token, user };
    return null;
  }
);

// ── Logout and clear SecureStore ──────────────────────────────────────────────
export const logoutAndClear = createAsyncThunk(
  'auth/logoutAndClear',
  async () => {
    await clearAll(); // removes token + user from phone's encrypted storage
  }
);

const initialState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       false,
  isRestoring:     true,  // true while checking SecureStore on launch
  error:           null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.isLoading = true;
      state.error     = null;
    },
    authSuccess(state, action) {
      const { user, token } = action.payload;
      state.user            = user;
      state.token           = token;
      state.isAuthenticated = true;
      state.isLoading       = false;
      state.error           = null;
    },
    authFailure(state, action) {
      state.isLoading = false;
      state.error     = action.payload;
    },
    updateUser(state, action) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
      state.error           = null;
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // restoreSession
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isRestoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoring = false;
        if (action.payload) {
          state.user            = action.payload.user;
          state.token           = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoring = false;
      });

    // logoutAndClear
    builder.addCase(logoutAndClear.fulfilled, (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
      state.error           = null;
    });
  },
});

export const {
  authStart, authSuccess, authFailure,
  updateUser, setToken, logout, clearError,
} = authSlice.actions;

export const selectUser            = (state) => state.auth.user;
export const selectToken           = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.isLoading;
export const selectAuthError       = (state) => state.auth.error;
export const selectIsRestoring     = (state) => state.auth.isRestoring;

export default authSlice.reducer;