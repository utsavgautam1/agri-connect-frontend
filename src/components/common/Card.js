import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * Card variants:
 *  default  — plain white card
 *  elevated — white card with stronger shadow
 *  outlined — card with border, no shadow
 *  tinted   — light green background
 *  accent   — amber-tinted (for alerts / highlights)
 */
const VARIANT_STYLES = {
  default:  { backgroundColor: colors.white,    borderWidth: 0, ...theme.shadows.sm },
  elevated: { backgroundColor: colors.white,    borderWidth: 0, ...theme.shadows.lg },
  outlined: { backgroundColor: colors.white,    borderWidth: 1.5, borderColor: colors.border },
  tinted:   { backgroundColor: colors.offWhite, borderWidth: 0, ...theme.shadows.sm },
  accent:   { backgroundColor: '#FFFDE7',       borderWidth: 1, borderColor: '#FFE082', ...theme.shadows.sm },
};

const Card = ({
  title,
  subtitle,
  children,
  variant = 'default',
  iconName,           // Ionicons name shown in header
  iconColor,          // icon tint (defaults to primary)
  onPress,            // if supplied, card becomes touchable
  rightElement,       // arbitrary JSX for top-right corner
  noPadding = false,
  style,
  headerStyle,
  bodyStyle,
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const Wrapper      = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, variantStyle, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header row — only rendered if title, subtitle, or icon present */}
      {(title || iconName || rightElement) ? (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerLeft}>
            {iconName ? (
              <View style={[styles.iconBadge, { backgroundColor: (iconColor || colors.primary) + '1A' }]}>
                <Ionicons name={iconName} size={18} color={iconColor || colors.primary} />
              </View>
            ) : null}
            <View style={styles.titleBlock}>
              {title    ? <Text style={styles.title}>{title}</Text>       : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
          {rightElement ? <View>{rightElement}</View> : null}
        </View>
      ) : null}

      {/* Body */}
      {children ? (
        <View style={[noPadding ? null : styles.body, bodyStyle]}>
          {children}
        </View>
      ) : null}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingBottom: 0,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing.sm },
  iconBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  titleBlock: { flex: 1 },
  title:    { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  subtitle: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, marginTop: 1 },
  body:     { padding: theme.spacing.md },
});

export default Card;