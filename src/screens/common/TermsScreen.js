import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../constants/theme';

export default function TermsScreen({ navigation }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <ScreenContainer>
      <ScreenHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.date}>Effective Date: January 1, 2025</Text>

        <Section title="1. Acceptance of Terms" colors={colors}>
          By using Agri-Connect, you agree to these terms. If you do not agree,
          please discontinue use of the application.
        </Section>

        <Section title="2. Use of the App" colors={colors}>
          Agri-Connect is intended for farmers and agricultural professionals.
          You agree to use this app only for lawful farming-related purposes.
        </Section>

        <Section title="3. Advisory Disclaimer" colors={colors}>
          Crop and weather advisories are for informational purposes only.
          Agri-Connect is not liable for farming decisions made based on app data.
        </Section>

        <Section title="4. Account Responsibility" colors={colors}>
          You are responsible for maintaining the confidentiality of your account
          credentials and all activities under your account.
        </Section>

        <Section title="5. Modifications" colors={colors}>
          We reserve the right to modify these terms at any time. Continued use
          of the app after changes constitutes acceptance of the new terms.
        </Section>

        <Section title="6. Contact Us" colors={colors}>
          For questions about these terms, contact us at support@agriconnect.com
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

const Section = ({ title, children, colors }) => (
  <View style={{ marginBottom: theme.spacing.md }}>
    <Text style={{ fontSize: theme.typography.fontSize.md, fontWeight: '700', color: colors.textDark, marginBottom: 6 }}>
      {title}
    </Text>
    <Text style={{ fontSize: theme.typography.fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
      {children}
    </Text>
  </View>
);

const makeStyles = (colors) => StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  date: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
});
