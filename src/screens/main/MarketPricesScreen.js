import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';

// ── Kalimati Market Nepal – Realistic daily prices (NRS/kg) ─────────────────
const KALIMATI_BASE_PRICES = [
  { id: '1',  name: 'Tomato',       category: 'Vegetables', basePrice: 45,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '2',  name: 'Potato',       category: 'Vegetables', basePrice: 30,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '3',  name: 'Onion',        category: 'Vegetables', basePrice: 55,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '4',  name: 'Cabbage',      category: 'Vegetables', basePrice: 25,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '5',  name: 'Cauliflower',  category: 'Vegetables', basePrice: 40,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '6',  name: 'Spinach',      category: 'Vegetables', basePrice: 35,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '7',  name: 'Radish',       category: 'Vegetables', basePrice: 20,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '8',  name: 'Carrot',       category: 'Vegetables', basePrice: 50,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '9',  name: 'Bitter Gourd', category: 'Vegetables', basePrice: 60,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '10', name: 'Pumpkin',      category: 'Vegetables', basePrice: 28,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '11', name: 'Maize',        category: 'Cereals',    basePrice: 32,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '12', name: 'Rice (Local)', category: 'Cereals',    basePrice: 85,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '13', name: 'Wheat',        category: 'Cereals',    basePrice: 40,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '14', name: 'Banana',       category: 'Fruits',     basePrice: 55,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '15', name: 'Apple',        category: 'Fruits',     basePrice: 180, unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '16', name: 'Orange',       category: 'Fruits',     basePrice: 90,  unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '17', name: 'Mango',        category: 'Fruits',     basePrice: 120, unit: 'kg',    market: 'Kalimati, Kathmandu' },
  { id: '18', name: 'Lemon',        category: 'Fruits',     basePrice: 70,  unit: 'piece', market: 'Kalimati, Kathmandu' },
];

const CATEGORY_FILTERS = ['All', 'Vegetables', 'Cereals', 'Fruits'];
const SORT_KEYS   = ['Most Recent', 'Name A-Z', 'Price ↓', 'Biggest Rise'];

// ── Daily price simulation ───────────────────────────────────────────────────
const getDailyPrices = () => {
  const today = new Date();
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return KALIMATI_BASE_PRICES.map((crop, index) => {
    const rand1         = Math.sin(seed + index * 127.1) * 0.5 + 0.5;
    const changePercent = parseFloat(((rand1 - 0.48) * 20).toFixed(1));
    const currentPrice  = Math.round(crop.basePrice * (1 + changePercent / 100));
    const prevPrice     = Math.round(currentPrice / (1 + changePercent / 100));
    return { ...crop, currentPrice, prevPrice, changePercent, updatedAt: today };
  });
};

// ── Price Change Chip ────────────────────────────────────────────────────────
const PriceChangeChip = ({ pct }) => {
  const isRise   = pct > 0;
  const isStable = pct === 0;
  const bg       = isStable ? '#F5F5F5' : isRise ? '#E8F5E9' : '#FFEBEE';
  const color    = isStable ? '#757575' : isRise ? '#2E7D32' : '#C62828';
  const icon     = isStable ? 'remove' : isRise ? 'trending-up' : 'trending-down';
  return (
    <View style={[chipStyles.chip, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[chipStyles.text, { color }]}>
        {isStable ? 'Stable' : `${isRise ? '+' : ''}${pct}%`}
      </Text>
    </View>
  );
};
const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  text: { fontSize: 12, fontWeight: '700' },
});

