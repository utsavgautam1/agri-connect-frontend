import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';
import { formatPrice, formatDate, timeAgo } from '../../utils/helpers';

  const getPriceChangeConfig = (change) => {
  if (change > 0)  return { color: colors.success, icon: 'trending-up',   bg: '#E8F5E9', label: `+${change.toFixed(1)}%` };
  if (change < 0)  return { color: colors.error,   icon: 'trending-down',  bg: '#FFEBEE', label: `${change.toFixed(1)}%` };
  return             { color: colors.textMuted,  icon: 'remove',         bg: colors.offWhite, label: '0.0%' };
};


const CATEGORY_COLORS = {
  Cereals:    '#F57F17',
  Legumes:    '#2E7D32',
  Vegetables: '#00838F',
  Fruits:     '#E91E63',
  'Cash Crops': '#6A1B9A',
  Livestock:  '#BF360C',
};

// ── Compact variant ───────────────────────────────────────────────────────────
const CompactPriceCard = ({ item, onPress }) => {
  const changeCfg    = getPriceChangeConfig(item.change ?? 0);
  const accentColor  = CATEGORY_COLORS[item.category] || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.compactCard, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={styles.compactLeft}>
        <Text style={styles.compactName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.compactMeta}>{item.market} · per {item.unit}</Text>
      </View>
      <View style={styles.compactRight}>
        <Text style={[styles.compactPrice, { color: accentColor }]}>
          {formatPrice(item.price, item.currency)}
        </Text>
        <View style={[styles.changePill, { backgroundColor: changeCfg.bg }]}>
          <Ionicons name={changeCfg.icon} size={11} color={changeCfg.color} />
          <Text style={[styles.changeText, { color: changeCfg.color }]}>{changeCfg.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Full variant (default) ────────────────────────────────────────────────────
const PriceCard = ({
  item,
  onPress,
  animDelay = 0,
  compact = false,
}) => {
  // Entrance animation
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const opacityAnim= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0,   duration: 350, delay: animDelay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1,   duration: 350, delay: animDelay, useNativeDriver: true }),
    ]).start();
  }, []);

  if (compact) {
    return (
      <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
        <CompactPriceCard item={item} onPress={onPress} />
      </Animated.View>
    );
  }

  const changeCfg   = getPriceChangeConfig(item.change ?? 0);
  const accentColor = CATEGORY_COLORS[item.category] || colors.primary;

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.82}
        disabled={!onPress}
      >
        {/* ── Accent top bar ── */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View style={styles.cardBody}>
          {/* ── Header row: crop name + category ── */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {/* Category dot */}
              <View style={[styles.categoryDot, { backgroundColor: accentColor }]} />
              <View>
                <Text style={styles.cropName}>{item.name}</Text>
                <Text style={styles.categoryLabel}>{item.category}</Text>
              </View>
            </View>
            {/* Change badge */}
            <View style={[styles.changeBadge, { backgroundColor: changeCfg.bg }]}>
              <Ionicons name={changeCfg.icon} size={14} color={changeCfg.color} />
              <Text style={[styles.changeBadgeText, { color: changeCfg.color }]}>
                {changeCfg.label}
              </Text>
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Price row ── */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={[styles.priceValue, { color: accentColor }]}>
                {formatPrice(item.price, item.currency)}
              </Text>
              <Text style={styles.priceUnit}>per {item.unit}</Text>
            </View>

            {/* Market + time info */}
            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <Ionicons name="storefront-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{item.market}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{timeAgo(item.updatedAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{formatDate(item.updatedAt)}</Text>
              </View>
            </View>
          </View>

          {/* ── Tap hint (only when onPress is provided) ── */}
          {onPress && (
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap for price history</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Full card ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  accentBar: { height: 4, width: '100%' },
  cardBody:  { padding: theme.spacing.md },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },

  categoryDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },

  cropName:      { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: colors.textDark },
  categoryLabel: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, marginTop: 1, textTransform: 'capitalize' },

  changeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: theme.borderRadius.round,
  },
  changeBadgeText: { fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.bold },

  divider: { height: 1, backgroundColor: colors.divider, marginVertical: theme.spacing.md },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },

  priceLabel: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  priceValue: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold, lineHeight: 32 },
  priceUnit:  { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },

  metaBlock: { alignItems: 'flex-end', gap: 4 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: theme.typography.fontSize.xs, color: colors.textMuted },

  tapHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: theme.spacing.sm, gap: 2 },
  tapHintText: { fontSize: 11, color: colors.textMuted },

  // ── Compact card ───────────────────────────────────────────────────────────
  compactCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  compactLeft:  { flex: 1, marginRight: theme.spacing.md },
  compactName:  { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  compactMeta:  { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
  compactRight: { alignItems: 'flex-end', gap: 4 },
  compactPrice: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.bold },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  changeText: { fontSize: 11, fontWeight: theme.typography.fontWeight.bold },
});

export default PriceCard;