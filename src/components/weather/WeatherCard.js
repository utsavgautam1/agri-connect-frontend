import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

const CONDITION_CONFIG = {
  Clear:        { icon: 'sunny',           bg: ['#FF8C00', '#FFB347'], textColor: '#fff' },
  Clouds:       { icon: 'cloudy',          bg: ['#5C7A8E', '#8AABBC'], textColor: '#fff' },
  Rain:         { icon: 'rainy',           bg: ['#2C3E6B', '#4A6FA5'], textColor: '#fff' },
  Drizzle:      { icon: 'rainy-outline',   bg: ['#3A5F7D', '#5E8FAB'], textColor: '#fff' },
  Thunderstorm: { icon: 'thunderstorm',    bg: ['#1C2741', '#3A4A6B'], textColor: '#fff' },
  Snow:         { icon: 'snow',            bg: ['#A8C8D8', '#D0E8F0'], textColor: '#1a3a4a' },
  Mist:         { icon: 'water',           bg: ['#5F6B75', '#8D9DA8'], textColor: '#fff' },
  Fog:          { icon: 'water',           bg: ['#5F6B75', '#8D9DA8'], textColor: '#fff' },
  Haze:         { icon: 'partly-sunny',    bg: ['#7A6A3A', '#B09A5A'], textColor: '#fff' },
};

const getConfig = (condition) =>
  CONDITION_CONFIG[condition] || CONDITION_CONFIG['Clouds'];

const StatPill = ({ icon, value, label }) => (
  <View style={styles.statPill}>
    <Ionicons name={icon} size={16} color="rgba(255,255,255,0.8)" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ForecastItem = ({ item }) => (
  <View style={styles.forecastItem}>
    <Text style={styles.forecastDay}>{item.day}</Text>
    <Text style={styles.forecastDate}>{item.date}</Text>
    {item.iconUrl ? (
      <Image source={{ uri: item.iconUrl }} style={styles.forecastIcon} />
    ) : (
      <Ionicons name="partly-sunny" size={20} color={colors.textMuted} />
    )}
    <Text style={styles.forecastPop}>{item.pop ?? 0}%</Text>
    <Text style={styles.forecastTemp}>{item.tempMax}°</Text>
    <Text style={styles.forecastTempMin}>{item.tempMin}°</Text>
  </View>
);

/**
 * WeatherCard
 * @param {{ current: object, forecast: object[], style: object }} props
 */
const WeatherCard = ({ current, forecast = [], style }) => {
  if (!current) return null;

  const config = getConfig(current.condition);
  const updatedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  const fmt = (ms) =>
    new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, style, theme.shadows.lg]}>
      {/* ── Top: Location + Temp ── */}
      <View style={[styles.topSection, { backgroundColor: config.bg[0] }]}>
        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={[styles.cityText, { color: config.textColor }]}>
            {current.city}, {current.country}
          </Text>
          <Text style={styles.updateTime}>Updated {updatedTime}</Text>
        </View>

        {/* Temperature + Icon */}
        <View style={styles.tempRow}>
          <View>
            <Text style={[styles.tempText, { color: config.textColor }]}>
              {current.temperature}°C
            </Text>
            <Text style={[styles.descText, { color: config.textColor }]}>
              {current.description.charAt(0).toUpperCase() + current.description.slice(1)}
            </Text>
            <Text style={[styles.feelsLike, { color: 'rgba(255,255,255,0.75)' }]}>
              Feels like {current.feelsLike}°  ·  {current.tempMin}° / {current.tempMax}°
            </Text>
          </View>

          {current.iconUrl ? (
            <Image source={{ uri: current.iconUrl }} style={styles.weatherIcon} />
          ) : (
            <Ionicons name={config.icon} size={80} color="rgba(255,255,255,0.9)" />
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatPill icon="water"        value={`${current.humidity}%`}      label="Humidity" />
          <StatPill icon="speedometer"  value={`${current.windSpeed} m/s`}  label="Wind" />
          <StatPill icon="eye"          value={`${current.visibility ?? '—'} km`} label="Visibility" />
          <StatPill icon="thermometer"  value={`${current.pressure} hPa`}   label="Pressure" />
        </View>
      </View>

      {/* ── Middle: Sunrise / Sunset ── */}
      <View style={[styles.sunRow, { backgroundColor: config.bg[1] }]}>
        <View style={styles.sunItem}>
          <Ionicons name="sunny-outline" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={styles.sunLabel}>Sunrise</Text>
          <Text style={styles.sunTime}>{fmt(current.sunrise)}</Text>
        </View>
        <View style={styles.sunDivider} />
        <View style={styles.sunItem}>
          <Ionicons name="moon-outline" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={styles.sunLabel}>Sunset</Text>
          <Text style={styles.sunTime}>{fmt(current.sunset)}</Text>
        </View>
      </View>

      {/* ── Bottom: 5-Day Forecast ── */}
      {forecast.length > 0 && (
        <View style={styles.forecastSection}>
          <Text style={styles.forecastTitle}>5-Day Forecast</Text>
          <View style={styles.forecastRow}>
            {forecast.map((item) => (
              <ForecastItem key={item.dt} item={item} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },

  topSection: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, gap: 4 },
  cityText: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, flex: 1 },
  updateTime: { fontSize: theme.typography.fontSize.xs, color: 'rgba(255,255,255,0.6)' },

  tempRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  tempText: { fontSize: 64, fontWeight: theme.typography.fontWeight.bold, lineHeight: 68 },
  descText: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.medium, marginTop: 2 },
  feelsLike: { fontSize: theme.typography.fontSize.sm, marginTop: 4 },
  weatherIcon: { width: 90, height: 90 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs },
  statPill: { alignItems: 'center', flex: 1, gap: 2 },
  statValue: { color: '#fff', fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold },
  statLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },

  sunRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  sunItem: { flex: 1, alignItems: 'center', gap: 2 },
  sunDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  sunLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  sunTime: { color: '#fff', fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold },

  forecastSection: { padding: theme.spacing.md, backgroundColor: colors.white },
  forecastTitle: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textMuted, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between' },
  forecastItem: { flex: 1, alignItems: 'center', gap: 4 },
  forecastDay: { fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textSecondary },
  forecastDate: { fontSize: 9, color: colors.textMuted, marginTop: -2 },
  forecastIcon: { width: 32, height: 32 },
  forecastPop: { fontSize: 10, color: colors.info },
  forecastTemp: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold, color: colors.textDark },
  forecastTempMin: { fontSize: 10, color: colors.textMuted },
});

export default WeatherCard;