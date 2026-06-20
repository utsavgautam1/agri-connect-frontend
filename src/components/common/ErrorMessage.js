import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * ErrorMessage variants:
 *  banner   — colored top-of-screen strip  (default)
 *  card     — centered card with icon + retry
 *  inline   — small one-liner below a field
 *  toast    — compact pill (for use with absolute positioning)
 */
const VARIANT_CONFIG = {
  banner: { bg: '#FFEBEE', border: colors.error,   icon: 'alert-circle', iconColor: colors.error   },
  card:   { bg: colors.white, border: colors.error, icon: 'cloud-offline', iconColor: colors.textMuted },
  inline: { bg: 'transparent', border: 'transparent', icon: 'alert-circle-outline', iconColor: colors.error },
  toast:  { bg: '#212121',  border: 'transparent', icon: 'warning',       iconColor: '#FFD54F'      },
  warning:{ bg: '#FFF8E1',  border: colors.warning, icon: 'warning-outline', iconColor: colors.warning },
};

const ErrorMessage = ({
  message,
  title,
  variant = 'banner',
  onRetry,        // if supplied, a "Try Again" button is rendered
  onDismiss,      // if supplied, an X button is rendered
  style,
}) => {
  if (!message) return null;

  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.banner;

  // Card variant — larger, centered, with optional retry CTA
  if (variant === 'card') {
    return (
      <View style={[styles.card, style]}>
        <View style={styles.cardIconRing}>
          <Ionicons name={cfg.icon} size={40} color={cfg.iconColor} />
        </View>
        {title   ? <Text style={styles.cardTitle}>{title}</Text>     : null}
        <Text style={styles.cardMessage}>{message}</Text>
        {onRetry ? (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  // Inline — plain small text row
  if (variant === 'inline') {
    return (
      <View style={[styles.inlineRow, style]}>
        <Ionicons name={cfg.icon} size={13} color={cfg.iconColor} />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    );
  }

  // Toast — compact pill
  if (variant === 'toast') {
    return (
      <View style={[styles.toast, style]}>
        <Ionicons name={cfg.icon} size={16} color={cfg.iconColor} />
        <Text style={styles.toastText} numberOfLines={2}>{message}</Text>
      </View>
    );
  }

  // Default: banner (includes warning variant too)
  return (
    <View style={[
      styles.banner,
      { backgroundColor: cfg.bg, borderLeftColor: cfg.border },
      style,
    ]}>
      <Ionicons name={cfg.icon} size={18} color={cfg.iconColor} style={{ flexShrink: 0 }} />
      <View style={styles.bannerTextBlock}>
        {title   ? <Text style={[styles.bannerTitle, { color: cfg.iconColor }]}>{title}</Text> : null}
        <Text style={styles.bannerMessage}>{message}</Text>
      </View>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={styles.bannerRetry}>
          <Text style={[styles.bannerRetryText, { color: cfg.iconColor }]}>Retry</Text>
        </TouchableOpacity>
      ) : null}
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={cfg.iconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderLeftWidth: 4, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, marginBottom: theme.spacing.md,
  },
  bannerTextBlock: { flex: 1 },
  bannerTitle:   { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, marginBottom: 2 },
  bannerMessage: { fontSize: theme.typography.fontSize.sm, color: '#4E342E' },
  bannerRetry:   { paddingHorizontal: 8, paddingVertical: 2 },
  bannerRetryText: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold },

  // Card
  card: {
    backgroundColor: colors.white, borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  cardIconRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.offWhite,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle:   { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: colors.textDark },
  cardMessage: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg, paddingVertical: 10, marginTop: theme.spacing.sm,
  },
  retryBtnText: { color: colors.white, fontWeight: theme.typography.fontWeight.semiBold, fontSize: theme.typography.fontSize.sm },

  // Inline
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  inlineText: { fontSize: theme.typography.fontSize.xs, color: colors.error },

  // Toast
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#212121', borderRadius: theme.borderRadius.round,
    paddingHorizontal: 16, paddingVertical: 10, maxWidth: 320,
    ...theme.shadows.md,
  },
  toastText: { color: colors.white, fontSize: theme.typography.fontSize.sm, flex: 1 },
});

export default ErrorMessage;