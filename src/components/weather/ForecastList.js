import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * ForecastList
 *
 * Horizontal scrollable 5-day forecast strip.
 * Supports both a compact horizontal bar and a detailed vertical list layout.
 *
 * Props:
 *  forecast   — array of forecast day objects from weatherSlice
 *  layout     — 'horizontal' (default) | 'vertical'
 *  title      — optional section title string
 */

// Map OWM condition strings → Ionicons name + accent colour
const CONDITION_ICON = {
  Clear:        { icon: 'sunny',                color: '#FF8C00' },
  Clouds:       { icon: 'cloudy',               color: '#607D8B' },
  Rain:         { icon: 'rainy',                color: '#1565C0' },
  Drizzle:      { icon: 'rainy-outline',        color: '#1E88E5' },
  Thunderstorm: { icon: 'thunderstorm',         color: '#4527A0' },
  Snow:         { icon: 'snow',                 color: '#29B6F6' },
  Mist:         { icon: 'water',                color: '#78909C' },
  Fog:          { icon: 'water',                color: '#78909C' },
  Haze:         { icon: 'partly-sunny',         color: '#F9A825' },
  Smoke:        { icon: 'cloud',                color: '#8D6E63' },
};

const getConditionConfig = (condition) =>
  CONDITION_ICON[condition] || CONDITION_ICON['Clouds'];

// Format dt (ms) to short weekday label
const getDayLabel = (dt, index) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(dt).toLocaleDateString('en-US', { weekday: 'short' });
};

// Format dt to short date like "02 Mar"
const getShortDate = (dt) =>
  new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

// ── Rain probability indicator bar ───────────────────────────────────────────
const RainBar = ({ pop, color }) => (
  <View style={rainStyles.wrapper}>
    <View style={rainStyles.track}>
      <View style={[rainStyles.fill, { width: `${pop}%`, backgroundColor: color }]} />
    </View>
    <Text style={[rainStyles.label, { color }]}>{pop}%</Text>
  </View>
);

const rainStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  track:   { flex: 1, height: 4, backgroundColor: colors.divider, borderRadius: 2, overflow: 'hidden' },
  fill:    { height: 4, borderRadius: 2 },
  label:   { fontSize: 10, fontWeight: '600', width: 26, textAlign: 'right' },
});

