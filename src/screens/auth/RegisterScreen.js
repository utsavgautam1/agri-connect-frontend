import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  authStart, authSuccess, authFailure,
  selectAuthLoading, selectAuthError,
} from '../../store/slices/authSlice';
import { registerApi } from '../../api/authApi';
import { saveToken, saveUser } from '../../services/storage';
import colors from '../../constants/colors';
import theme from '../../constants/theme';


const FIELDS = [
  {
    name: 'fullName',
    label: 'Full Name',
    placeholder: 'Your full name',
    icon: 'person-outline',
    keyboardType: 'default',
    rules: { required: 'Full name is required', minLength: { value: 2, message: 'Name is too short' } },
  },
  {
    name: 'email',
    label: 'Email Address',
    placeholder: 'farmer@example.com',
    icon: 'mail-outline',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    rules: {
      required: 'Email is required',
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
    },
  },
  {
    name: 'phone',
    label: 'Phone Number',
    placeholder: '+977 98X-XXXXXXX',
    icon: 'call-outline',
    keyboardType: 'phone-pad',
    rules: {
      required: 'Phone number is required',
      pattern: { value: /^\+?[\d\s\-]{9,15}$/, message: 'Enter a valid phone number' },
    },
  },
  {
    name: 'farmLocation',
    label: 'Farm Location',
    placeholder: 'Village, District',
    icon: 'location-outline',
    keyboardType: 'default',
    rules: { required: 'Farm location is required' },
  },
];

const RegisterScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: '', email: '', phone: '', farmLocation: '', password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data; // strip confirmPassword before sending
    dispatch(authStart());
    try {
      const { user, token } = await registerApi(payload);
      await saveToken(token);
      await saveUser(user);
      dispatch(authSuccess({ user, token }));
    } catch (error) {
      dispatch(authFailure(error.message));
    }
  };

  const renderField = ({ name, label, placeholder, icon, keyboardType, autoCapitalize, rules }) => (
    <View style={styles.fieldGroup} key={name}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[styles.inputWrapper, errors[name] && styles.inputError]}>
            <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize || 'words'}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </View>
        )}
      />
      {errors[name] && <Text style={styles.fieldError}>{errors[name].message}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.flex}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of smart farmers</Text>
          </View>
        </View>

        {/* Step Badge */}
        <View style={styles.stepBadge}>
          <Ionicons name="leaf" size={14} color={colors.primary} />
          <Text style={styles.stepText}>Farmer Registration</Text>
        </View>

        {/* Error Banner */}
        {authError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        {/* Dynamic Fields */}
        <View style={styles.card}>
          {FIELDS.map(renderField)}

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }, // ✅ matches backend minlength
                pattern: {
                  value: /(?=.*[0-9])(?=.*[a-zA-Z])/,
                  message: 'Must include letters and numbers',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min 6 chars with numbers"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirm}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.registerBtn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.registerBtnText}>Create My Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primaryDark },
  container: { flexGrow: 1, padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerText: { flex: 1 },
  title: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold, color: colors.white },
  subtitle: { fontSize: theme.typography.fontSize.sm, color: colors.primaryLighter, marginTop: 2 },

  stepBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.offWhite,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: theme.spacing.md,
  },
  stepText: { fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semiBold, color: colors.primary },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFEBEE', borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm, marginBottom: theme.spacing.md,
  },
  errorBannerText: { color: colors.error, fontSize: theme.typography.fontSize.sm, flex: 1 },

  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },

  fieldGroup: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.offWhite,
    paddingHorizontal: theme.spacing.sm,
    height: 50,
  },
  inputError: { borderColor: colors.error },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: theme.typography.fontSize.md, color: colors.textDark },
  eyeBtn: { padding: 4 },
  fieldError: { fontSize: theme.typography.fontSize.xs, color: colors.error, marginTop: 4 },

  registerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: theme.borderRadius.md,
    height: 52, marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  btnDisabled: { opacity: 0.7 },
  registerBtnText: { color: colors.white, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg },
  loginPrompt: { color: colors.textMuted, fontSize: theme.typography.fontSize.sm },
  loginLink: { color: colors.primary, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold },
});

export default RegisterScreen;