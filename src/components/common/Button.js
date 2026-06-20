import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * Button component
 *
 * Props:
 *  title       – string
 *  onPress     – function
 *  variant     – 'primary' | 'secondary' | 'outline' | 'danger'  (default: 'primary')
 *  size        – 'sm' | 'md' | 'lg'                              (default: 'md')
 *  iconName    – Ionicons icon name (optional, shown left of title)
 *  isLoading   – bool
 *  disabled    – bool
 *  style       – extra ViewStyle
 *  textStyle   – extra TextStyle
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  iconName,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <View style={styles.inner}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              color={variant === 'outline' ? colors.primary : colors.white}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { marginRight: 6 },

  // ── Variants ──
  variant_primary:   { backgroundColor: colors.primary },
  variant_secondary: { backgroundColor: colors.secondary || '#558B2F' },
  variant_outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  variant_danger:    { backgroundColor: colors.error || '#C62828' },

  // ── Sizes ──
  size_sm: { paddingHorizontal: 14, paddingVertical: 8 },
  size_md: { paddingHorizontal: 20, paddingVertical: 12 },
  size_lg: { paddingHorizontal: 28, paddingVertical: 16 },

  // ── Disabled ──
  disabled: { opacity: 0.5 },

  // ── Text ──
  text: { fontWeight: theme.typography.fontWeight.semiBold },
  text_primary:   { color: colors.white },
  text_secondary: { color: colors.white },
  text_outline:   { color: colors.primary },
  text_danger:    { color: colors.white },

  textSize_sm: { fontSize: theme.typography.fontSize.xs },
  textSize_md: { fontSize: theme.typography.fontSize.sm },
  textSize_lg: { fontSize: theme.typography.fontSize.md },
});

export default Button;