// ── Crop Card ────────────────────────────────────────────────────────────────
const CropCard = ({ item, colors, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const isRise = item.changePercent > 0;
  const isFall = item.changePercent < 0;
  const priceColor = isRise ? '#E65100' : isFall ? '#E65100' : '#E65100'; // orange for all price text per screenshot

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[cardStyles.card, { backgroundColor: colors.card }]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onPress && onPress(item)}
        activeOpacity={1}
      >
        {/* Orange left border accent */}
        <View style={cardStyles.leftBorder} />

        <View style={cardStyles.inner}>
          {/* Top row: name + category dot + chip */}
          <View style={cardStyles.topRow}>
            <View style={cardStyles.nameRow}>
              <View style={cardStyles.dot} />
              <View>
                <Text style={[cardStyles.cropName, { color: colors.textDark }]}>{item.name}</Text>
                <Text style={[cardStyles.category, { color: colors.textMuted }]}>{item.category}</Text>
              </View>
            </View>
            <PriceChangeChip pct={item.changePercent} />
          </View>

          {/* Divider */}
          <View style={[cardStyles.divider, { backgroundColor: colors.border || '#F0F0F0' }]} />

          {/* Bottom row: price + meta */}
          <View style={cardStyles.bottomRow}>
            <View>
              <Text style={[cardStyles.priceLabel, { color: colors.textMuted }]}>CURRENT PRICE</Text>
              <Text style={[cardStyles.priceValue, { color: priceColor }]}>
                NPR {item.currentPrice}
              </Text>
              <Text style={[cardStyles.priceUnit, { color: colors.textMuted }]}>per {item.unit}</Text>
            </View>

            <View style={cardStyles.metaCol}>
              <View style={cardStyles.metaRow}>
                <Ionicons name="storefront-outline" size={12} color={colors.textMuted} />
                <Text style={[cardStyles.metaText, { color: colors.textMuted }]}>Kalimati, Kathmandu</Text>
              </View>
              <View style={cardStyles.metaRow}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={[cardStyles.metaText, { color: colors.textMuted }]}>Today</Text>
              </View>
              <View style={cardStyles.metaRow}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={[cardStyles.metaText, { color: colors.textMuted }]}>
                  {item.updatedAt.toLocaleDateString('en-NP', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity style={cardStyles.historyBtn}>
                <Text style={cardStyles.historyBtnText}>Tap for price history</Text>
                <Ionicons name="chevron-forward" size={11} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 },
    }),
  },
  leftBorder: {
    width: 5,
    backgroundColor: '#F5A623',
  },
  inner: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5A623',
    marginTop: 2,
  },
  cropName:  { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  category:  { fontSize: 12, fontWeight: '500', marginTop: 1 },
  divider:   { height: 1, marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  priceLabel:{ fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  priceValue:{ fontSize: 28, fontWeight: '900', lineHeight: 32 },
  priceUnit: { fontSize: 12, marginTop: 2 },
  metaCol:   { alignItems: 'flex-end', gap: 5, flex: 1, marginLeft: 12 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:  { fontSize: 11 },
  historyBtn:{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  historyBtnText: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },
});

// ── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ rising, falling, stable, topGainer, colors }) => (
  <View style={[statsStyles.bar, { backgroundColor: colors.card }]}>
    <View style={statsStyles.segment}>
      <Ionicons name="trending-up" size={16} color="#2E7D32" />
      <Text style={[statsStyles.count, { color: '#2E7D32' }]}>{rising}</Text>
      <Text style={[statsStyles.label, { color: colors.textMuted }]}>Rising</Text>
    </View>
    <View style={[statsStyles.sep, { backgroundColor: colors.border || '#E8E8E8' }]} />
    <View style={statsStyles.segment}>
      <Ionicons name="trending-down" size={16} color="#C62828" />
      <Text style={[statsStyles.count, { color: '#C62828' }]}>{falling}</Text>
      <Text style={[statsStyles.label, { color: colors.textMuted }]}>Falling</Text>
    </View>
    <View style={[statsStyles.sep, { backgroundColor: colors.border || '#E8E8E8' }]} />
    <View style={statsStyles.segment}>
      <Ionicons name="remove" size={16} color="#757575" />
      <Text style={[statsStyles.count, { color: '#757575' }]}>{stable}</Text>
      <Text style={[statsStyles.label, { color: colors.textMuted }]}>Stable</Text>
    </View>
    {topGainer && (
      <>
        <View style={[statsStyles.sep, { backgroundColor: colors.border || '#E8E8E8' }]} />
        <View style={[statsStyles.segment, statsStyles.gainerSegment]}>
          <Ionicons name="star" size={15} color="#F9A825" />
          <View>
            <Text style={[statsStyles.gainerName, { color: colors.textDark }]}>{topGainer.name}</Text>
            <Text style={statsStyles.gainerPct}>+{topGainer.changePercent}% today</Text>
          </View>
        </View>
      </>
    )}
  </View>
);

const statsStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  gainerSegment: { flex: 1.5, gap: 6 },
  sep:     { width: 1, height: 28, marginHorizontal: 4 },
  count:   { fontSize: 18, fontWeight: '900' },
  label:   { fontSize: 11, fontWeight: '500' },
  gainerName: { fontSize: 12, fontWeight: '800' },
  gainerPct:  { fontSize: 11, color: '#2E7D32', fontWeight: '700' },
});

// ── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ search, onClear, colors }) => (
  <View style={emptyStyles.wrap}>
    <View style={[emptyStyles.iconWrap, { backgroundColor: (colors.primary || '#2E7D32') + '15' }]}>
      <Ionicons name="search-outline" size={44} color={colors.primary || '#2E7D32'} />
    </View>
    <Text style={[emptyStyles.title, { color: colors.textDark }]}>No crops found</Text>
    <Text style={[emptyStyles.sub, { color: colors.textMuted }]}>No results for "{search}"</Text>
    <TouchableOpacity
      style={[emptyStyles.btn, { backgroundColor: colors.primary || '#2E7D32' }]}
      onPress={onClear}
    >
      <Text style={emptyStyles.btnText}>Clear Search</Text>
    </TouchableOpacity>
  </View>
);
const emptyStyles = StyleSheet.create({
  wrap:     { alignItems: 'center', paddingTop: 60, gap: 10 },
  iconWrap: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  title:    { fontSize: 18, fontWeight: '800' },
  sub:      { fontSize: 13 },
  btn:      { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  btnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
});

// ── Main Screen ──────────────────────────────────────────────────────────────
const MarketPricesScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
 // const { t } = useTranslation();

  const [allCrops,   setAllCrops]   = useState([]);
  const [displayed,  setDisplayed]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [category,   setCategory]   = useState('All');
  const [sortBy,     setSortBy]     = useState('Most Recent');
  const [updatedAt,  setUpdatedAt]  = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = getDailyPrices();
      setAllCrops(data);
      setUpdatedAt(new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let list = [...allCrops];
    if (category !== 'All') list = list.filter(c => c.category === category);
    if (search.trim())      list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.market.toLowerCase().includes(search.toLowerCase())
    );
    switch (sortBy) {
      case 'Name A-Z':     list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'Price ↓':      list.sort((a, b) => b.currentPrice - a.currentPrice); break;
      case 'Biggest Rise': list.sort((a, b) => b.changePercent - a.changePercent); break;
    }
    setDisplayed(list);
  }, [allCrops, category, search, sortBy]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const rising    = allCrops.filter(c => c.changePercent > 0).length;
  const falling   = allCrops.filter(c => c.changePercent < 0).length;
  const stable    = allCrops.filter(c => c.changePercent === 0).length;
  const topGainer = allCrops.length
    ? allCrops.reduce((a, b) => a.changePercent > b.changePercent ? a : b)
    : null;

  const primaryColor = colors.primary || '#2E7D32';

  // ── List Header ────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={[
        headerStyles.searchBox,
        {
          backgroundColor: colors.card,
          borderColor: searchFocused ? primaryColor : (colors.border || '#E0E0E0'),
        },
      ]}>
        <Ionicons name="search" size={17} color={searchFocused ? primaryColor : (colors.textMuted)} />
        <TextInput
          style={[headerStyles.searchInput, { color: colors.textDark }]}
          placeholder="Search crops or markets..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <View style={headerStyles.tabsRow}>
        {CATEGORY_FILTERS.map(cat => {
          const isActive = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                headerStyles.tab,
                {
                  backgroundColor: isActive ? primaryColor : (colors.card),
                  borderColor: isActive ? primaryColor : (colors.border || '#E0E0E0'),
                },
              ]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[
                headerStyles.tabText,
                { color: isActive ? '#fff' : (colors.textMuted) },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sort Row */}
      <View style={headerStyles.sortRow}>
        <Text style={[headerStyles.cropCount, { color: colors.textMuted }]}>{displayed.length} crops</Text>
        <View style={headerStyles.sortBtns}>
          {SORT_KEYS.map(key => {
            const isActive = sortBy === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  headerStyles.sortBtn,
                  {
                    backgroundColor: isActive ? primaryColor : (colors.card),
                    borderColor: isActive ? primaryColor : (colors.border || '#E0E0E0'),
                  },
                ]}
                onPress={() => setSortBy(key)}
                activeOpacity={0.75}
              >
                <Text style={[
                  headerStyles.sortBtnText,
                  { color: isActive ? '#fff' : (colors.textMuted) },
                ]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Stats Bar */}
      {allCrops.length > 0 && (
        <StatsBar
          rising={rising}
          falling={falling}
          stable={stable}
          topGainer={topGainer}
          colors={colors}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingBox}>
        <View style={[styles.loadingGlow, { backgroundColor: primaryColor + '20' }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
        <Text style={[styles.loadingTitle, { color: colors.textDark }]}>Loading Market Prices</Text>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Fetching Kalimati data…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Market Prices"
        subtitle={`Updated at ${updatedAt}`}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightElement={
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={onRefresh}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={refreshing ? 'sync' : 'refresh-outline'} size={19} color={primaryColor} />
          </TouchableOpacity>
        }
        large
      />

      <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CropCard item={item} colors={colors} />
          )}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
              tintColor={primaryColor}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState search={search} onClear={() => setSearch('')} colors={colors} />
          }
        />
    </ScreenContainer>
  );
};

const headerStyles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  tabText: { fontSize: 12, fontWeight: '700' },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  cropCount: { fontSize: 12, fontWeight: '600', marginRight: 4 },
  sortBtns:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  sortBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  sortBtnText: { fontSize: 11, fontWeight: '700' },
});

const styles = StyleSheet.create({
  loadingBox:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingGlow: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  loadingTitle:{ fontSize: 18, fontWeight: '800' },
  loadingText: { fontSize: 13 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  listContent: { paddingHorizontal: 14, paddingBottom: 32, paddingTop: 4 },
});

export default MarketPricesScreen;