import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../constants/theme';

/**
 * Consistent screen header with optional back button, title, subtitle, and right slot.
 */
const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  rightElement,
  showBorder = true,
  large = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.bg },
        showBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
        style,
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconBtn, { backgroundColor: colors.primary + '15' }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.titleBlock}>
          <Text style={[large ? styles.titleLarge : styles.title, { color: colors.textDark }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>

        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: { width: 40 },
  titleBlock: { flex: 1 },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  titleLarge: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  rightSlot: { minWidth: 40, alignItems: 'flex-end' },
});

export default ScreenHeader;
