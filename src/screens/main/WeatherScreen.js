import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
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
} from '../../store/slices/weatherSlice';
import WeatherCard from '../../components/weather/WeatherCard';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

const FARMING_TIPS = {
  Clear:        { text: 'Great day for harvesting or field work. UV index may be high — stay hydrated.',    emoji: '☀️' },
  Clouds:       { text: 'Overcast conditions are ideal for transplanting seedlings.',                        emoji: '⛅' },
  Rain:         { text: 'Hold off on spraying pesticides. Good natural irrigation day.',                     emoji: '🌧️' },
  Drizzle:      { text: 'Light rain is beneficial for germination. Check for waterlogging.',                 emoji: '🌦️' },
  Thunderstorm: { text: 'Stay indoors. Secure equipment and check drainage channels.',                       emoji: '⛈️' },
  Snow:         { text: 'Protect frost-sensitive crops. Check greenhouse temperatures.',                     emoji: '❄️' },
  Mist:         { text: 'High disease risk — monitor for fungal outbreaks.',                                 emoji: '🌫️' },
  Fog:          { text: 'Delayed fieldwork recommended until visibility improves.',                          emoji: '🌫️' },
  Haze:         { text: 'Moderate conditions. Good for light field activities.',                             emoji: '🌤️' },
};

const getTip = (condition) =>
  FARMING_TIPS[condition] || { text: 'Check local conditions before starting fieldwork.', emoji: '🌱' };

const TIP_TINTS = {
  Clear: '#FFF8E1', Clouds: '#ECEFF1', Rain: '#E3F2FD',
  Drizzle: '#E3F2FD', Thunderstorm: '#EDE7F6', Snow: '#E1F5FE',
  Mist: '#ECEFF1', Fog: '#ECEFF1', Haze: '#FFF3E0',
};
const TIP_TINTS_DARK = {
  Clear: '#2A2000', Clouds: '#1C2129', Rain: '#0D1B2A',
  Drizzle: '#0D1B2A', Thunderstorm: '#1A1030', Snow: '#0D1E2A',
  Mist: '#1C2129', Fog: '#1C2129', Haze: '#2A1A00',
};

const darkTokens = {
  background:      '#0F1A12',
  surface:         '#1A2B1E',
  surfaceElevated: '#223328',
  border:          '#2E4535',
  textPrimary:     '#E8F5E9',
  textSecondary:   '#A5C8A8',
  textMuted:       '#6B9470',
  warning:         '#FFB300',
  warningBg:       '#2A2000',
  warningBorder:   '#FFB300',
  refreshBg:       '#1A2B1E',
  refreshBorder:   '#2E4535',
  tipBorder:       colors.primary,
  iconMuted:       '#6B9470',
};

const lightTokens = {
  background:      colors.background,
  surface:         colors.white,
  surfaceElevated: colors.offWhite,
  border:          '#E0E0E0',
  textPrimary:     colors.textPrimary,
  textSecondary:   colors.textSecondary,
  textMuted:       colors.textMuted,
  warning:         colors.warning,
  warningBg:       '#FFF8E1',
  warningBorder:   colors.warning,
  refreshBg:       colors.offWhite,
  refreshBorder:   '#E0E0E0',
  tipBorder:       colors.primary,
  iconMuted:       colors.textMuted,
};

const getDetailCards = (current) => [
  { icon: 'compass-outline',     color: colors.primary, label: 'Wind Dir',   value: `${current.windDeg}°`             },
  { icon: 'water-outline',       color: '#0288D1',      label: 'Humidity',   value: `${current.humidity}%`            },
  { icon: 'eye-outline',         color: '#795548',      label: 'Visibility', value: `${current.visibility ?? '—'} km` },
  { icon: 'speedometer-outline', color: '#F57C00',      label: 'Pressure',   value: `${current.pressure} hPa`         },
];

