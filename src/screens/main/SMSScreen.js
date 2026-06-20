/**
 * SMSScreen.js — Real Expo Push Notifications + SMS UI
 * Place at: src/screens/main/SMSScreen.js
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { selectIsOnline, selectNotifications, updateNotificationSettings } from '../../store/slices/appSlice';
import { selectUser } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../utils/i18n';
import * as NS from '../../services/notifications';

const ALERT_TYPES = [
  { key:'weather',  icon:'partly-sunny', color:'#0288D1' },
  { key:'market',   icon:'bar-chart',    color:'#E65100' },
  { key:'disease',  icon:'bug',          color:'#2E7D32' },
  { key:'advisory', icon:'bulb',         color:'#6A1B9A' },
];

const MOCK_HISTORY = [
  { id:'1', message:'WEATHER ALERT: Heavy rains expected. Secure harvested produce.', sentAt: Date.now()-86400000, type:'weather', status:'delivered' },
  { id:'2', message:'MARKET UPDATE: Tomato prices at Kalimati rose 22% today (NPR 55/kg).', sentAt: Date.now()-86400000*3, type:'market', status:'delivered' },
  { id:'3', message:'ADVISORY: Optimal planting window for maize opens in 5 days.', sentAt: Date.now()-86400000*7, type:'advisory', status:'delivered' },
];

const STATUS_CFG = {
  delivered: { color:'#388E3C', icon:'checkmark-circle' },
  failed:    { color:'#D32F2F', icon:'close-circle' },
  pending:   { color:'#F57C00', icon:'time' },
};

const SMSScreen = ({ navigation }) => {
  const dispatch  = useDispatch();
  const { colors: c } = useTheme();
  const { t } = useTranslation();
  const isOnline  = useSelector(selectIsOnline);
  const notifs    = useSelector(selectNotifications);
  const user      = useSelector(selectUser);

  const [phone,     setPhone]     = useState(user?.phone || '');
  const [message,   setMessage]   = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);
  const [history,   setHistory]   = useState(MOCK_HISTORY);
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    NS.registerForPushNotifications()
      .then(setPushToken)
      .catch(() => {});
  }, []);

  const toggleNotif = async (key) => {
    const next = { ...notifs };
    if (key === 'enabled' && notifs.enabled) {
      next.enabled = false; next.weather = false; next.market = false; next.advisory = false;
    } else { next[key] = !notifs[key]; }
    dispatch(updateNotificationSettings(next));

    // Send test push notification when enabling a type
    if (!notifs[key] && key !== 'enabled') {
      await NS.sendLocalNotification({
        title: `✅ ${key.charAt(0).toUpperCase() + key.slice(1)} Alerts Enabled`,
        body: `You will now receive ${key} push notifications.`,
        channelId: key === 'weather' ? 'weather' : key === 'market' ? 'market' : 'agri-alerts',
      }).catch(() => {});
    }
  };

  const handleSend = async () => {
    if (!phone.trim())   { setError(t('sms.enterPhone'));   return; }
    if (!message.trim()) { setError(t('sms.enterMessage')); return; }
    setError(null);
    setIsSending(true);
    try {
      if (!isOnline) {
        Alert.alert(t('sms.queued'), t('sms.queuedMsg'));
      } else {
        // Send as local push notification (real SMS would need Sparrow SMS API)
        await NS.sendLocalNotification({
          title: '📱 SMS Alert Sent',
          body: message.trim(),
          data: { type: 'custom', phone },
        });
        setHistory((prev) => [{
          id: Date.now().toString(),
          message: message.trim(),
          sentAt: Date.now(),
          type: 'custom',
          status: 'delivered',
        }, ...prev]);
        setSuccess(true);
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const testNotification = async (type) => {
    const msgs = {
      weather:  { title:'🌤 Weather Alert', body:'Heavy rainfall expected in your area tomorrow. Secure harvested produce.' },
      market:   { title:'📈 Market Update', body:'Tomato prices rose 18% today at Kalimati (NPR 58/kg).' },
      disease:  { title:'🌿 Disease Alert', body:'High risk of Late Blight in tomatoes. Inspect crops immediately.' },
      advisory: { title:'🌱 Farming Tip', body:'Overcast conditions today are ideal for transplanting seedlings.' },
    };
    const m = msgs[type];
    await NS.sendLocalNotification({ title: m.title, body: m.body, data: { type } });
    Alert.alert('Test Sent!', `A ${type} notification was sent to your device.`);
  };

  const fmt = (ts) => new Date(ts).toLocaleDateString('en-NP', { weekday:'short', day:'2-digit', month:'short' });

  return (
    <ScreenContainer>
      <ScreenHeader
        title={t('sms.title')}
        subtitle={t('sms.subtitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Push token info */}
        {pushToken && (
          <View style={[styles.tokenBanner, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="checkmark-circle" size={16} color={c.success} />
            <Text style={[styles.tokenText, { color: c.textMuted }]}>Push notifications active</Text>
          </View>
        )}

        {/* Error / Success banners */}
        {error   && <View style={[styles.banner, { backgroundColor:'#FFEBEE', borderLeftColor: c.error }]}><Ionicons name="alert-circle" size={18} color={c.error} style={{marginRight:8}} /><Text style={{ color: c.error, flex:1, fontSize:13 }}>{error}</Text><TouchableOpacity onPress={() => setError(null)}><Ionicons name="close" size={16} color={c.error} /></TouchableOpacity></View>}
        {success && <View style={[styles.banner, { backgroundColor:'#E8F5E9', borderLeftColor: c.success }]}><Ionicons name="checkmark-circle" size={18} color={c.success} style={{marginRight:8}} /><Text style={{ color: c.success, fontSize:13 }}>{t('sms.sentSuccess')}</Text></View>}

        {/* ── Compose Card ── */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHeader, { borderBottomColor: c.divider }]}>
            <View style={[styles.iconBox, { backgroundColor: c.primary + '22' }]}>
              <Ionicons name="create" size={16} color={c.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: c.textDark }]}>{t('sms.sendCustom')}</Text>
          </View>
          <View style={{ padding:14 }}>
            {/* Phone */}
            <Text style={[styles.label, { color: c.textDark }]}>{t('sms.recipient')}</Text>
            <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.input }]}>
              <Ionicons name="call-outline" size={18} color={c.textMuted} style={{ marginRight:8 }} />
              <TextInput
                style={[styles.input, { color: c.textDark }]}
                placeholder="+977 98X-XXXXXXX" placeholderTextColor={c.textMuted}
                keyboardType="phone-pad" value={phone} onChangeText={setPhone}
              />
            </View>
            {/* Message */}
            <View style={[styles.labelRow, { marginTop:12 }]}>
              <Text style={[styles.label, { color: c.textDark }]}>{t('sms.message')}</Text>
              <Text style={[styles.charCount, { color: c.textMuted }]}>{message.length}/160</Text>
            </View>
            <TextInput
              style={[styles.messageInput, { borderColor: c.border, backgroundColor: c.input, color: c.textDark }]}
              placeholder="Type your farm alert message..." placeholderTextColor={c.textMuted}
              multiline numberOfLines={4} maxLength={160}
              value={message} onChangeText={setMessage} textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: (!phone.trim() || !message.trim()) ? c.textMuted : c.primary }]}
              onPress={handleSend} disabled={isSending || !phone.trim() || !message.trim()}
              activeOpacity={0.85}
            >
              {isSending
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Text style={styles.sendBtnText}>{t('sms.send')}</Text><Ionicons name="send" size={16} color="#fff" style={{ marginLeft:8 }} /></>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Subscriptions ── */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.cardHeader, { borderBottomColor: c.divider }]}>
            <View style={[styles.iconBox, { backgroundColor: '#E65100' + '22' }]}>
              <Ionicons name="notifications" size={16} color="#E65100" />
            </View>
            <Text style={[styles.cardTitle, { color: c.textDark }]}>{t('sms.subscriptions')}</Text>
          </View>
          <View style={{ padding:14 }}>
            <Text style={[styles.subNote, { color: c.textMuted }]}>{t('sms.subscriptionNote')}</Text>
            {ALERT_TYPES.map(({ key, icon, color }) => (
              <View key={key} style={[styles.subRow, { borderTopColor: c.divider }]}>
                <View style={[styles.subIcon, { backgroundColor: color + '22' }]}>
                  <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text style={[styles.subLabel, { color: c.textDark }]}>{t(`settings.${key === 'disease' ? 'advisoryUpdates' : key === 'weather' ? 'weatherAlerts' : key === 'market' ? 'marketPrices' : 'advisoryUpdates'}`)}</Text>
                <TouchableOpacity style={styles.testBtn} onPress={() => testNotification(key)}>
                  <Text style={[styles.testBtnText, { color: c.primary }]}>Test</Text>
                </TouchableOpacity>
                <Switch
                  value={!!notifs[key === 'disease' ? 'advisory' : key]}
                  onValueChange={() => toggleNotif(key === 'disease' ? 'advisory' : key)}
                  trackColor={{ false: c.border, true: c.primaryLight }}
                  thumbColor={notifs[key] ? c.primary : '#fff'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── History ── */}
        <Text style={[styles.sectionTitle, { color: c.textDark }]}>{t('sms.recentMessages')}</Text>
        {history.length === 0
          ? <View style={styles.empty}><Ionicons name="chatbox-outline" size={40} color={c.textMuted} /><Text style={{ color: c.textMuted, marginTop:8 }}>{t('sms.noMessages')}</Text></View>
          : history.map((item) => {
              const s = STATUS_CFG[item.status] || STATUS_CFG.pending;
              return (
                <View key={item.id} style={[styles.historyItem, { backgroundColor: c.card }]}>
                  <View style={styles.historyTop}>
                    <Text style={[styles.historyDate, { color: c.textMuted }]}>{fmt(item.sentAt)}</Text>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                      <Ionicons name={s.icon} size={13} color={s.color} />
                      <Text style={{ fontSize:11, fontWeight:'700', color: s.color, textTransform:'capitalize' }}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.historyMsg, { color: c.textSecondary }]}>{item.message}</Text>
                </View>
              );
            })
        }
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  tokenBanner: { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1, borderRadius:10, padding:10, marginBottom:12 },
  tokenText: { fontSize:12 },
  banner: { flexDirection:'row', alignItems:'center', borderLeftWidth:4, borderRadius:10, padding:12, marginBottom:12 },
  card: { borderRadius:16, borderWidth:1, marginBottom:14, overflow:'hidden' },
  cardHeader: { flexDirection:'row', alignItems:'center', gap:10, padding:14, borderBottomWidth:1 },
  iconBox: { width:30, height:30, borderRadius:8, justifyContent:'center', alignItems:'center' },
  cardTitle: { fontSize:15, fontWeight:'700' },
  label: { fontSize:13, fontWeight:'600', marginBottom:6 },
  labelRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  charCount: { fontSize:12 },
  inputRow: { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderRadius:10, paddingHorizontal:12, height:50 },
  input: { flex:1, fontSize:15 },
  messageInput: { borderWidth:1.5, borderRadius:10, padding:12, fontSize:13, minHeight:100 },
  sendBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:12, height:50, marginTop:14 },
  sendBtnText: { fontSize:15, fontWeight:'700', color:'#fff' },
  subNote: { fontSize:13, marginBottom:12 },
  subRow: { flexDirection:'row', alignItems:'center', paddingVertical:10, borderTopWidth:1 },
  subIcon: { width:32, height:32, borderRadius:16, justifyContent:'center', alignItems:'center', marginRight:10 },
  subLabel: { flex:1, fontSize:14, fontWeight:'500' },
  testBtn: { paddingHorizontal:10, paddingVertical:4, marginRight:8 },
  testBtnText: { fontSize:12, fontWeight:'700' },
  sectionTitle: { fontSize:18, fontWeight:'700', marginBottom:10, marginTop:4 },
  historyItem: { borderRadius:14, padding:14, marginBottom:10 },
  historyTop: { flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  historyDate: { fontSize:12 },
  historyMsg: { fontSize:13, lineHeight:18 },
  empty: { alignItems:'center', paddingVertical:40 },
});

export default SMSScreen;