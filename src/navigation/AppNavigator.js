import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen         from '../screens/main/HomeScreen';
import MarketPricesScreen from '../screens/main/MarketPricesScreen';
import SoilAnalysisScreen from '../screens/main/SoilAnalysisScreen';
import SMSScreen          from '../screens/main/SMSScreen';
import SettingsScreen     from '../screens/main/SettingsScreen';
import WeatherScreen      from '../screens/main/WeatherScreen';
import DiseaseScreen      from '../screens/main/DiseaseDetectionScreen';
import AdvisoryScreen     from '../screens/main/AdvisoryScreen';
import PrivacyScreen      from '../screens/common/PrivacyScreen';
import TermsScreen        from '../screens/common/TermsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:    focused ? 'home'         : 'home-outline',
            Market:  focused ? 'bar-chart'    : 'bar-chart-outline',
            Weather: focused ? 'partly-sunny' : 'partly-sunny-outline',
            Disease: focused ? 'leaf'         : 'leaf-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] || (focused ? 'ellipse' : 'ellipse-outline')}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Market"  component={MarketPricesScreen} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Disease" component={DiseaseScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="SoilAnalysis" component={SoilAnalysisScreen} />
      <Stack.Screen name="SMS" component={SMSScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Disease" component={DiseaseScreen} />
      <Stack.Screen name="Advisory" component={AdvisoryScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}
