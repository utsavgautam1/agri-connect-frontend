import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreToken, logoutUser } from '../store/slices/authSlice';
import { storage } from '../services/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getToken();
      const user = await storage.getUser();
      
      if (token && user) {
        dispatch(restoreToken({ token, user }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);