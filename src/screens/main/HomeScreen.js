import React, { useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store';
import { selectUser } from '../../store/slices/authSlice';
import { selectIsOnline } from '../../store/slices/appSlice';
import useWeather from '../../hooks/useWeather';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../utils/i18n';
import theme from '../../constants/theme';
import { timeAgo } from '../../utils/helpers';
import { ADVISORY_CATEGORIES, ROUTES } from '../../utils/constants';

// ── Constants ─────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { labelKey: 'nav.weather',    icon: 'partly-sunny', route: ROUTES.WEATHER,  iconColor: '#0288D1', lightBg: '#E1F5FE', darkBg: '#0D2A3A' },
  { labelKey: 'nav.disease',    icon: 'leaf',         route: ROUTES.DISEASE,  iconColor: '#2E7D32', lightBg: '#E8F5E9', darkBg: '#0D2A15' },
  { labelKey: 'nav.market',     icon: 'bar-chart',    route: ROUTES.MARKET,   iconColor: '#E65100', lightBg: '#FBE9E7', darkBg: '#2A1500' },
  { labelKey: 'advisory.title', icon: 'book',         route: ROUTES.ADVISORY, iconColor: '#8E44AD', lightBg: '#F3E5F5', darkBg: '#1E0A2A' },
  { label: 'Soil',              icon: 'flask',        route: ROUTES.SOIL,     iconColor: '#795548', lightBg: '#EFEBE9', darkBg: '#1A1008' },
  { labelKey: 'sms.title',      icon: 'chatbubble',   route: ROUTES.SMS,      iconColor: '#00695C', lightBg: '#E0F2F1', darkBg: '#00231E' },
];

const FARMING_TIPS = [
  { text: 'Intercropping maize with legumes can improve soil nitrogen by up to 40 kg N/ha, reducing synthetic fertilizer needs.', icon: 'leaf-outline' },
  { text: 'Water crops early morning to reduce evaporation. This can save up to 30% water compared to midday irrigation.', icon: 'water-outline' },
  { text: 'Rotate crops every season to prevent soil depletion and reduce pest buildup naturally.', icon: 'refresh-outline' },
  { text: 'Apply organic mulch around plants to retain soil moisture and suppress weed growth.', icon: 'layers-outline' },
  { text: 'Monitor soil pH regularly — most vegetables thrive best in pH 6.0 to 7.0 range.', icon: 'flask-outline' },
];

const WEATHER_CONDITION_BG = {
  Clear:        { light: '#FFF8E1', dark: '#2A1E00', accent: '#FF8F00' },
  Clouds:       { light: '#ECEFF1', dark: '#1C2129', accent: '#546E7A' },
  Rain:         { light: '#E3F2FD', dark: '#0D1B2A', accent: '#0288D1' },
  Drizzle:      { light: '#E8F5FE', dark: '#0D1E2A', accent: '#039BE5' },
  Thunderstorm: { light: '#EDE7F6', dark: '#1A1030', accent: '#5E35B1' },
  Snow:         { light: '#E1F5FE', dark: '#0D1E2A', accent: '#29B6F6' },
  Mist:         { light: '#F5F5F5', dark: '#1C1C1C', accent: '#78909C' },
  Haze:         { light: '#FFF3E0', dark: '#2A1A00', accent: '#FF8F00' },
};

const today = new Date();
const DATE_STRING = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const TIP_INDEX   = today.getDate() % FARMING_TIPS.length;

