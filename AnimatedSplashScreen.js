import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  Easing,
  StatusBar,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Timing constants (ms) ──────────────────────────────────────────────────
const T_LEAF_SCALE_IN   = 600;   // leaf icon scales up from 0
const T_LEAF_SCALE_DELAY= 100;   // small pause before text reveal
const T_TEXT_REVEAL     = 700;   // text slides out from behind leaf
const T_SUBTITLE_FADE   = 400;   // tagline fades in
const T_HOLD            = 600;   // hold before done
const T_LEAF_SCALE_IN_END = T_LEAF_SCALE_IN;
const T_TEXT_START        = T_LEAF_SCALE_IN_END + T_LEAF_SCALE_DELAY;
const T_SUBTITLE_START    = T_TEXT_START + T_TEXT_REVEAL;
const T_DONE              = T_SUBTITLE_START + T_SUBTITLE_FADE + T_HOLD;

/**
 * AnimatedSplashScreen
 *
 * Animation sequence:
 *  0ms   → leaf icon scales in from 0 (spring feel via easeOut)
 *  700ms → "agri-connect" slides out from BEHIND the leaf (translateX + opacity)
 * 1400ms → subtitle "Smart Farming Companion" fades in
 * 1800ms → onFinish() fires → app loads
 *
 * Props:
 *  onFinish  — called when animation completes (hide splash, show app)
 *  isReady   — if false, the animation waits; once true it begins
 */
const AnimatedSplashScreen = ({ onFinish, isReady = true }) => {

  // ── Animated values ───────────────────────────────────────────────────────
  const leafScale    = useRef(new Animated.Value(0)).current;
  const leafOpacity  = useRef(new Animated.Value(0)).current;
  const textTranslate= useRef(new Animated.Value(-60)).current; // starts LEFT (behind leaf)
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const subtitleOp   = useRef(new Animated.Value(0)).current;
  const screenOpacity= useRef(new Animated.Value(1)).current;

  const runAnimation = useCallback(() => {
    Animated.sequence([
      // ── 1. Leaf scales + fades in ────────────────────────────────────────
      Animated.parallel([
        Animated.timing(leafScale, {
          toValue: 1,
          duration: T_LEAF_SCALE_IN,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(leafOpacity, {
          toValue: 1,
          duration: T_LEAF_SCALE_IN * 0.6,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // ── 2. Short pause ───────────────────────────────────────────────────
      Animated.delay(T_LEAF_SCALE_DELAY),

      // ── 3. Text slides out from behind leaf + fades in ───────────────────
      Animated.parallel([
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: T_TEXT_REVEAL,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: T_TEXT_REVEAL * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // ── 4. Subtitle fades in ─────────────────────────────────────────────
      Animated.timing(subtitleOp, {
        toValue: 1,
        duration: T_SUBTITLE_FADE,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),

      // ── 5. Hold ──────────────────────────────────────────────────────────
      Animated.delay(T_HOLD),

      // ── 6. Fade whole screen out ─────────────────────────────────────────
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish?.();
    });
  }, [leafScale, leafOpacity, textTranslate, textOpacity, subtitleOp, screenOpacity, onFinish]);

  useEffect(() => {
    if (!isReady) return;
    // Hide the native splash first, then run JS animation
    SplashScreen.hideAsync().then(() => {
      runAnimation();
    });
  }, [isReady, runAnimation]);

  // Logo layout: leaf is ~32% of total logo width, text is ~68%
  // We size based on screen width with generous padding
  const LOGO_W    = SW * 0.72;
  const LOGO_H    = LOGO_W * (235 / 844);   // original aspect ratio 844×235
  const LEAF_W    = LOGO_W * (274 / 844);
  const LEAF_H    = LOGO_H;
  const TEXT_W    = LOGO_W * (522 / 844);   // slight overlap removed
  const TEXT_H    = LOGO_H;
  const GAP       = LOGO_W * (15 / 844);    // gap between leaf and text

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* ── Centered logo row ── */}
      <View style={styles.logoRow}>

        {/* Leaf icon — scales in */}
        <Animated.View
          style={{
            width: LEAF_W,
            height: LEAF_H,
            transform: [{ scale: leafScale }],
            opacity: leafOpacity,
            zIndex: 2,           // sits ON TOP so text slides from behind it
          }}
        >
          <Image
            source={require('./assets/leaf_only.png')}
            style={{ width: LEAF_W, height: LEAF_H }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* "agri-connect" text — slides right from behind the leaf */}
        <Animated.View
          style={{
            width: TEXT_W,
            height: TEXT_H,
            marginLeft: GAP,
            opacity: textOpacity,
            transform: [{ translateX: textTranslate }],
            overflow: 'hidden',   // clips the text while it's still behind the leaf
            zIndex: 1,
          }}
        >
          <Image
            source={require('./assets/text_only.png')}
            style={{ width: TEXT_W, height: TEXT_H }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* ── Tagline ── */}
      <Animated.Text style={[styles.tagline, { opacity: subtitleOp }]}>
        Smart Farming Companion
      </Animated.Text>

      {/* ── Bottom version ── */}
      <Animated.Text style={[styles.version, { opacity: subtitleOp }]}>
        v1.0.0
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    marginTop: 28,
    fontSize: 16,
    color: '#A5D6A7',
    letterSpacing: 0.1,
    fontWeight: '400',
  },
  version: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: '#4CAF50',
    opacity: 0.7,
  },
});

export default AnimatedSplashScreen;