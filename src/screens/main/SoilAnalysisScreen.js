// SoilAnalysisScreen — themed soil health dashboard with live/mock sensor data

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../constants/theme';

const THINGSPEAK_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';
const THINGSPEAK_API_KEY    = 'YOUR_READ_API_KEY_HERE';
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`;

const MOCK_DATA = { nitrogen: 85, phosphorus: 42, potassium: 120, temperature: 24.5, humidity: 62, ph: 6.4 };

const scoreColor = (s) => s >= 75 ? '#43A047' : s >= 50 ? '#FB8C00' : '#e53935';

const calcScore = (n, p, k, ph) => {
  const phScore = ph >= 6.0 && ph <= 7.0 ? 100 : ph >= 5.5 && ph <= 7.5 ? 70 : 40;
  return Math.round((Math.min(n / 140 * 100, 100) + Math.min(p / 60 * 100, 100) + Math.min(k / 200 * 100, 100) + phScore) / 4);
};

const getRecommendations = (n, p, k, ph) => {
  const r = [];
  if (n < 80)  r.push('Apply nitrogen-rich fertilizer (Urea or DAP)');
  if (p < 30)  r.push('Add phosphorus fertilizer (SSP or DAP)');
  if (k < 100) r.push('Apply potassium fertilizer (MOP or SOP)');
  if (ph < 6.0) r.push('Add agricultural lime to raise soil pH');
  if (ph > 7.5) r.push('Add sulfur or acidic fertilizer to lower pH');
  if (r.length === 0) r.push('Soil is in excellent condition! Maintain current practices.');
  return r;
};

const SENSOR_ITEMS = [
  { key: 'nitrogen',    label: 'Nitrogen',    unit: ' ppm', icon: 'leaf-outline',        color: '#43A047' },
  { key: 'phosphorus',  label: 'Phosphorus',  unit: ' ppm', icon: 'nuclear-outline',     color: '#1E88E5' },
  { key: 'potassium',   label: 'Potassium',   unit: ' ppm', icon: 'stats-chart-outline', color: '#8E24AA' },
  { key: 'temperature', label: 'Temperature', unit: '°C',   icon: 'thermometer-outline', color: '#E53935' },
  { key: 'humidity',    label: 'Humidity',    unit: '%',    icon: 'water-outline',       color: '#00ACC1' },
  { key: 'ph',          label: 'pH Level',    unit: '',     icon: 'flask-outline',       color: '#FB8C00' },
];

export default function SoilAnalysisScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [sensorData, setSensorData]     = useState(null);
  const [sensorOnline, setSensorOnline] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);

  const fetchSensorData = async () => {
    try {
      const res  = await fetch(THINGSPEAK_URL);
      const json = await res.json();
      if (json && json.field1 !== undefined && parseFloat(json.field1) > 0) {
        setSensorData({
          nitrogen: parseFloat(json.field1) || 0,
          phosphorus: parseFloat(json.field2) || 0,
          potassium: parseFloat(json.field3) || 0,
          temperature: parseFloat(json.field4) || 0,
          humidity: parseFloat(json.field5) || 0,
          ph: parseFloat(json.field6) || 7.0,
        });
        setSensorOnline(true);
      } else {
        setSensorData(MOCK_DATA);
        setSensorOnline(false);
      }
    } catch {
      setSensorData(MOCK_DATA);
      setSensorOnline(false);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSensorData(); }, []);

  const data  = sensorData || MOCK_DATA;
  const score = calcScore(data.nitrogen, data.phosphorus, data.potassium, data.ph);
  const recs  = getRecommendations(data.nitrogen, data.phosphorus, data.potassium, data.ph);
  const scoreClr = scoreColor(score);
  const s = makeStyles(colors, isDark);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Soil Health Analyzer"
        subtitle={sensorOnline ? 'Live sensor data' : 'Demo mode — connect ESP32'}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => { setRefreshing(true); fetchSensorData(); }}
            style={[s.refreshBtn, { backgroundColor: colors.earth + '20' }]}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.earth} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={colors.earth} />
          <Text style={[s.loadingText, { color: colors.textMuted }]}>Reading sensor data...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchSensorData(); }}
              colors={[colors.earth]}
              tintColor={colors.earth}
            />
          }
        >
          <View style={[s.statusBanner, {
            backgroundColor: sensorOnline ? colors.success + '18' : colors.warning + '18',
            borderColor: sensorOnline ? colors.success + '40' : colors.warning + '40',
          }]}>
            <View style={[s.statusDot, { backgroundColor: sensorOnline ? colors.success : colors.warning }]} />
            <View style={{ flex: 1 }}>
              <Text style={[s.statusTitle, { color: sensorOnline ? colors.success : colors.warning }]}>
                {sensorOnline ? 'Sensor Connected' : 'Sensor Not Connected'}
              </Text>
              <Text style={[s.statusSub, { color: colors.textMuted }]}>
                {sensorOnline
                  ? 'Live data from ESP32 via ThingSpeak'
                  : 'Showing sample data. Connect ESP32 to ThingSpeak for live readings.'}
              </Text>
            </View>
          </View>

          {lastUpdated && (
            <Text style={[s.lastUpdated, { color: colors.textMuted }]}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}

          <Text style={[s.sectionLabel, { color: colors.textDark }]}>Sensor Readings</Text>
          <View style={s.sensorGrid}>
            {SENSOR_ITEMS.map(({ key, label, unit, icon, color }) => (
              <View key={key} style={[s.sensorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[s.sensorIconBox, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={[s.sensorValue, { color: colors.textDark }]}>
                  {data[key] ?? '--'}{unit}
                </Text>
                <Text style={[s.sensorLabel, { color: colors.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textDark }]}>Soil Health Report</Text>
          <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.scoreSection}>
              <View style={[s.scoreCircle, { borderColor: scoreClr }]}>
                <Text style={[s.scoreNum, { color: scoreClr }]}>{score}</Text>
                <Text style={[s.scoreDenom, { color: colors.textMuted }]}>/ 100</Text>
              </View>
              <Text style={[s.fertilityText, { color: scoreClr }]}>
                {score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low'} Fertility
              </Text>
            </View>

            <View style={s.npkRow}>
              {[
                { label: 'N', value: data.nitrogen, color: '#43A047' },
                { label: 'P', value: data.phosphorus, color: '#1E88E5' },
                { label: 'K', value: data.potassium, color: '#8E24AA' },
              ].map((item) => (
                <View key={item.label} style={[s.npkBadge, { borderColor: item.color }]}>
                  <Text style={[s.npkLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={[s.npkValue, { color: colors.textDark }]}>{item.value}</Text>
                  <Text style={[s.npkUnit, { color: colors.textMuted }]}>ppm</Text>
                </View>
              ))}
            </View>

            {[
              ['Soil Type', data.ph < 5.5 ? 'Acidic Sandy' : data.ph > 7.5 ? 'Alkaline Clay' : 'Loamy (Ideal)'],
              ['pH Level', data.ph],
              ['Temperature', `${data.temperature}°C`],
              ['Humidity', `${data.humidity}%`],
            ].map(([k, v]) => (
              <View key={k} style={[s.resultRow, { borderBottomColor: colors.divider }]}>
                <Text style={[s.resultKey, { color: colors.textMuted }]}>{k}</Text>
                <Text style={[s.resultVal, { color: colors.textDark }]}>{v}</Text>
              </View>
            ))}

            <Text style={[s.subHeading, { color: colors.textDark }]}>Recommendations</Text>
            {recs.map((r, i) => (
              <View key={i} style={s.bulletRow}>
                <Ionicons name="checkmark-done-outline" size={16} color={colors.earth} />
                <Text style={[s.bulletText, { color: colors.textSecondary }]}>{r}</Text>
              </View>
            ))}
          </View>

          {!sensorOnline && (
            <View style={[s.connectGuide, { backgroundColor: isDark ? colors.warning + '15' : '#FFF8E1' }]}>
              <Text style={[s.connectTitle, { color: colors.warning }]}>How to Connect Your Sensor</Text>
              {[
                '1. Power on your ESP32 NPK sensor',
                '2. Make sure ESP32 is connected to WiFi',
                '3. ESP32 sends data to ThingSpeak automatically',
                '4. Pull down to refresh this screen',
              ].map((step, i) => (
                <Text key={i} style={[s.connectStep, { color: colors.textSecondary }]}>{step}</Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const makeStyles = (colors, isDark) => StyleSheet.create({
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: theme.typography.fontSize.md },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTitle: { fontSize: theme.typography.fontSize.sm, fontWeight: '700' },
  statusSub: { fontSize: theme.typography.fontSize.xs, marginTop: 2 },
  lastUpdated: { fontSize: 11, textAlign: 'right', marginBottom: theme.spacing.md },
  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing.lg },
  sensorCard: {
    width: '30%',
    flexGrow: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  sensorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorValue: { fontSize: 16, fontWeight: '800' },
  sensorLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  resultCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.md,
  },
  scoreSection: { alignItems: 'center', marginBottom: theme.spacing.md },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: { fontSize: 36, fontWeight: '900' },
  scoreDenom: { fontSize: 12 },
  fertilityText: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  npkRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing.md },
  npkBadge: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  npkLabel: { fontSize: 20, fontWeight: '900' },
  npkValue: { fontSize: 16, fontWeight: '700' },
  npkUnit: { fontSize: 11 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultKey: { fontSize: 14 },
  resultVal: { fontSize: 14, fontWeight: '700' },
  subHeading: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  bulletText: { fontSize: 13, flex: 1, lineHeight: 20 },
  connectGuide: { borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginTop: 4 },
  connectTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  connectStep: { fontSize: 13, marginBottom: 6, lineHeight: 20 },
});
