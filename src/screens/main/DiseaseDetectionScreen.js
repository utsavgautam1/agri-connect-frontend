import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerWidget from '../../components/disease/ImagePicker';
import ResultCard from '../../components/disease/ResultCard';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { analyzeCropDisease } from '../../api/diseaseApi';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../utils/i18n';
import theme from '../../constants/theme';

const CROP_TYPES = ['Maize', 'Tomato', 'Wheat', 'Beans', 'Potato', 'Coffee', 'Rice', 'Other'];

const DiseaseDetectionScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslate = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef(null);

  const animateResultIn = () => {
    Animated.parallel([
      Animated.timing(resultOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(resultTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    // Scroll to result after short delay
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const handleImageSelected = (asset) => {
    setSelectedImage(asset);
    setResult(null);
    setError(null);
    // Reset animation values for next result
    resultOpacity.setValue(0);
    resultTranslate.setValue(30);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please add a photo of the affected crop first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const diagnosis = await analyzeCropDisease(selectedImage, {
        cropType: selectedCrop,
      });
      setResult(diagnosis);
      animateResultIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Start New Scan',
      'Clear the current image and results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            setSelectedCrop(null);
            setResult(null);
            setError(null);
          },
        },
      ]
    );
  };

  const canAnalyze = selectedImage && !isAnalyzing;
  const styles = makeStyles(colors);

  return (
    <ScreenContainer>
      <ScreenHeader
        title={t('disease.title')}
        subtitle={t('disease.subtitle')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightElement={
          (selectedImage || result) ? (
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── How It Works Banner ── */}
        {!selectedImage && (
          <View style={styles.infoBanner}>
            <View style={styles.stepRow}>
              {[
                { icon: 'camera',  label: '1. Photograph affected leaf or stem' },
                { icon: 'search',  label: '2. AI analyses the disease pattern' },
                { icon: 'medkit',  label: '3. Get treatment recommendations' },
              ].map((step) => (
                <View key={step.label} style={styles.step}>
                  <View style={styles.stepIcon}>
                    <Ionicons name={step.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Crop Type Selector ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Crop Type (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CROP_TYPES.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[styles.chip, selectedCrop === crop && styles.chipSelected]}
                onPress={() => setSelectedCrop((prev) => (prev === crop ? null : crop))}
                disabled={isAnalyzing}
              >
                <Text style={[styles.chipText, selectedCrop === crop && styles.chipTextSelected]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Image Picker ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Crop Photo</Text>
          <ImagePickerWidget
            image={selectedImage}
            onImageSelected={handleImageSelected}
            disabled={isAnalyzing}
          />
        </View>

        {/* ── Error Banner ── */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <View style={styles.errorTextBlock}>
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
            <TouchableOpacity onPress={handleAnalyze} style={styles.retryIcon}>
              <Ionicons name="refresh" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        

        {/* ── Analyze Button ── */}
        <TouchableOpacity
          style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={!canAnalyze}
          activeOpacity={0.85}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingRow}>
              <ActivityIndicator color={colors.textLight} size="small" />
              <Text style={styles.analyzeBtnText}>{t('disease.analyzing')}</Text>
            </View>
          ) : (
            <View style={styles.analyzingRow}>
              <Ionicons name="scan-outline" size={20} color={colors.textLight} />
              <Text style={styles.analyzeBtnText}>
                {result ? 'Scan Again' : t('disease.result')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── AI Processing Indicator ── */}
        {isAnalyzing && (
          <View style={styles.processingCard}>
            <View style={styles.processingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
              ))}
            </View>
            <Text style={styles.processingTitle}>AI is analysing your crop</Text>
            <Text style={styles.processingSubtext}>
              Scanning for disease patterns, checking 200+ plant conditions…
            </Text>
          </View>
        )}

        {/* ── Result Card ── */}
        {result && (
          <Animated.View
            style={{ opacity: resultOpacity, transform: [{ translateY: resultTranslate }] }}
          >
            <ResultCard result={result} />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  scrollContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },

  resetBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.error + '20',
    justifyContent: 'center', alignItems: 'center',
  },

  infoBanner: {
    backgroundColor: colors.card, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md, marginBottom: theme.spacing.lg,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
    ...theme.shadows.sm,
  },
  stepRow: { gap: theme.spacing.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  stepIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  stepLabel: { fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, flex: 1 },

  section: { marginBottom: theme.spacing.md },
  sectionLabel: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark, marginBottom: theme.spacing.sm },

  chipScroll: { marginHorizontal: -theme.spacing.lg, paddingHorizontal: theme.spacing.lg },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, fontWeight: theme.typography.fontWeight.medium },
  chipTextSelected: { color: colors.textLight },

  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.error + '15', borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: colors.error + '40',
  },
  errorTextBlock: { flex: 1 },
  errorTitle: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.error },
  errorMessage: { fontSize: theme.typography.fontSize.xs, color: colors.error, marginTop: 2 },
  retryIcon: { padding: 2 },

  analyzeBtn: {
    backgroundColor: colors.primary, borderRadius: theme.borderRadius.md,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  analyzeBtnDisabled: { opacity: 0.45 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyzeBtnText: { color: colors.textLight, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },

  processingCard: {
    backgroundColor: colors.card, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, alignItems: 'center', gap: 8,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  processingDots: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  processingTitle: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  processingSubtext: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted, textAlign: 'center' },
});

export default DiseaseDetectionScreen;