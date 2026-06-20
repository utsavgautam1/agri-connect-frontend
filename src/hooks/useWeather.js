import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadWeather,
  selectCurrentWeather,
  selectForecast,
  selectWeatherLoading,
  selectWeatherRefreshing,
  selectWeatherError,
  selectLastUpdated,
  selectWeatherCoords,
  clearWeatherError,
  clearWeather,
} from '../store/slices/weatherSlice';

/**
 * useWeather
 *
 * Wraps all weather-related Redux state and actions.
 * Auto-fetches on mount. Exposes refresh and clear helpers.
 *
 * Usage:
 *   const { current, forecast, isLoading, refresh } = useWeather();
 */
const useWeather = ({ autoFetch = true } = {}) => {
  const dispatch = useAppDispatch();

  const current     = useAppSelector(selectCurrentWeather);
  const forecast    = useAppSelector(selectForecast);
  const isLoading   = useAppSelector(selectWeatherLoading);
  const isRefreshing= useAppSelector(selectWeatherRefreshing);
  const error       = useAppSelector(selectWeatherError);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const coords      = useAppSelector(selectWeatherCoords);

  useEffect(() => {
    if (autoFetch && !current) {
      dispatch(loadWeather());
    }
  }, [autoFetch]);

  const refresh = useCallback(() => {
    dispatch(loadWeather(coords ? { ...coords, isRefresh: true } : undefined));
  }, [dispatch, coords]);

  const fetch = useCallback((coordsOverride) => {
    dispatch(loadWeather(coordsOverride));
  }, [dispatch]);

  const dismissError = useCallback(() => dispatch(clearWeatherError()), [dispatch]);
  const reset        = useCallback(() => dispatch(clearWeather()),      [dispatch]);

  const hasData  = !!current;
  const isStale  = lastUpdated
    ? Date.now() - new Date(lastUpdated).getTime() > 30 * 60 * 1000  // > 30 min
    : false;

  return {
    current,
    forecast,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    coords,
    hasData,
    isStale,
    refresh,
    fetch,
    dismissError,
    reset,
  };
};

export default useWeather;
