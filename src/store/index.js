import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import weatherReducer from './slices/weatherSlice';
import appReducer from './slices/appSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    weather: weatherReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Allow non-serializable values only if needed (e.g. Date objects)
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Typed hooks — use these throughout the app instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;