// ── Animated Action Tile ──────────────────────────────────────────────────────
const ActionTile = ({ item, colors, isDark, onPress, t }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();
  const bg    = isDark ? item.darkBg : item.lightBg;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, tileStyles.wrap]}>
      <TouchableOpacity
        style={[tileStyles.tile, { backgroundColor: bg, borderTopColor: item.iconColor }]}
        onPressIn={onIn} onPressOut={onOut}
        onPress={onPress} activeOpacity={1}
      >
        <View style={[tileStyles.iconRing, { backgroundColor: item.iconColor + (isDark ? '30' : '20') }]}>
          <Ionicons name={item.icon} size={24} color={item.iconColor} />
        </View>
        <Text style={[tileStyles.label, { color: item.iconColor }]} numberOfLines={1}>
          {item.label || t(item.labelKey)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
const tileStyles = StyleSheet.create({
  wrap:     { width: '30.5%' },
  tile:     { borderRadius: 14, padding: 14, alignItems: 'center', gap: 8, borderTopWidth: 3, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  iconRing: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  label:    { fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
});

// ── Category Chip ─────────────────────────────────────────────────────────────
const CategoryChip = ({ cat, isSelected, onPress, colors, isDark }) => (
  <TouchableOpacity
    style={[
      chipStyles.chip,
      {
        backgroundColor: isSelected ? colors.primary : colors.card,
        borderColor:     isSelected ? colors.primary : (isDark ? colors.primary + '40' : colors.border),
      },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={cat.icon} size={14} color={isSelected ? '#fff' : colors.primary} />
    <Text style={[chipStyles.text, { color: isSelected ? '#fff' : colors.primary }]}>
      {cat.label}
    </Text>
  </TouchableOpacity>
);
const chipStyles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  text: { fontSize: 12, fontWeight: '700' },
});

// ── Market Price Teaser ───────────────────────────────────────────────────────
const TEASER_PRICES = [
  { name: 'Tomato',  price: 45,  change: +5.2,  emoji: '🍅' },
  { name: 'Potato',  price: 30,  change: -2.1,  emoji: '🥔' },
  { name: 'Onion',   price: 55,  change: +8.0,  emoji: '🧅' },
  { name: 'Apple',   price: 180, change: +1.5,  emoji: '🍎' },
  { name: 'Banana',  price: 55,  change: -3.3,  emoji: '🍌' },
];
const PriceTeaser = ({ colors, onSeeAll }) => (
  <View style={ptStyles.wrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ptStyles.scroll}>
      {TEASER_PRICES.map((item) => {
        const isUp = item.change > 0;
        return (
          <View key={item.name} style={[ptStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={ptStyles.emoji}>{item.emoji}</Text>
            <Text style={[ptStyles.name, { color: colors.textDark }]}>{item.name}</Text>
            <Text style={[ptStyles.price, { color: colors.textDark }]}>NPR {item.price}</Text>
            <View style={[ptStyles.badge, { backgroundColor: isUp ? '#E8F5E9' : '#FFEBEE' }]}>
              <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={10} color={isUp ? '#2E7D32' : '#C62828'} />
              <Text style={[ptStyles.change, { color: isUp ? '#2E7D32' : '#C62828' }]}>
                {isUp ? '+' : ''}{item.change}%
              </Text>
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={[ptStyles.seeAll, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]} onPress={onSeeAll}>
        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        <Text style={[ptStyles.seeAllText, { color: colors.primary }]}>See All</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);
const ptStyles = StyleSheet.create({
  wrap:        { marginBottom: 4 },
  scroll:      { paddingHorizontal: 16, paddingBottom: 4 },
  card:        { width: 90, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, marginRight: 8, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  emoji:       { fontSize: 22 },
  name:        { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  price:       { fontSize: 13, fontWeight: '900' },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  change:      { fontSize: 10, fontWeight: '700' },
  seeAll:      { width: 70, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 4, marginRight: 8, borderWidth: 1, padding: 10 },
  seeAllText:  { fontSize: 11, fontWeight: '700' },
});

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, dotColor, actionLabel, onAction, colors }) => (
  <View style={shStyles.row}>
    <View style={shStyles.left}>
      <View style={[shStyles.dot, { backgroundColor: dotColor || colors.primary }]} />
      <Text style={[shStyles.title, { color: colors.textDark }]}>{title}</Text>
    </View>
    {actionLabel && (
      <TouchableOpacity onPress={onAction} style={shStyles.action}>
        <Text style={[shStyles.actionText, { color: colors.primary }]}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={13} color={colors.primary} />
      </TouchableOpacity>
    )}
  </View>
);
const shStyles = StyleSheet.create({
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  left:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  title:      { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  action:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontSize: 12, fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation();
  const user       = useAppSelector(selectUser);
  const isOnline   = useAppSelector(selectIsOnline);
  const { current, isLoading, error, refresh } = useWeather({ autoFetch: true });
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('home.greetingMorning');
    if (h < 17) return t('home.greetingAfternoon');
    if (h < 21) return t('home.greetingEvening');
    return t('home.greetingNight');
  }, [t]);

  const weatherCfg = useMemo(() => {
    if (!current?.condition) return null;
    return WEATHER_CONDITION_BG[current.condition] || WEATHER_CONDITION_BG['Clouds'];
  }, [current?.condition]);

  const tip = FARMING_TIPS[TIP_INDEX];

  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
    <ScrollView style={s.container} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

      {/* ── Offline Banner ── */}
      {!isOnline && (
        <ErrorMessage
          variant="banner"
          title={t('home.offlineTitle')}
          message={t('home.offlineMessage')}
          style={s.offlineBanner}
        />
      )}

      {/* ── Hero Header ── */}
      <View style={s.hero}>
        {/* Decorative dots pattern */}
        <View style={s.heroPattern}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[s.heroDot, { opacity: 0.08 + i * 0.03 }]} />
          ))}
        </View>

        <View style={s.heroContent}>
          <View style={s.heroLeft}>
            <Text style={s.heroDate}>{DATE_STRING}</Text>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.userName}>
              {(user?.fullName || user?.name)?.split(' ')[0] || t('home.defaultName')} 👋
            </Text>
            {user?.farmLocation && (
              <View style={s.locationRow}>
                <Ionicons name="location" size={12} color={colors.primaryLight} />
                <Text style={s.locationText}>{user.farmLocation}</Text>
              </View>
            )}
          </View>

          {/* Avatar / Settings */}
          <TouchableOpacity style={s.avatarBtn} onPress={() => navigation.navigate(ROUTES.SETTINGS)}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>
                {(user?.fullName?.[0] || user?.name?.[0] || 'F').toUpperCase()}
              </Text>
            </View>
            {/* Online dot */}
            <View style={[s.onlineDot, { backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E' }]} />
          </TouchableOpacity>
        </View>

        {/* Contextual location banner */}
        {current && user?.farmLocation && (
          <View style={s.heroBanner}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primaryLight} />
            <Text style={s.heroBannerText}>
              {current.description.charAt(0).toUpperCase() + current.description.slice(1)} conditions in {user.farmLocation} today
            </Text>
          </View>
        )}
      </View>

      {/* ── Weather Snapshot ── */}
      <TouchableOpacity
        style={[s.weatherSnap, weatherCfg && { backgroundColor: isDark ? weatherCfg.dark : weatherCfg.light, borderLeftColor: weatherCfg.accent }]}
        onPress={() => navigation.navigate(ROUTES.WEATHER)}
        activeOpacity={0.9}
      >
        {/* Top row */}
        <View style={s.weatherSnapTop}>
          <View style={s.weatherSnapLeft}>
            <View style={[s.weatherIconBadge, { backgroundColor: (weatherCfg?.accent || colors.info) + '20' }]}>
              <Ionicons name="partly-sunny" size={18} color={weatherCfg?.accent || colors.info} />
            </View>
            <View>
              <Text style={[s.weatherSnapTitle, { color: colors.textDark }]}>{t('home.weatherTitle')}</Text>
              {current && (
                <Text style={[s.weatherSnapSub, { color: colors.textMuted }]}>
                  {timeAgo(current.timestamp)}
                </Text>
              )}
            </View>
          </View>
          <View style={s.weatherSnapRight}>
            <TouchableOpacity onPress={refresh} style={s.refreshBtn}>
              <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </View>

        {/* Weather content */}
        {isLoading && !current ? (
          <Loading variant="inline" message={t('weather.fetching')} />
        ) : error && !current ? (
          <ErrorMessage variant="inline" message={error} />
        ) : current ? (
          <View style={s.weatherRow}>
            <View>
              <Text style={[s.weatherTemp, { color: weatherCfg?.accent || colors.textDark }]}>
                {current.temperature}°C
              </Text>
              <Text style={[s.weatherDesc, { color: colors.textMuted }]}>
                {current.description}
              </Text>
            </View>
            <View style={s.weatherStats}>
              <View style={s.weatherStat}>
                <Ionicons name="water-outline" size={13} color={colors.info} />
                <Text style={[s.weatherStatText, { color: colors.textMuted }]}>
                  {current.humidity}% humidity
                </Text>
              </View>
              <View style={s.weatherStat}>
                <Ionicons name="speedometer-outline" size={13} color={colors.textMuted} />
                <Text style={[s.weatherStatText, { color: colors.textMuted }]}>
                  {current.windSpeed} m/s wind
                </Text>
              </View>
              <View style={s.weatherStat}>
                <Ionicons name="thermometer-outline" size={13} color={colors.textMuted} />
                <Text style={[s.weatherStatText, { color: colors.textMuted }]}>
                  Feels {current.feelsLike}°C
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* ── Quick Actions ── */}
      <SectionHeader
        title={t('home.quickActions')}
        dotColor="#2E7D32"
        colors={colors}
      />
      <View style={s.actionsGrid}>
        {QUICK_ACTIONS.map((item) => (
          <ActionTile
            key={item.route}
            item={item}
            colors={colors}
            isDark={isDark}
            t={t}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>

      {/* ── Market Price Teaser ── */}
      <SectionHeader
        title="Today's Prices"
        dotColor="#E65100"
        actionLabel="See All"
        onAction={() => navigation.navigate(ROUTES.MARKET)}
        colors={colors}
      />
      <PriceTeaser colors={colors} onSeeAll={() => navigation.navigate(ROUTES.MARKET)} />

      {/* ── Advisory Categories ── */}
      <View style={s.sectionSpacing}>
        <SectionHeader
          title={t('home.exploreTopics')}
          dotColor="#8E44AD"
          actionLabel="See All →"
          onAction={() => navigation.navigate(ROUTES.ADVISORY)}
          colors={colors}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryScroll}>
          {ADVISORY_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              cat={cat}
              isSelected={selectedCategory === cat.id}
              onPress={() => {
                setSelectedCategory(prev => prev === cat.id ? null : cat.id);
                navigation.navigate(ROUTES.ADVISORY, { category: cat.id });
              }}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Tip of the Day ── */}
      <TouchableOpacity style={s.tipCard} onPress={() => navigation.navigate(ROUTES.ADVISORY)} activeOpacity={0.85}>
        {/* Header row */}
        <View style={s.tipHeader}>
          <View style={[s.tipIconBadge, { backgroundColor: colors.accent + '25' }]}>
            <Ionicons name={tip.icon} size={18} color={colors.accent} />
          </View>
          <View style={s.tipTitleBlock}>
            <Text style={[s.tipTitle, { color: colors.textDark }]}>{t('home.tipTitle')}</Text>
            <Text style={[s.tipCounter, { color: colors.textMuted }]}>
              Tip {TIP_INDEX + 1} of {FARMING_TIPS.length}
            </Text>
          </View>
          <TouchableOpacity style={s.tipShare}>
            <Ionicons name="share-social-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[s.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
        <View style={s.tipFooter}>
          <Text style={[s.tipCTA, { color: colors.accent }]}>{t('home.tipCTA')}</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.accent} />
        </View>

        {/* Tip dots indicator */}
        <View style={s.tipDots}>
          {FARMING_TIPS.map((_, i) => (
            <View
              key={i}
              style={[s.tipDot, {
                backgroundColor: i === TIP_INDEX ? colors.accent : colors.border,
                width: i === TIP_INDEX ? 16 : 6,
              }]}
            />
          ))}
        </View>
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (colors, isDark) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  offlineBanner: { margin: theme.spacing.md, marginBottom: 0 },

  // Hero
  hero: {
    backgroundColor: colors.primaryDark,
    paddingTop:      theme.spacing.md,
    paddingBottom:   20,
    overflow:        'hidden',
    position:        'relative',
  },
  heroPattern: {
    position:  'absolute', top: 0, right: 0,
    flexDirection: 'row', flexWrap: 'wrap',
    width: 120, gap: 14, padding: 14,
  },
  heroDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff',
  },
  heroContent: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingHorizontal: 20,
    marginBottom:   8,
  },
  heroLeft:   { flex: 1 },
  heroDate:   { fontSize: 11, color: colors.primaryLight, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4, opacity: 0.8 },
  greeting:   { fontSize: 14, color: colors.primaryLight, opacity: 0.9 },
  userName:   { fontSize: 26, fontWeight: '900', color: colors.textLight, marginTop: 2, letterSpacing: -0.5 },
  locationRow:{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText:{ fontSize: 12, color: colors.primaryLight, opacity: 0.8 },

  avatarBtn:   { position: 'relative', marginTop: 4 },
  avatarInner: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  onlineDot:  {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: colors.primaryDark,
  },

  heroBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    marginHorizontal: 20,
    marginTop:       4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    10,
    paddingHorizontal: 12,
    paddingVertical:  7,
  },
  heroBannerText: { fontSize: 12, color: colors.primaryLight, flex: 1, opacity: 0.9 },

  // Weather Snapshot
  weatherSnap: {
    margin:        16,
    marginTop:     16,
    backgroundColor: colors.card,
    borderRadius:  16,
    padding:       14,
    borderWidth:   isDark ? 1 : 0,
    borderColor:   colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    ...theme.shadows.sm,
  },
  weatherSnapTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  weatherSnapLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weatherIconBadge:{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  weatherSnapTitle:{ fontSize: 14, fontWeight: '700' },
  weatherSnapSub:  { fontSize: 11, marginTop: 1 },
  weatherSnapRight:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  refreshBtn:      { padding: 6, borderRadius: 20, backgroundColor: colors.bg },
  weatherRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTemp:     { fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  weatherDesc:     { fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  weatherStats:    { gap: 6, alignItems: 'flex-end' },
  weatherStat:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weatherStatText: { fontSize: 12 },

  // Actions
  actionsGrid: {
    flexDirection:   'row',
    flexWrap:        'wrap',
    paddingHorizontal: 16,
    gap:             10,
    marginBottom:    20,
  },

  // Section spacing
  sectionSpacing: { marginBottom: 16 },
  categoryScroll: { paddingHorizontal: 16, paddingBottom: 4 },

  // Tip card
  tipCard: {
    margin:          16,
    marginTop:       8,
    backgroundColor: isDark ? colors.card : '#FFFDE7',
    borderRadius:    16,
    padding:         16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderWidth:     isDark ? 1 : 0,
    borderColor:     isDark ? colors.border : 'transparent',
    ...theme.shadows.sm,
  },
  tipHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  tipIconBadge:  { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tipTitleBlock: { flex: 1 },
  tipTitle:      { fontSize: 14, fontWeight: '800' },
  tipCounter:    { fontSize: 11, marginTop: 1 },
  tipShare:      { padding: 4 },
  tipText:       { fontSize: 13, lineHeight: 21, marginBottom: 12 },
  tipFooter:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipCTA:        { fontSize: 12, fontWeight: '700' },
  tipDots:       { flexDirection: 'row', gap: 5, marginTop: 12, alignItems: 'center' },
  tipDot:        { height: 6, borderRadius: 3 },
});

export default HomeScreen;