import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * Loading variants:
 *  spinner   — standard ActivityIndicator (default)
 *  overlay   — full-screen modal overlay with spinner
 *  inline    — small inline row with spinner + message
 *  pulse     — animated pulsing leaf icon (brand-feel)
 */

// ── Pulse animation component ────────────────────────────────────────────────
const PulseLoader = ({ message }) => {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseWrapper}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <View style={styles.pulseBadge}>
          <Ionicons name="leaf" size={32} color={colors.primary} />
        </View>
      </Animated.View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Loading = ({
  variant = 'spinner',
  message,
  visible = true,       // for overlay variant
  size = 'large',       // 'small' | 'large'
  color = colors.primary,
  style,
}) => {
  if (!visible) return null;

  // Overlay — full screen blocking loader
  if (variant === 'overlay') {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message ? <Text style={styles.overlayMessage}>{message}</Text> : null}
          </View>
        </View>
      </Modal>
    );
  }

  // Inline — row layout for use inside lists / cards
  if (variant === 'inline') {
    return (
      <View style={[styles.inlineRow, style]}>
        <ActivityIndicator size="small" color={color} />
        {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}
      </View>
    );
  }

  // Pulse — branded loader for splash-style screens
  if (variant === 'pulse') {
    return (
      <View style={[styles.centeredWrapper, style]}>
        <PulseLoader message={message} />
      </View>
    );
  }

  // Default: spinner
  return (
    <View style={[styles.centeredWrapper, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredWrapper: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  message: { marginTop: theme.spacing.md, fontSize: theme.typography.fontSize.sm, color: colors.textMuted, textAlign: 'center' },

  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  overlayBox: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 160,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
  },
  overlayMessage: { fontSize: theme.typography.fontSize.sm, color: colors.textDark, fontWeight: theme.typography.fontWeight.medium, textAlign: 'center' },

  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.sm },
  inlineMessage: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted },

  pulseWrapper: { alignItems: 'center', gap: theme.spacing.md },
  pulseBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.offWhite,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primaryLighter,
  },
});

export default Loading;