const WeatherScreen = () => {
  const navigation = useNavigation();
  const dispatch    = useAppDispatch();
  const { colors, isDark } = useTheme();
  const t           = isDark ? darkTokens : lightTokens;

  const [warningVisible, setWarningVisible] = useState(true);

  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const startSpin = () => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  const stopSpin = () => spinAnim.stopAnimation();

  const current      = useAppSelector(selectCurrentWeather);
  const forecast     = useAppSelector(selectForecast);
  const isLoading    = useAppSelector(selectWeatherLoading);
  const isRefreshing = useAppSelector(selectWeatherRefreshing);
  const error        = useAppSelector(selectWeatherError);
  const lastUpdated  = useAppSelector(selectLastUpdated);
  const coords       = useAppSelector(selectWeatherCoords);

  useEffect(() => { dispatch(loadWeather()); }, [dispatch]);

  useEffect(() => {
    if (isRefreshing) { startSpin(); } else { stopSpin(); }
  }, [isRefreshing]);

  const onRefresh = useCallback(() => {
    setWarningVisible(true);
    dispatch(loadWeather(coords ? { ...coords, isRefresh: true } : undefined));
  }, [dispatch, coords]);

  const onRetry = () => {
    dispatch(clearWeatherError());
    dispatch(loadWeather());
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const formattedUpdate = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  const tip   = current ? getTip(current.condition) : null;
  const tipBg = current
    ? (isDark ? TIP_TINTS_DARK[current.condition] : TIP_TINTS[current.condition]) || t.surface
    : t.surface;

  if (isLoading && !current) {
    return (
      <ScreenContainer>
        <View style={[styles.centered, { backgroundColor: t.background }]}>
        <View style={[styles.loadingGlow, { backgroundColor: colors.primary + '20' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={[styles.loadingText,    { color: t.textPrimary }]}>Fetching your local weather…</Text>
        <Text style={[styles.loadingSubText, { color: t.textMuted   }]}>Getting your exact location</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error && !current) {
    return (
      <ScreenContainer>
        <View style={[styles.centered, { backgroundColor: t.background }]}>
        <View style={[styles.errorIconWrap, { backgroundColor: t.surfaceElevated }]}>
          <View style={[styles.errorIconInner, { backgroundColor: t.surface }]}>
            <Ionicons name="cloud-offline" size={52} color={t.iconMuted} />
          </View>
        </View>
        <Text style={[styles.errorTitle,   { color: t.textPrimary }]}>Weather Unavailable</Text>
        <Text style={[styles.errorMessage, { color: t.textMuted   }]}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!current && !isLoading) {
    return (
      <ScreenContainer>
        <View style={[styles.centered, { backgroundColor: t.background }]}>
        <View style={[styles.errorIconWrap, { backgroundColor: t.surfaceElevated }]}>
          <Ionicons name="location-outline" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.errorTitle,   { color: t.textPrimary }]}>Location Required</Text>
        <Text style={[styles.errorMessage, { color: t.textMuted   }]}>
          Please enable location access so we can show your local farming weather.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="location" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>Enable Location</Text>
        </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const formattedUpdateHeader = lastUpdated
    ? `Updated at ${formattedUpdate}`
    : null;

  return (
    <ScreenContainer style={{ backgroundColor: t.background }}>
      <ScreenHeader
        title="Weather"
        subtitle={current?.city ? `${current.city}${current.country ? `, ${current.country}` : ''}` : formattedUpdateHeader}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightElement={
          <TouchableOpacity
            onPress={onRefresh}
            style={[styles.refreshBtn, { backgroundColor: t.refreshBg, borderColor: t.refreshBorder }]}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Updating weather…"
            titleColor={t.textMuted}
          />
        }
      >
        {/* ── Stale data warning banner (dismissible) ── */}
        {error && current && warningVisible && (
          <View style={[styles.warningBanner, {
            backgroundColor: t.warningBg,
            borderLeftColor: t.warningBorder,
          }]}>
            <View style={[styles.warningIconBadge, { backgroundColor: t.warning + '30' }]}>
              <Ionicons name="warning-outline" size={14} color={t.warning} />
            </View>
            <Text style={[styles.warningText, { color: t.warning }]} numberOfLines={1}>
              Could not refresh: {error}
            </Text>
            <TouchableOpacity onPress={() => setWarningVisible(false)} style={styles.warningDismiss}>
              <Ionicons name="close" size={16} color={t.warning} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main Weather Card ── */}
        {current && (
          <WeatherCard
            current={current}
            forecast={forecast}
            style={styles.weatherCard}
            isDark={isDark}
          />
        )}

        {/* ── Farming Advisory Tip ── */}
        {current && tip && (
          <View style={[styles.tipCard, { backgroundColor: tipBg, borderLeftColor: t.tipBorder }]}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIconBadge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="leaf" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.tipTitle, { color: t.textPrimary }]}>Farming Advisory</Text>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            </View>
            <Text style={[styles.tipText, { color: t.textSecondary }]}>{tip.text}</Text>
          </View>
        )}

        {/* ── Details Grid ── */}
        {current && (
          <View style={styles.detailsGrid}>
            {getDetailCards(current).map(({ icon, color, label, value }) => (
              <View key={label} style={[styles.detailCard, {
                backgroundColor: t.surface,
                borderTopColor:  color,
              }]}>
                <View style={[styles.detailIconWrap, { backgroundColor: color + '18' }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>{value}</Text>
                <Text style={[styles.detailLabel, { color: t.textMuted   }]}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },

  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  loadingGlow:    { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  loadingText:    { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semiBold, marginTop: 4 },
  loadingSubText: { fontSize: theme.typography.fontSize.sm, marginTop: 6 },

  errorIconWrap:  { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  errorIconInner: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  errorTitle:     { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: 8 },
  errorMessage:   { fontSize: theme.typography.fontSize.sm, textAlign: 'center', marginBottom: theme.spacing.lg, lineHeight: 20 },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.xl, paddingVertical: 14, ...theme.shadows.sm },
  retryBtnText:   { color: '#fff', fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.md },

  screenHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.lg },
  screenTitle:    { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locationText:   { fontSize: theme.typography.fontSize.sm },
  screenSubtitle: { fontSize: theme.typography.fontSize.xs, marginTop: 2 },
  refreshBtn:     { padding: 10, borderRadius: theme.borderRadius.round, borderWidth: 1 },

  warningBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, marginBottom: theme.spacing.md, borderLeftWidth: 3 },
  warningIconBadge:  { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  warningText:       { fontSize: theme.typography.fontSize.sm, flex: 1 },
  warningDismiss:    { padding: 4 },

  weatherCard: { marginBottom: theme.spacing.md },

  tipCard:      { borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderLeftWidth: 4, ...theme.shadows.sm },
  tipHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, gap: 8 },
  tipIconBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tipTitle:     { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, flex: 1 },
  tipEmoji:     { fontSize: 20 },
  tipText:      { fontSize: theme.typography.fontSize.sm, lineHeight: 22 },

  detailsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  detailCard:     { flex: 1, minWidth: '45%', borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, alignItems: 'center', gap: 6, borderTopWidth: 3, ...theme.shadows.sm },
  detailIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  detailValue:    { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },
  detailLabel:    { fontSize: theme.typography.fontSize.xs, textAlign: 'center' },
});

export default WeatherScreen;