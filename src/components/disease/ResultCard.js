import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

// Severity → visual config
const SEVERITY_CONFIG = {
  Low:      { color: colors.success,  bg: '#E8F5E9', icon: 'checkmark-circle',   label: 'Low Risk' },
  Moderate: { color: colors.warning,  bg: '#FFF8E1', icon: 'warning',            label: 'Moderate Risk' },
  High:     { color: '#E65100',       bg: '#FBE9E7', icon: 'alert-circle',       label: 'High Risk' },
  Critical: { color: colors.error,    bg: '#FFEBEE', icon: 'skull',              label: 'Critical' },
};

// Confidence → label + bar color
const getConfidenceProps = (pct) => {
  if (pct >= 90) return { label: 'Very High', color: colors.success };
  if (pct >= 75) return { label: 'High',      color: colors.primaryLight };
  if (pct >= 55) return { label: 'Moderate',  color: colors.warning };
  return             { label: 'Low',       color: colors.error };
};

// ── Sub-components ───────────────────────────────────────────────────────────

const ConfidenceBar = ({ confidence }) => {
  const { label, color } = getConfidenceProps(confidence);
  return (
    <View style={confStyles.wrapper}>
      <View style={confStyles.labelRow}>
        <Text style={confStyles.labelText}>AI Confidence</Text>
        <Text style={[confStyles.pctText, { color }]}>{confidence.toFixed(1)}% — {label}</Text>
      </View>
      <View style={confStyles.track}>
        <View style={[confStyles.fill, { width: `${confidence}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const confStyles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  labelText: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted },
  pctText: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold },
  track: { height: 8, backgroundColor: colors.border, borderRadius: theme.borderRadius.round, overflow: 'hidden' },
  fill: { height: 8, borderRadius: theme.borderRadius.round },
});

const TreatmentStep = ({ step, index }) => (
  <View style={treatStyles.row}>
    <View style={treatStyles.indexBubble}>
      <Text style={treatStyles.indexText}>{index + 1}</Text>
    </View>
    <Text style={treatStyles.stepText}>{step}</Text>
  </View>
);

const treatStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm, alignItems: 'flex-start' },
  indexBubble: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1, flexShrink: 0,
  },
  indexText: { color: colors.white, fontSize: 11, fontWeight: theme.typography.fontWeight.bold },
  stepText: { fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },
});

// ── Main Component ───────────────────────────────────────────────────────────

/**
 * ResultCard
 * Props: result — { disease, scientificName, confidence, severity, affectedCrop,
 *                   symptoms, treatment[], prevention, organicOption, analyzedAt }
 */
const ResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState({ treatment: true, prevention: false, organic: false });

  if (!result) return null;

  const severityConfig = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.Moderate;
  const analyzedTime = result.analyzedAt
    ? new Date(result.analyzedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.card}>
      {/* ── Header: Disease Name + Severity ── */}
      <View style={[styles.cardHeader, { backgroundColor: severityConfig.bg }]}>
        <View style={styles.headerTop}>
          <View style={[styles.severityBadge, { backgroundColor: severityConfig.color }]}>
            <Ionicons name={severityConfig.icon} size={13} color={colors.white} />
            <Text style={styles.severityText}>{severityConfig.label}</Text>
          </View>
          {analyzedTime && (
            <Text style={styles.analyzedTime}>Analysed at {analyzedTime}</Text>
          )}
        </View>

        <Text style={[styles.diseaseName, { color: severityConfig.color }]}>{result.disease}</Text>
        <Text style={styles.scientificName}>{result.scientificName}</Text>

        {result.affectedCrop && (
          <View style={styles.cropBadge}>
            <Ionicons name="leaf-outline" size={13} color={colors.primary} />
            <Text style={styles.cropBadgeText}>{result.affectedCrop}</Text>
          </View>
        )}
      </View>

      {/* ── Body ── */}
      <View style={styles.cardBody}>
        {/* Confidence Bar */}
        <ConfidenceBar confidence={result.confidence} />

        {/* Symptoms */}
        <View style={styles.symptomsBlock}>
          <View style={styles.blockHeader}>
            <Ionicons name="eye-outline" size={16} color={colors.textMuted} />
            <Text style={styles.blockTitle}>Observed Symptoms</Text>
          </View>
          <Text style={styles.symptomsText}>{result.symptoms}</Text>
        </View>

        {/* Treatment (expandable) */}
        <TouchableOpacity style={styles.expandableHeader} onPress={() => toggle('treatment')} activeOpacity={0.7}>
          <View style={styles.expandableLeft}>
            <View style={[styles.expandIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="medkit" size={16} color={colors.success} />
            </View>
            <Text style={styles.expandTitle}>Recommended Treatment</Text>
          </View>
          <Ionicons name={expanded.treatment ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {expanded.treatment && (
          <View style={styles.expandableContent}>
            {result.treatment.map((step, i) => (
              <TreatmentStep key={i} step={step} index={i} />
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Prevention (expandable) */}
        <TouchableOpacity style={styles.expandableHeader} onPress={() => toggle('prevention')} activeOpacity={0.7}>
          <View style={styles.expandableLeft}>
            <View style={[styles.expandIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.info} />
            </View>
            <Text style={styles.expandTitle}>Prevention</Text>
          </View>
          <Ionicons name={expanded.prevention ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {expanded.prevention && (
          <View style={styles.expandableContent}>
            <Text style={styles.expandText}>{result.prevention}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Organic Option (expandable) */}
        {result.organicOption && (
          <>
            <TouchableOpacity style={styles.expandableHeader} onPress={() => toggle('organic')} activeOpacity={0.7}>
              <View style={styles.expandableLeft}>
                <View style={[styles.expandIcon, { backgroundColor: '#F1F8E9' }]}>
                  <Ionicons name="leaf" size={16} color={colors.primaryLight} />
                </View>
                <Text style={styles.expandTitle}>Organic / Natural Option</Text>
              </View>
              <Ionicons name={expanded.organic ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {expanded.organic && (
              <View style={styles.expandableContent}>
                <Text style={styles.expandText}>{result.organicOption}</Text>
              </View>
            )}
          </>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            AI diagnosis is indicative only. Consult an agricultural extension officer for severe infections.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: theme.borderRadius.xl, overflow: 'hidden', backgroundColor: colors.white, ...theme.shadows.lg, marginBottom: theme.spacing.md },

  cardHeader: { padding: theme.spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.round },
  severityText: { color: colors.white, fontSize: 11, fontWeight: theme.typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  analyzedTime: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted },

  diseaseName: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold },
  scientificName: { fontSize: theme.typography.fontSize.sm, fontStyle: 'italic', color: colors.textMuted, marginTop: 2, marginBottom: theme.spacing.sm },
  cropBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.round, borderWidth: 1, borderColor: colors.border },
  cropBadgeText: { fontSize: theme.typography.fontSize.xs, color: colors.primary, fontWeight: theme.typography.fontWeight.medium },

  cardBody: { padding: theme.spacing.lg },

  symptomsBlock: { marginBottom: theme.spacing.md },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  blockTitle: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  symptomsText: { fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  expandableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm },
  expandableLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  expandIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  expandTitle: { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  expandableContent: { paddingBottom: theme.spacing.sm, paddingLeft: 42 },
  expandText: { fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  divider: { height: 1, backgroundColor: colors.divider, marginVertical: theme.spacing.xs },

  disclaimer: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: theme.spacing.md, padding: theme.spacing.sm, backgroundColor: colors.offWhite, borderRadius: theme.borderRadius.md },
  disclaimerText: { fontSize: 11, color: colors.textMuted, flex: 1, lineHeight: 16 },
});

export default ResultCard;