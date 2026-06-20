import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';
import colors from '../../constants/colors';
import theme from '../../constants/theme';
import { APP_VERSION } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

// Responsive sizing so the badge/decorative circles scale sensibly
// across phones and tablets instead of using fixed pixel values.
const LOGO_SIZE = Math.min(width, height) * 0.28;
const CIRCLE_LARGE = width * 0.68;
const CIRCLE_SMALL = width * 0.85;

const MIN_DISPLAY_MS = 1600; // ms — ensures brand moment even on fast devices

/**
 * SplashScreen
 *
 * Shown on cold start while:
 *  1. Session restore runs (reads SecureStore for existing JWT)
 *  2. Minimum brand display time elapses (1.6 s)
 *
 * Once both complete, navigation switches automatically via RootNavigator
 * reacting to isHydrated + isAuthenticated in Redux.
 *
 * Props:
 *  onReady — callback fired when the splash can be dismissed
 *            (useful if parent controls the gate instead of Redux)
 */
const SplashScreen = ({ onReady }) => {
  const { restoreSession } = useAuth();

  // ── Animation values ────────────────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([
    new Animated.Value(0.25),
    new Animated.Value(0.25),
    new Animated.Value(0.25),
  ]).current;

  // Refs used purely for cleanup on unmount
  const isMountedRef = useRef(true);
  const dotLoopRef = useRef(null);

  // ── Main effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;

    // 1. Entrance sequence — logo pops in, name slides up, tagline fades in
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();

    // 2. Breathing dots loop.
    // FIX: previously each dot's `delay` lived inside the sequence that
    // Animated.loop repeated, which gave each dot a different total cycle
    // length — they drifted out of sync after the first loop. Using
    // Animated.stagger to build one composite animation (and looping that
    // composite) keeps all three dots locked to the same cycle forever.
    const dotLoop = Animated.loop(
      Animated.stagger(
        160,
        dotAnims.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.25,
              duration: 450,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    dotLoopRef.current = dotLoop;
    dotLoop.start();

    // 3. Session restore + minimum brand display time.
    // FIX: the original had no .catch(), so a rejected restoreSession()
    // promise meant onReady() never fired and the app got stuck on the
    // splash screen forever. We now always resolve to "finish" regardless
    // of success/failure.
    const startedAt = Date.now();
    let dismissTimer;

    const finish = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      dismissTimer = setTimeout(() => {
        if (isMountedRef.current && onReady) onReady();
      }, remaining);
    };

    Promise.resolve()
      .then(() => restoreSession?.())
      .catch((err) => {
        if (__DEV__) {
          console.warn('SplashScreen: restoreSession failed', err);
        }
        // Swallow the error — a failed restore should still let the app
        // proceed (RootNavigator/login flow will handle the unauthenticated
        // state), not strand the user on the splash screen.
      })
      .finally(finish);

    // FIX: cleanup so timers/animations don't keep running — and onReady
    // doesn't fire — after this component has unmounted.
    return () => {
      isMountedRef.current = false;
      if (dismissTimer) clearTimeout(dismissTimer);
      entrance.stop();
      dotLoopRef.current?.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* ── Background decorative circles ── */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* ── Logo ── */}
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoBadge}>
          <View style={styles.logoBadgeInnerRing} />
          <Ionicons name="leaf" size={LOGO_SIZE * 0.4} color={colors.white} />
        </View>
      </Animated.View>

      {/* ── App Name ── */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textSlide }],
          alignItems: 'center',
        }}
      >
        <Text style={styles.appName}>Agri-Connect</Text>
      </Animated.View>

      {/* ── Tagline ── */}
      <Animated.View
        style={{ opacity: taglineOpacity, alignItems: 'center', marginTop: theme.spacing.sm }}
      >
        <Text style={styles.tagline}>Smart farming at your fingertips</Text>
        <View style={styles.taglineLine} />
      </Animated.View>

      {/* ── Loading dots ── */}
      <View style={styles.dotsRow}>
        {dotAnims.map((dotOpacity, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dotOpacity }]} />
        ))}
      </View>

      {/* ── Version number ── */}
      <Text style={styles.version}>v{APP_VERSION}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative background shapes — now sized relative to screen width
  // so they scale sensibly across phones and tablets.
  circleTopRight: {
    position: 'absolute',
    top: -CIRCLE_LARGE * 0.25,
    right: -CIRCLE_LARGE * 0.25,
    width: CIRCLE_LARGE,
    height: CIRCLE_LARGE,
    borderRadius: CIRCLE_LARGE / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -CIRCLE_SMALL * 0.27,
    left: -CIRCLE_SMALL * 0.27,
    width: CIRCLE_SMALL,
    height: CIRCLE_SMALL,
    borderRadius: CIRCLE_SMALL / 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  logoWrapper: { marginBottom: theme.spacing.xl },
  logoBadge: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  // Subtle inner ring adds depth to the badge without needing an extra
  // asset or a blur dependency.
  logoBadgeInnerRing: {
    position: 'absolute',
    width: LOGO_SIZE * 0.78,
    height: LOGO_SIZE * 0.78,
    borderRadius: (LOGO_SIZE * 0.78) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: colors.primaryLighter,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  taglineLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.primaryLighter,
    borderRadius: 1,
    marginTop: theme.spacing.sm,
    opacity: 0.6,
  },

  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4, // FIX: replaces unsupported `gap` (RN < 0.71 / some Android builds)
    backgroundColor: colors.primaryLighter,
  },

  version: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 28 : 40,
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
});

export default SplashScreen;