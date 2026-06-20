import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  authStart, authSuccess, authFailure, logout as logoutAction,
  selectUser, selectToken, selectIsAuthenticated,
  selectAuthLoading, selectAuthError, clearError,
} from '../store/slices/authSlice';
import { loginApi, registerApi, logoutApi } from '../api/authApi';
import { saveToken, saveUser, clearAll, getToken, getUser } from '../services/storage';

/**
 * useAuth
 *
 * Centralises all authentication logic. Screens call these
 * methods instead of dispatching actions directly, keeping
 * components thin and business logic testable.
 *
 * Returns:
 *   user, token, isAuthenticated, isLoading, error
 *   login(), register(), logout(), restoreSession()
 */
const useAuth = () => {
  const dispatch = useAppDispatch();

  const user            = useAppSelector(selectUser);
  const token           = useAppSelector(selectToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading       = useAppSelector(selectAuthLoading);
  const error           = useAppSelector(selectAuthError);

  const login = useCallback(async ({ email, password }) => {
    dispatch(authStart());
    try {
      const { user: u, token: t } = await loginApi({ email, password });
      await saveToken(t);
      await saveUser(u);
      dispatch(authSuccess({ user: u, token: t }));
      return { success: true };
    } catch (err) {
      dispatch(authFailure(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  const register = useCallback(async (data) => {
    dispatch(authStart());
    try {
      const { user: u, token: t } = await registerApi(data);
      await saveToken(t);
      await saveUser(u);
      dispatch(authSuccess({ user: u, token: t }));
      return { success: true };
    } catch (err) {
      dispatch(authFailure(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await logoutApi();      
    await clearAll();          
    dispatch(logoutAction());
  }, [dispatch]);

 
  const restoreSession = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([getToken(), getUser()]);
      if (t && u) {
        dispatch(authSuccess({ user: u, token: t }));
        return true;
      }
    } catch {
    }
    return false;
  }, [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    restoreSession,
    dismissError,
  };
};

export default useAuth;