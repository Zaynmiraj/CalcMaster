import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator, History, Settings } from 'lucide-react-native';
import { HistoryProvider } from '@/context/HistoryContext';
import { CalculatorProvider } from '@/context/CalculatorContext';
import { CalcNoteProvider } from '@/context/CalcNoteContext';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12);

  return (
    <HistoryProvider>
      <CalculatorProvider>
        <CalcNoteProvider>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: theme.accentColor,
              tabBarInactiveTintColor: theme.secondaryTextColor,
              headerShown: false,
              tabBarShowLabel: true,
              tabBarHideOnKeyboard: true,
              tabBarStyle: {
                position: 'absolute',
                bottom: bottomOffset,
                left: 18,
                right: 18,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.tabBarBackground,
                borderWidth: 1,
                borderColor: theme.tabBarBorder,
                elevation: 10,
                paddingBottom: 8,
                paddingTop: 8,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                  },
                  android: {
                    elevation: 10,
                  },
                }),
              },
              tabBarLabelStyle: {
                fontFamily: 'Roboto-Bold',
                fontSize: 10,
                letterSpacing: 0.4,
                marginTop: 2,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: t.navCalcNote,
                tabBarIcon: ({ color, focused }) => (
                  <View style={focused ? [styles.activeTabGlow, { backgroundColor: theme.pillActiveBg }] : styles.inactiveTab}>
                    <Calculator size={focused ? 20 : 19} color={color} strokeWidth={focused ? 2.5 : 2} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="history"
              options={{
                title: t.navLedger,
                tabBarIcon: ({ color, focused }) => (
                  <View style={focused ? [styles.activeTabGlow, { backgroundColor: theme.pillActiveBg }] : styles.inactiveTab}>
                    <History size={focused ? 20 : 19} color={color} strokeWidth={focused ? 2.5 : 2} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: t.navSettings,
                tabBarIcon: ({ color, focused }) => (
                  <View style={focused ? [styles.activeTabGlow, { backgroundColor: theme.pillActiveBg }] : styles.inactiveTab}>
                    <Settings size={focused ? 20 : 19} color={color} strokeWidth={focused ? 2.5 : 2} />
                  </View>
                ),
              }}
            />
          </Tabs>
        </CalcNoteProvider>
      </CalculatorProvider>
    </HistoryProvider>
  );
}

const styles = StyleSheet.create({
  activeTabGlow: {
    width: 38,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    width: 38,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
