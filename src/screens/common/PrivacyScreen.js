import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../constants/theme';

export default function PrivacyScreen({ navigation }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <ScreenContainer>
      <ScreenHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.date}>Effective Date: January 1, 2025</Text>

        <Section title="1. Information We Collect" colors={colors}>
          We collect information you provide when registering, such as your name,
          email, location, and farm details to personalize your experience.
        </Section>

        <Section title="2. How We Use Your Information" colors={colors}>
          Your data is used to provide weather alerts, crop advisories, and SMS
          notifications relevant to your farming region.
        </Section>

        <Section title="3. Data Sharing" colors={colors}>
          We do not sell your personal data. Information may be shared with
          agricultural authorities to improve advisory services.
        </Section>

        <Section title="4. Data Security" colors={colors}>
          We implement industry-standard security measures to protect your
          personal information from unauthorized access.
        </Section>

        <Section title="5. Contact Us" colors={colors}>
          For privacy concerns, contact us at support@agriconnect.com
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
