import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { selectCurrentWeather } from '../../store/slices/weatherSlice';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../utils/i18n';

const SEASON_LABELS = {
  spring:  { label: 'Pre-Monsoon',   icon: 'flower-outline',  color: '#F06292' },
  monsoon: { label: 'Monsoon',       icon: 'rainy-outline',   color: '#0288D1' },
  autumn:  { label: 'Post-Monsoon',  icon: 'leaf-outline',    color: '#F57C00' },
  winter:  { label: 'Winter / Rabi', icon: 'snow-outline',    color: '#5C6BC0' },
};

const CATEGORY_COLORS = {
  'Weather Alert': '#E53935',
  'Daily Tip':     '#2E7D32',
  Soil:            '#795548',
  Crops:           '#388E3C',
  Pest:            '#E65100',
  Irrigation:      '#0288D1',
  Drainage:        '#0097A7',
  Storage:         '#6D4C41',
  Harvest:         '#F57C00',
  Market:          '#7B1FA2',
  Frost:           '#5C6BC0',
  Potato:          '#8D6E63',
};

export default function AdvisoryScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const currentWeather   = useSelector(selectCurrentWeather);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing]             = useState(false);
  const [expanded, setExpanded]                 = useState(null);

  const weatherData = currentWeather
    ? { temp: currentWeather.temperature, humidity: currentWeather.humidity, description: currentWeather.description }
    : null;

  const advisories = useMemo(() => getAdvisories(weatherData), [currentWeather]);
  const categories = useMemo(() => getCategories(), []);
  const season     = useMemo(() => getCurrentSeason(), []);
  const seasonMeta = SEASON_LABELS[season];

  const filtered = selectedCategory === 'All'
    ? advisories
    : advisories.filter((a) => a.category === selectedCategory);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Farm Advisory"
        subtitle={seasonMeta.label}
        onBack={() => navigation.goBack()}
        rightElement={
          <View style={[styles.seasonIconBadge, { backgroundColor: seasonMeta.color + '25' }]}>
            <Ionicons name={seasonMeta.icon} size={18} color={seasonMeta.color} />
          </View>
        }
      />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: isDark ? colors.border : '#E1BEE7' }]}
        contentContainerStyle={styles.filterBarContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, { borderColor: isDark ? colors.border : '#CE93D8', backgroundColor: colors.card }, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterChipText, { color: isDark ? colors.primary : '#6A1B9A' }, selectedCategory === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advisory List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />
        }
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('advisory.noContentMsg')}</Text>
          </View>
        )}

        {filtered.map((item) => {
          const catColor = CATEGORY_COLORS[item.category] || colors.primary;
          const isOpen   = expanded === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.card }, item.urgent && { borderLeftWidth: 4, borderLeftColor: colors.error, backgroundColor: isDark ? colors.surface : '#FFF8F8' }]}
              onPress={() => setExpanded(isOpen ? null : item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
                  <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
                </View>
                <View style={styles.cardMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.minRead, { color: colors.textMuted }]}>{item.minRead} {t('advisory.minRead')}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: item.urgent ? colors.error : colors.textDark }]}>
                {item.title}
              </Text>

              {isOpen && <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{item.body}</Text>}

              {isOpen && item.tags?.length > 0 && (
                <View style={styles.tags}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: isDark ? colors.surface : '#F3E5F5' }]}>
                      <Text style={[styles.tagText, { color: isDark ? colors.primary : '#7B1FA2' }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.expandRow}>
                <Text style={[styles.expandHint, { color: colors.textMuted }]}>{isOpen ? 'Show less' : t('advisory.title')}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  seasonIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar:             { maxHeight: 52, borderBottomWidth: 1 },
  filterBarContent:      { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip:            { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  filterChipActive:      { backgroundColor: '#6A1B9A', borderColor: '#6A1B9A' },
  filterChipText:        { fontSize: 12, fontWeight: '600' },
  filterChipTextActive:  { color: '#fff' },
  listContent:           { padding: 14, paddingBottom: 40, gap: 12 },
  empty:                 { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText:             { fontSize: 14 },
  card:                  { borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardHeader:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge:              { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  catText:               { fontSize: 11, fontWeight: '700' },
  cardMeta:              { flexDirection: 'row', alignItems: 'center', gap: 4 },
  minRead:               { fontSize: 11 },
  cardTitle:             { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  cardBody:              { fontSize: 13, lineHeight: 21, marginBottom: 10 },
  tags:                  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag:                   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText:               { fontSize: 11 },
  expandRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  expandHint:            { fontSize: 11 },
});

// ── Nepal's farming seasons ───────────────────────────────────────────────────
// Month: 0=Jan ... 11=Dec
const NEPAL_SEASON = (month) => {
  if (month >= 2 && month <= 4)  return 'spring';   // Mar–May: Pre-monsoon
  if (month >= 5 && month <= 8)  return 'monsoon';  // Jun–Sep: Monsoon (Kharif)
  if (month >= 9 && month <= 10) return 'autumn';   // Oct–Nov: Post-monsoon
  return 'winter';                                   // Dec–Feb: Rabi
};

// ── Advisories keyed by season ────────────────────────────────────────────────
const SEASONAL_ADVISORIES = {
  spring: [
    { id: 's1', category: 'Soil',     title: 'Pre-Monsoon Soil Preparation', body: 'Start preparing fields for Kharif crops. Deep ploughing and adding organic compost now will significantly improve monsoon yields. Target soil pH of 6.0–6.5 for most vegetables.', minRead: 3, tags: ['soil', 'preparation'] },
    { id: 's2', category: 'Crops',    title: 'Maize Planting Window Opens', body: 'March–April is ideal for maize planting in the Terai and mid-hills. Use improved varieties like Arun-2 or RML-4. Ensure seed treatment with Thiram (2g/kg) before sowing.', minRead: 4, tags: ['maize', 'planting'] },
    { id: 's3', category: 'Irrigation', title: 'Water Conservation Before Monsoon', body: 'With monsoon still weeks away, use drip irrigation to conserve water. Mulching with rice straw reduces moisture evaporation by up to 40%.', minRead: 3, tags: ['water', 'irrigation'] },
    { id: 's4', category: 'Market',   title: 'Tomato Prices Peaking', body: 'Pre-monsoon is typically when tomato prices peak at Kalimati market (NPR 60–80/kg). Consider holding stock for 1–2 weeks if storage is available.', minRead: 2, tags: ['tomato', 'market'] },
  ],
  monsoon: [
    { id: 'm1', category: 'Pest',     title: 'Monsoon Fungal Disease Alert', body: 'High humidity (>80%) creates ideal conditions for late blight, downy mildew, and rice blast. Apply Mancozeb (2g/L water) as a preventive spray every 7–10 days on tomatoes, potatoes, and cucumbers.', minRead: 5, tags: ['fungal', 'spray', 'monsoon'] },
    { id: 'm2', category: 'Crops',    title: 'Paddy Transplanting Season', body: 'June–July is the critical paddy transplanting window in Nepal. Plant 25–30 day old seedlings at 20x15cm spacing. Apply basal fertilizer (DAP 100kg/ha + Urea 50kg/ha) before transplanting.', minRead: 4, tags: ['paddy', 'rice', 'monsoon'] },
    { id: 'm3', category: 'Drainage', title: 'Waterlogging Prevention Critical', body: 'Ensure proper field drainage channels are open. Waterlogged fields for >48 hours can cause root rot and reduce yields by 30–50%. Check drainage after every heavy rainfall.', minRead: 3, tags: ['drainage', 'flood'] },
    { id: 'm4', category: 'Storage',  title: 'Protect Stored Grains from Humidity', body: 'Monsoon humidity damages stored grain rapidly. Keep moisture content below 13% before storage. Use airtight PICS bags or hermetic storage containers to prevent weevil infestation.', minRead: 3, tags: ['storage', 'grain'] },
  ],
  autumn: [
    { id: 'a1', category: 'Harvest',  title: 'Paddy Harvest Guidelines', body: 'Paddy is ready to harvest when 80–85% of grains turn golden yellow. Harvest during morning hours to reduce shattering losses. Target moisture content of 20–25% at harvest for best milling quality.', minRead: 4, tags: ['paddy', 'harvest'] },
    { id: 'a2', category: 'Crops',    title: 'Rabi Crop Sowing Preparation', body: 'October–November is ideal for wheat, mustard, and potato planting. Prepare seedbeds now. Apply FYM (farmyard manure) at 20 tonnes/ha and incorporate into soil before sowing.', minRead: 3, tags: ['wheat', 'mustard', 'rabi'] },
    { id: 'a3', category: 'Market',   title: 'Vegetable Prices Rising Post-Monsoon', body: 'Post-monsoon is a good time to sell leafy vegetables. Spinach (NPR 30–45/kg) and cabbage (NPR 20–30/kg) prices typically rise as supply stabilises. Target Kalimati wholesale market.', minRead: 2, tags: ['vegetables', 'market'] },
    { id: 'a4', category: 'Soil',     title: 'Post-Harvest Soil Health Check', body: 'After paddy harvest, conduct a soil test to assess nutrient levels. Incorporate crop residues as green manure rather than burning, which enriches soil nitrogen by 15–20 kg N/ha.', minRead: 3, tags: ['soil', 'fertility'] },
  ],
  winter: [
    { id: 'w1', category: 'Crops',    title: 'Wheat and Mustard Care', body: 'First irrigation of wheat at Crown Root Initiation (CRI) stage (20–25 days after sowing) is critical. Delay beyond this reduces yields by 15–20%. Apply top-dress nitrogen (Urea 65kg/ha) at CRI.', minRead: 4, tags: ['wheat', 'irrigation'] },
    { id: 'w2', category: 'Frost',    title: 'Frost Protection for Winter Crops', body: 'December–January nights in hills can drop below 0°C. Cover nursery beds with plastic sheets or rice straw. Smoke method (burning crop residues in the evening) can protect field crops.', minRead: 3, tags: ['frost', 'winter', 'protection'] },
    { id: 'w3', category: 'Potato',   title: 'Potato Late Blight Warning', body: 'Cool, moist winters are ideal for potato late blight (Phytophthora infestans). Spray Ridomil Gold or Revus at first sign of disease. Avoid overhead irrigation to keep foliage dry.', minRead: 4, tags: ['potato', 'disease'] },
    { id: 'w4', category: 'Market',   title: 'Winter Vegetable Market Opportunity', body: 'Cauliflower (NPR 25–45/kg), carrot (NPR 40–60/kg) and radish (NPR 15–25/kg) are in peak season. Grade and sort produce carefully — premium grades fetch 30–40% more at Kalimati.', minRead: 2, tags: ['vegetables', 'market', 'winter'] },
  ],
};

const getWeatherAdvisory = (weatherData) => {
  if (!weatherData) return null;
  const { temp, humidity, description } = weatherData;
  const advisories = [];

  if (humidity > 85) {
    advisories.push({
      id: `w_humid_${Date.now()}`,
      category: 'Weather Alert',
      title: '⚠️ High Humidity — Fungal Risk',
      body: `Current humidity is ${humidity}%. Risk of fungal disease is HIGH. Apply preventive fungicide spray on tomatoes, cucumbers, and potatoes today. Ensure good air circulation between plants.`,
      minRead: 2,
      tags: ['weather', 'fungal', 'urgent'],
      urgent: true,
    });
  }

  if (temp > 35) {
    advisories.push({
      id: `w_hot_${Date.now()}`,
      category: 'Weather Alert',
      title: '🌡️ Heat Stress Warning',
      body: `Temperature is ${temp}°C — above the stress threshold for most crops. Irrigate in the early morning or evening only. Apply light mulch to keep root zone cool. Avoid pesticide spraying in peak heat.`,
      minRead: 2,
      tags: ['weather', 'heat', 'urgent'],
      urgent: true,
    });
  }

  if (temp < 5) {
    advisories.push({
      id: `w_cold_${Date.now()}`,
      category: 'Weather Alert',
      title: '❄️ Frost Risk Tonight',
      body: `Temperature dropping to ${temp}°C. Protect seedlings and frost-sensitive crops (tomatoes, peppers, beans) with plastic covers or rice straw tonight. Irrigate fields lightly — wet soil retains more heat.`,
      minRead: 2,
      tags: ['weather', 'frost', 'urgent'],
      urgent: true,
    });
  }

  if (description?.toLowerCase().includes('rain') || description?.toLowerCase().includes('storm')) {
    advisories.push({
      id: `w_rain_${Date.now()}`,
      category: 'Weather Alert',
      title: '🌧️ Rain Expected — Take Action',
      body: 'Heavy rain forecast. Secure harvested produce in dry storage. Ensure drainage channels are clear. Delay fertilizer application — rain will wash nutrients away. Protect pollinators by avoiding pesticide spraying.',
      minRead: 2,
      tags: ['weather', 'rain'],
    });
  }

  return advisories;
};

const DAILY_TIPS = [
  'Test your soil pH annually. Most crops grow best in pH 6.0–7.0. A simple soil test kit costs NPR 500 and can save thousands in wasted fertilizer.',
  'Composting kitchen waste and crop residues creates free, high-quality organic fertilizer. A well-made compost pile is ready in 6–8 weeks.',
  'Crop rotation prevents disease buildup and improves soil health. Never plant the same crop family in the same bed two seasons in a row.',
  'Drip irrigation uses 50% less water than flood irrigation and reduces fungal disease by keeping foliage dry.',
  'Early morning (6–9 AM) is the best time to inspect crops for pests. Many insects are most visible before the heat of the day.',
  'Keep a farm diary. Recording planting dates, inputs used, and yields helps you make better decisions each season.',
  'Integrated Pest Management (IPM): try neem oil spray (5ml/L water) before reaching for chemical pesticides.',
  'Store seeds in airtight containers with silica gel packets to maintain germination rates above 80% for next season.',
];

const getDailyTip = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
};

export const getAdvisories = (weatherData = null) => {
  const month = new Date().getMonth();
  const season = NEPAL_SEASON(month);
  const seasonal = SEASONAL_ADVISORIES[season] || [];
  const weatherAlerts = weatherData ? (getWeatherAdvisory(weatherData) || []) : [];

  const dailyTip = {
    id: `tip_${new Date().toDateString()}`,
    category: 'Daily Tip',
    title: "Today's Farming Tip",
    body: getDailyTip(),
    minRead: 1,
    tags: ['tip', 'daily'],
  };

  return [...weatherAlerts, dailyTip, ...seasonal];
};

export const getCategories = () => {
  const month = new Date().getMonth();
  const season = NEPAL_SEASON(month);
  const advisories = SEASONAL_ADVISORIES[season] || [];
  const cats = ['All', ...new Set(advisories.map((a) => a.category))];
  return cats;
};

export const getCurrentSeason = () => {
  const month = new Date().getMonth();
  return NEPAL_SEASON(month);
};