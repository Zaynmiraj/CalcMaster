import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Calculator, History, Settings, Info } from 'lucide-react-native';
import { HistoryProvider } from '@/context/HistoryContext';
import { CalculatorProvider } from '@/context/CalculatorContext';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';
  const { theme } = useTheme();

  console.log(theme.backgroundColor);

  return (
    <HistoryProvider>
      <StatusBar
        style={theme.backgroundColor == '#F2F2F7' ? 'dark' : 'light'}
      />
      <CalculatorProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#007AFF',
            tabBarInactiveTintColor:
              colorScheme === 'dark' ? '#8E8E93' : '#8E8E93',
            tabBarStyle: {
              backgroundColor:
                theme.backgroundColor === '#F2F2F7' ? '#F2F2F7' : '#1C1C1E',
              borderTopColor: colorScheme === 'dark' ? '#38383A' : '#C6C6C8',
            },
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
            },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Calculator',
              tabBarIcon: ({ color, size }) => (
                <Calculator size={size} color={color} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <History size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Settings size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="developer"
            options={{
              headerShown: false,
              title: 'Developer',
              tabBarIcon: ({ color, size }) => (
                <Info size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </CalculatorProvider>
    </HistoryProvider>
  );
}
