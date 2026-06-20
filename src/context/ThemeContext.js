/**
 * ThemeContext.js — Global Dark/Light Theme
 * Place at: src/context/ThemeContext.js
 *
 * Usage in ANY screen:
 *   import { useTheme } from '../../context/ThemeContext';
 *   const { colors, isDark } = useTheme();
 */
import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, selectTheme } from '../store/slices/appSlice';

export const LIGHT = {
  bg: '#F1F8E9', surface: '#FFFFFF', card: '#FFFFFF', input: '#F9FBE7',
  primary: '#2E7D32', primaryLight: '#A5D6A7', primaryDark: '#1B5E20',
  textDark: '#1B2E1B', textPrimary: '#1B5E20', textSecondary: '#558B2F', textMuted: '#8D9E7E', textLight: '#FFFFFF',
  border: '#C8E6C9', divider: '#DCEDC8',
  success: '#388E3C', warning: '#F57C00', error: '#D32F2F', info: '#0288D1', accent: '#FFA000',
  tabActive: '#2E7D32', tabInactive: '#A5D6A7', tabBg: '#FFFFFF',
  earth: '#795548', shadow: '#000000',
  headerBg: '#FFFFFF', statusBar: 'dark-content',
};

export const DARK = {
  bg: '#0F1A0F', surface: '#1A2A1A', card: '#1E2E1E', input: '#162216',
  primary: '#4CAF50', primaryLight: '#2E7D32', primaryDark: '#81C784',
  textDark: '#E8F5E9', textPrimary: '#A5D6A7', textSecondary: '#81C784', textMuted: '#6A8A6A', textLight: '#FFFFFF',
  border: '#2A4A2A', divider: '#1E3A1E',
  success: '#4CAF50', warning: '#FFB74D', error: '#EF5350', info: '#29B6F6', accent: '#FFB300',
  tabActive: '#4CAF50', tabInactive: '#2E7D32', tabBg: '#1A2A1A',
  earth: '#A1887F', shadow: '#000000',
  headerBg: '#1A2A1A', statusBar: 'light-content',
};

const ThemeContext = createContext({ colors: LIGHT, isDark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const isDark = themeMode === 'dark';
  const colors = isDark ? DARK : LIGHT;
  const toggleTheme = () => dispatch(setTheme(isDark ? 'light' : 'dark'));
  const setDark = (val) => dispatch(setTheme(val ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);