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
import { authStart, authSuccess, authFailure, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import { loginApi } from '../../api/authApi';
import { saveToken, saveUser } from '../../services/storage';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

const LoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }) => {
    dispatch(authStart());
    try {
      const { user, token } = await loginApi({ email, password });
      await saveToken(token);
      await saveUser(user);

      dispatch(authSuccess({ user, token }));
    } catch (error) {
      dispatch(authFailure(error.message));
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={40} color={colors.white} />
          </View>
          <Text style={styles.appName}>Agri-Connect</Text>
          <Text style={styles.tagline}>Smart farming at your fingertips</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* API Error Banner */}
          {authError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          ) : null}

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="farmer@example.com"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register as Farmer</Text>
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
  container: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },

  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  logoContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  appName: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: { fontSize: theme.typography.fontSize.sm, color: colors.primaryLighter, marginTop: 4 },

  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: colors.textDark,
  },
  subtitle: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted, marginBottom: theme.spacing.lg, marginTop: 4 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFEBEE', borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm, marginBottom: theme.spacing.md,
  },
  errorBannerText: { color: colors.error, fontSize: theme.typography.fontSize.sm, flex: 1 },

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

  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: theme.borderRadius.md,
    height: 52, marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: colors.white, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg },
  registerPrompt: { color: colors.textMuted, fontSize: theme.typography.fontSize.sm },
  registerLink: { color: colors.primary, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold },
});

export default LoginScreen;