import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store';
import { selectIsAuthenticated, selectIsRestoring, restoreSession } from '../store/slices/authSlice';
import AppNavigator  from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const RootNavigator = () => {
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRestoring     = useAppSelector(selectIsRestoring);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
  },
});

export default RootNavigator;