// ── Single forecast day: horizontal pill ──────────────────────────────────────
const HorizontalDayItem = ({ item, index }) => {
  const cfg  = getConditionConfig(item.condition);
  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const isToday = index === 0;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: Animated.multiply(Animated.subtract(new Animated.Value(1), anim), new Animated.Value(16)) }],
    }}>
      <View style={[styles.hDay, isToday && styles.hDayActive]}>
        {/* Day label */}
        <Text style={[styles.hDayLabel, isToday && styles.hDayLabelActive]}>
          {getDayLabel(item.dt, index)}
        </Text>

        {/* Weather icon */}
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={styles.hDayIcon} />
        ) : (
          <View style={[styles.hIconFallback, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon} size={22} color={cfg.color} />
          </View>
        )}

        {/* Temperature */}
        <Text style={[styles.hDayTemp, { color: isToday ? colors.white : cfg.color }]}>
          {item.temperature}°
        </Text>

        {/* Min / max range */}
        <View style={styles.hRangeRow}>
          <Text style={[styles.hRangeText, { color: isToday ? 'rgba(255,255,255,0.7)' : colors.info }]}>
            {item.tempMin}°
          </Text>
          <Text style={[styles.hRangeSep, { color: isToday ? 'rgba(255,255,255,0.4)' : colors.divider }]}>·</Text>
          <Text style={[styles.hRangeText, { color: isToday ? 'rgba(255,255,255,0.7)' : colors.error }]}>
            {item.tempMax}°
          </Text>
        </View>

        {/* Rain probability */}
        {item.pop > 0 && (
          <View style={styles.hRainRow}>
            <Ionicons name="rainy-outline" size={10} color={isToday ? 'rgba(255,255,255,0.8)' : colors.info} />
            <Text style={[styles.hRainText, { color: isToday ? 'rgba(255,255,255,0.8)' : colors.info }]}>
              {item.pop}%
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ── Single forecast day: vertical row ────────────────────────────────────────
const VerticalDayItem = ({ item, index, isLast }) => {
  const cfg = getConditionConfig(item.condition);

  return (
    <View style={[styles.vRow, !isLast && styles.vRowBorder]}>
      {/* Date column */}
      <View style={styles.vDateCol}>
        <Text style={styles.vDayName}>{getDayLabel(item.dt, index)}</Text>
        <Text style={styles.vShortDate}>{getShortDate(item.dt)}</Text>
      </View>

      {/* Icon + condition */}
      <View style={styles.vConditionCol}>
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={styles.vIcon} />
        ) : (
          <Ionicons name={cfg.icon} size={26} color={cfg.color} />
        )}
        <Text style={styles.vConditionText} numberOfLines={1}>
          {item.description}
        </Text>
      </View>

      {/* Stats column */}
      <View style={styles.vStatsCol}>
        <Text style={styles.vTempMain}>{item.temperature}°C</Text>

        <View style={styles.vTempRange}>
          <Text style={[styles.vTempBound, { color: colors.info }]}>{item.tempMin}°</Text>
          <View style={styles.vTempRangeBar}>
            <View style={[styles.vTempFill, {
              backgroundColor: cfg.color,
              marginLeft: `${((item.tempMin + 10) / 50) * 100}%`,
              width: `${((item.tempMax - item.tempMin) / 50) * 100}%`,
            }]} />
          </View>
          <Text style={[styles.vTempBound, { color: colors.error }]}>{item.tempMax}°</Text>
        </View>

        <View style={styles.vMetaRow}>
          <Ionicons name="water-outline" size={11} color={colors.info} />
          <Text style={styles.vMetaText}>{item.humidity}%</Text>
          <Ionicons name="rainy-outline" size={11} color={colors.info} style={{ marginLeft: 6 }} />
          <Text style={styles.vMetaText}>{item.pop}% rain</Text>
        </View>
      </View>
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ForecastList = ({ forecast = [], layout = 'horizontal', title }) => {
  if (!forecast || forecast.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="cloud-outline" size={28} color={colors.textMuted} />
        <Text style={styles.emptyText}>No forecast data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section title */}
      {title && (
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.titleMeta}>{forecast.length}-day forecast</Text>
        </View>
      )}

      {/* Horizontal scrollable strip */}
      {layout === 'horizontal' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {forecast.map((item, index) => (
            <HorizontalDayItem key={item.dt} item={item} index={index} />
          ))}
        </ScrollView>
      )}

      {/* Vertical detailed list */}
      {layout === 'vertical' && (
        <View style={styles.vList}>
          {forecast.map((item, index) => (
            <VerticalDayItem
              key={item.dt}
              item={item}
              index={index}
              isLast={index === forecast.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.md },

  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm,
  },
  title:     { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  titleMeta: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyState: { alignItems: 'center', gap: 6, padding: theme.spacing.lg },
  emptyText:  { fontSize: theme.typography.fontSize.sm, color: colors.textMuted },

  // ── Horizontal ────────────────────────────────────────────────────────────
  hScroll: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm, paddingBottom: 4 },

  hDay: {
    width: 76, borderRadius: theme.borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center', paddingVertical: theme.spacing.md, paddingHorizontal: 6,
    gap: 6,
    ...theme.shadows.sm,
  },
  hDayActive: {
    backgroundColor: colors.primary,
    ...theme.shadows.md,
  },

  hDayLabel:       { fontSize: 11, fontWeight: '600', color: colors.textMuted, textAlign: 'center' },
  hDayLabelActive: { color: 'rgba(255,255,255,0.85)' },

  hDayIcon:    { width: 36, height: 36 },
  hIconFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  hDayTemp: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: colors.textDark },

  hRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hRangeText:{ fontSize: 10, fontWeight: '600' },
  hRangeSep: { fontSize: 10 },

  hRainRow:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  hRainText: { fontSize: 10, fontWeight: '500' },

  // ── Vertical ──────────────────────────────────────────────────────────────
  vList: { backgroundColor: colors.white, borderRadius: theme.borderRadius.lg, overflow: 'hidden', ...theme.shadows.sm },

  vRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  vRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },

  vDateCol:  { width: 72 },
  vDayName:  { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  vShortDate:{ fontSize: 10, color: colors.textMuted, marginTop: 1 },

  vConditionCol: { width: 70, alignItems: 'center', gap: 2 },
  vIcon: { width: 32, height: 32 },
  vConditionText: { fontSize: 10, color: colors.textMuted, textAlign: 'center', textTransform: 'capitalize' },

  vStatsCol: { flex: 1 },
  vTempMain: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: colors.textDark, marginBottom: 4 },

  vTempRange: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  vTempBound: { fontSize: 11, fontWeight: '600', width: 24 },
  vTempRangeBar: { flex: 1, height: 4, backgroundColor: colors.divider, borderRadius: 2, overflow: 'hidden' },
  vTempFill:     { height: 4, borderRadius: 2, minWidth: 8 },

  vMetaRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  vMetaText: { fontSize: 11, color: colors.textMuted },
});

export default ForecastList;