import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from '../store';
import { setOnlineStatus } from '../store/slices/appSlice';

/**
 * useNetwork
 *
 * Subscribes to device network events and syncs status
 * to both local state (for immediate UI feedback) and
 * the Redux store (for global access).
 *
 * Returns:
 *   isOnline    — boolean
 *   isWifi      — boolean
 *   isCellular  — boolean
 *   strength    — signal strength (0–4) if available
 *   checkNow()  — manually trigger a connectivity check
 */
const useNetwork = () => {
  const dispatch = useAppDispatch();
  const [networkState, setNetworkState] = useState({
    isOnline:   true,
    isWifi:     false,
    isCellular: false,
    type:       'unknown',
    strength:   null,
    isChecking: false,
  });

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  const handleNetInfoChange = useCallback((state) => {
    if (!isMounted.current) return;

    const isOnline   = state.isConnected && state.isInternetReachable !== false;
    const isWifi     = state.type === 'wifi';
    const isCellular = state.type === 'cellular';
    const strength   = state.details?.strength ?? null;

    setNetworkState({
      isOnline:   !!isOnline,
      isWifi:     !!isWifi,
      isCellular: !!isCellular,
      type:       state.type,
      strength,
      isChecking: false,
    });

    dispatch(setOnlineStatus(!!isOnline));
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

    NetInfo.fetch().then(handleNetInfoChange);

    return unsubscribe;
  }, [handleNetInfoChange]);

  const checkNow = useCallback(async () => {
    setNetworkState((prev) => ({ ...prev, isChecking: true }));
    const state = await NetInfo.fetch();
    handleNetInfoChange(state);
  }, [handleNetInfoChange]);

  return { ...networkState, checkNow };
};

export default useNetwork;