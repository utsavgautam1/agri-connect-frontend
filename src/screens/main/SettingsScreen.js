import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../utils/i18n';
import {
  updateNotificationSettings,
  selectNotifications,
} from '../../store/slices/appSlice';
import { logoutAndClear, selectUser } from '../../store/slices/authSlice';
import { registerForPushNotifications } from '../../services/notifications';
import theme from '../../constants/theme';

const APP_VERSION = '1.0.0';

const LANGUAGES = [
  { code: 'en', label: 'English',          flag: '🇬🇧' },
  { code: 'ne', label: 'नेपाली (Nepali)',  flag: '🇳🇵' },
];

const TEMP_UNITS = ['°C', '°F'];

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, setDark } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const dispatch = useDispatch();
  const notifs   = useSelector(selectNotifications);
  const user     = useSelector(selectUser);
  const displayName = user?.fullName || user?.name || t('home.defaultName');
  const displayEmail = user?.email || 'farmer@agriConnect.np';
  const displayLocation = user?.farmLocation || 'Kathmandu, Nepal';
  const avatarLetter = (displayName[0] || 'F').toUpperCase();

  const [tempUnit, setTempUnit] = React.useState('°C');

  const toggleNotif = (key) => {
    dispatch(updateNotificationSettings({ [key]: !notifs[key] }));
  };

  const toggleMasterNotif = async () => {
    const newValue = !notifs.enabled;
    if (newValue) {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications for Agri-Connect in your device Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    dispatch(updateNotificationSettings({ enabled: newValue }));
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    Alert.alert(
      t('settings.languageChanged'),
      `${t('settings.languageMsg')} ${code === 'ne' ? 'नेपाली' : 'English'}`
    );
  };

  const handleLogout = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'), style: 'destructive',
        onPress: async () => {
          await dispatch(logoutAndClear());
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(t('settings.clearCacheTitle'), t('settings.clearCacheMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.clear') || 'Clear', style: 'destructive',
        onPress: () => Alert.alert(t('common.done'), t('settings.clearCacheDone')),
      },
    ]);
  };

  const s = makeStyles(colors, isDark);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Settings"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightElement={
          <View style={s.headerIconWrap}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
          </View>
        }
      />

      <ScrollView
        style={s.container}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Profile Card ── */}
        <View style={s.profileCard}>
          {/* Avatar with layered gradient effect */}
          <View style={s.avatarOuter}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>{avatarLetter}</Text>
            </View>
            {/* Online dot */}
            <View style={s.onlineDot} />
          </View>

          <View style={s.profileText}>
            {/* Name + Farmer badge */}
            <View style={s.profileNameRow}>
              <Text style={s.profileName}>{displayName}</Text>
              <View style={s.farmerBadge}>
                <Text style={s.farmerBadgeText}>🌱 Farmer</Text>
              </View>
            </View>
            <Text style={s.profileEmail}>{displayEmail}</Text>
            <View style={s.profileLocation}>
              <Ionicons name="location-outline" size={12} color={colors.primary} />
              <Text style={s.profileLocationText}>{displayLocation}</Text>
            </View>
          </View>

          {/* Edit arrow */}
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Notifications ── */}
        <SectionLabel label={t('settings.notifications')} color="#4CAF50" s={s} />
        <View style={s.card}>
          {/* Master toggle — visually distinct */}
          <View style={[s.masterRow]}>
            <View style={[s.rowIcon, { backgroundColor: colors.primary + '25' }]}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
            </View>
            <View style={s.rowText}>
              <Text style={s.masterLabel}>{t('settings.allNotifs')}</Text>
              <Text style={s.rowSubtitle}>
                {notifs.enabled ? '● Active' : '○ Disabled'}
              </Text>
            </View>
            <Switch
              value={notifs.enabled}
              onValueChange={toggleMasterNotif}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifs.enabled ? colors.primary : colors.surface}
            />
          </View>

          {/* Sub-toggles */}
          {[
            { key: 'weather',  label: t('settings.weatherAlerts'),   icon: 'partly-sunny',  color: '#0288D1' },
            { key: 'market',   label: t('settings.marketPrices'),    icon: 'bar-chart',     color: '#E65100' },
            { key: 'advisory', label: t('settings.advisoryUpdates'), icon: 'book',          color: '#6A1B9A' },
          ].map(({ key, label, icon, color }, i, arr) => {
            const isDisabled = !notifs.enabled;
            const isActive   = notifs[key] && notifs.enabled;
            return (
              <View
                key={key}
                style={[
                  s.row,
                  i < arr.length - 1 && s.rowBorder,
                  isDisabled && s.rowDisabled,
                ]}
              >
                <View style={[s.rowIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={17} color={color} />
                </View>
                <View style={s.rowText}>
                  <Text style={s.rowLabel}>{label}</Text>
                </View>
                {/* Active indicator dot */}
                {isActive && <View style={[s.activeDot, { backgroundColor: color }]} />}
                <Switch
                  value={notifs[key]}
                  onValueChange={() => toggleNotif(key)}
                  disabled={isDisabled}
                  trackColor={{ false: colors.border, true: color + '80' }}
                  thumbColor={notifs[key] ? color : colors.surface}
                />
              </View>
            );
          })}
        </View>

        {/* ── Appearance ── */}
        <SectionLabel label={t('settings.appearance')} color="#5C6BC0" s={s} />
        <View style={s.card}>
          {/* Dark Mode */}
          <View style={[s.row, s.rowBorder]}>
            <View style={[s.rowIcon, { backgroundColor: '#5C6BC025' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color="#5C6BC0" />
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t('settings.darkMode')}</Text>
              <Text style={s.rowSubtitle}>
                {isDark ? t('settings.darkModeOn') : t('settings.darkModeOff')}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setDark(val)}
              trackColor={{ false: colors.border, true: '#5C6BC080' }}
              thumbColor={isDark ? '#5C6BC0' : colors.surface}
            />
          </View>

          {/* Temperature Unit — pill style */}
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: '#E5393525' }]}>
              <Ionicons name="thermometer" size={18} color="#E53935" />
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t('settings.tempUnit')}</Text>
            </View>
            <View style={s.pillToggle}>
              {TEMP_UNITS.map((u) => {
                const isActive = tempUnit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    style={[s.pillBtn, isActive && s.pillBtnActive]}
                    onPress={() => setTempUnit(u)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.pillBtnText, isActive && s.pillBtnTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Language ── */}
        <SectionLabel label={t('settings.language')} color="#FF8F00" s={s} />
        <View style={s.card}>
          {LANGUAGES.map((lang, i) => {
            const isSelected = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  s.row,
                  i < LANGUAGES.length - 1 && s.rowBorder,
                  isSelected && s.rowSelected,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                {/* Flag emoji badge */}
                <View style={[s.rowIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={s.flagText}>{lang.flag}</Text>
                </View>
                <Text style={[
                  s.rowLabel,
                  isSelected && { color: colors.primary, fontWeight: '700' },
                ]}>
                  {lang.label}
                </Text>
                {isSelected
                  ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  : <Ionicons name="radio-button-off" size={20} color={colors.textMuted} />
                }
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Data & Storage ── */}
        <SectionLabel label={t('settings.dataStorage')} color="#FB8C00" s={s} />
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={handleClearCache} activeOpacity={0.7}>
            <View style={[s.rowIcon, { backgroundColor: '#FB8C0025' }]}>
              <Ionicons name="trash-outline" size={18} color="#FB8C00" />
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t('settings.clearCache')}</Text>
              <Text style={s.rowSubtitle}>{t('settings.clearCacheDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── About ── */}
        <SectionLabel label={t('settings.about')} color="#0288D1" s={s} />
        <View style={s.card}>
          <View style={[s.row, s.rowBorder]}>
            <View style={[s.rowIcon, { backgroundColor: '#0288D125' }]}>
              <Ionicons name="information-circle" size={18} color="#0288D1" />
            </View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>{t('settings.appVersion')}</Text>
            </View>
            <View style={s.versionBadge}>
              <Text style={s.versionBadgeText}>v{APP_VERSION}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.row, s.rowBorder]}
            onPress={() => navigation.navigate('Privacy')}
            activeOpacity={0.7}
          >
            <View style={[s.rowIcon, { backgroundColor: '#43A04725' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#43A047" />
            </View>
            <Text style={s.rowLabel}>{t('settings.privacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.row}
            onPress={() => navigation.navigate('Terms')}
            activeOpacity={0.7}
          >
            <View style={[s.rowIcon, { backgroundColor: '#6D4C4125' }]}>
              <Ionicons name="document-text" size={18} color="#6D4C41" />
            </View>
            <Text style={s.rowLabel}>{t('settings.termsOfUse')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={19} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.logoutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>

        {/* App version footer */}
        <Text style={s.footer}>Agri-Connect v{APP_VERSION} · Made with 🌱 in Nepal</Text>

      </ScrollView>
    </ScreenContainer>
  );
};

const SectionLabel = ({ label, color, s }) => (
  <View style={s.sectionLabelRow}>
    <View style={[s.sectionDot, { backgroundColor: color }]} />
    <Text style={s.sectionLabel}>{label}</Text>
  </View>
);

const makeStyles = (colors, isDark) => StyleSheet.create({
  headerIconWrap: {
    width:           38,
    height:          38,
    borderRadius:    12,
    backgroundColor: colors.primary + '15',
    justifyContent:  'center',
    alignItems:      'center',
  },

  container:     { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 50 },

  profileCard: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              14,
    backgroundColor:  colors.card,
    borderRadius:     20,
    padding:          16,
    marginBottom:     24,
    borderWidth:      1,
    borderColor:      colors.border,
    elevation:        4,
    shadowColor:      colors.primary,
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    isDark ? 0.3 : 0.1,
    shadowRadius:     8,
  },
  avatarOuter: {
    position: 'relative',
  },
  avatarInner: {
    width:           58,
    height:          58,
    borderRadius:    29,
    backgroundColor: colors.primary,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     3,
    borderColor:     colors.primary + '40',
  },
  avatarText:  { fontSize: 24, fontWeight: '800', color: '#fff' },
  onlineDot: {
    position:        'absolute',
    bottom:          2,
    right:           2,
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: '#4CAF50',
    borderWidth:     2,
    borderColor:     colors.card,
  },
  profileText:     { flex: 1 },
  profileNameRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  profileName:     { fontSize: 16, fontWeight: '700', color: colors.textDark },
  farmerBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius:    20,
    paddingHorizontal: 8,
    paddingVertical:   2,
  },
  farmerBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  profileEmail:    { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  profileLocation: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  profileLocationText: { fontSize: 12, color: colors.textMuted },
  editBtn: {
    width:           34,
    height:          34,
    borderRadius:    17,
    backgroundColor: colors.primary + '15',
    justifyContent:  'center',
    alignItems:      'center',
  },

  sectionLabelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginTop:      20,
    marginBottom:   10,
    marginLeft:     2,
  },
  sectionDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    color:         colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     colors.border,
    marginBottom:    4,
    overflow:        'hidden',
  },

  masterRow: {
    flexDirection:   'row',
    alignItems:      'center',
    padding:         16,
    gap:             12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.primary + '08',
  },
  masterLabel: {
    fontSize:   15,
    fontWeight: '700',
    color:      colors.textDark,
  },

  row:         { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  rowBorder:   { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowDisabled: { opacity: 0.35 },
  rowSelected: { backgroundColor: colors.primary + '08' },

  rowIcon: {
    width:          36,
    height:         36,
    borderRadius:   11,
    justifyContent: 'center',
    alignItems:     'center',
    elevation:      1,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.08,
    shadowRadius:   2,
  },
  rowText:     { flex: 1 },
  rowLabel:    { fontSize: 14, fontWeight: '600', color: colors.textDark },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  activeDot: {
    width:        7,
    height:       7,
    borderRadius: 4,
    marginRight:  4,
  },

  flagText: { fontSize: 18 },

  pillToggle: {
    flexDirection:  'row',
    backgroundColor: colors.border + '60',
    borderRadius:   20,
    padding:        3,
    gap:            2,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical:    6,
    borderRadius:      16,
  },
  pillBtnActive: {
    backgroundColor: colors.primary,
    elevation:       2,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.4,
    shadowRadius:    4,
  },
  pillBtnText:       { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  pillBtnTextActive: { color: '#fff', fontWeight: '700' },

  versionBadge:{
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  versionBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: colors.error|| '#D32F2F',
    borderRadius: 18,
    height: 54,
    marginTop: 30,
    borderWidth:1,
    borderColor:'#ff000035',
    elevation: 6,
    shadowColor: '#D32F2F',
    shadowOffset:{width:0, height:4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logoutText: {fontSize:15,fontWeight: '700', color:'#fff', letterSpacing: 0.3},
  footer: {textAlign: 'center',fontSize:12, color:colors.textMuted, marginTop: 20, marginBottom: 8, opacity:0.7},
  });

  export default SettingsScreen;

  