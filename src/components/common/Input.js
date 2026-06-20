import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

/**
 * Reusable Input field with:
 *  - Left icon
 *  - Password toggle (auto-detected via secureTextEntry)
 *  - Error / helper text
 *  - Floating label feel via separate label prop
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  iconName,             // Ionicons name for left icon
  secureTextEntry,      // triggers show/hide password toggle
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  returnKeyType,
  onSubmitEditing,
  error,                // error string shown below input
  helperText,           // helper string shown below input when no error
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
}) => {
  const [showText, setShowText] = useState(false);

  const isPassword = !!secureTextEntry;
  const hideText   = isPassword && !showText;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Input row */}
      <View style={[
        styles.inputRow,
        error  && styles.inputRowError,
        !editable && styles.inputRowDisabled,
        multiline && { height: 'auto', minHeight: 48, paddingVertical: theme.spacing.sm, alignItems: 'flex-start' },
      ]}>
        {/* Left icon */}
        {iconName ? (
          <Ionicons
            name={iconName}
            size={18}
            color={error ? colors.error : colors.textMuted}
            style={styles.iconLeft}
          />
        ) : null}

        <TextInput
          style={[styles.input, inputStyle, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={hideText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />

        {/* Password toggle */}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowText((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showText ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error / helper text */}
      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: colors.textDark,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.offWhite,
    paddingHorizontal: theme.spacing.sm,
    height: 50,
  },
  inputRowError:    { borderColor: colors.error },
  inputRowDisabled: { opacity: 0.5, backgroundColor: colors.divider },

  iconLeft: { marginRight: 8 },

  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: colors.textDark,
    paddingVertical: 0, // fixes Android vertical offset
  },
  multilineInput: { textAlignVertical: 'top' },

  eyeBtn: { padding: 4 },

  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText:  { fontSize: theme.typography.fontSize.xs, color: colors.error },
  helperText: { fontSize: theme.typography.fontSize.xs, color: colors.textMuted, marginTop: 4 },
});

export default Input;