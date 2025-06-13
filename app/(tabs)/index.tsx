import { useEffect } from 'react';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useHistory } from '@/context/HistoryContext';
import Display from '@/components/calculator/Display';
import Keypad from '@/components/calculator/Keypad';
import ScientificKeypad from '@/components/calculator/ScientificKeypad';
import MemoryBar from '@/components/calculator/MemoryBar';
import { StatusBar } from 'expo-status-bar';

export default function CalculatorScreen() {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const { isScientificMode, trackSessionTime, lastActiveTime, setLastActiveTime } = useCalculator();
  const { addToHistory } = useHistory();

  // Track usage time
  useEffect(() => {
    const now = Date.now();
    setLastActiveTime(now);
    
    const interval = setInterval(() => {
      trackSessionTime();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: theme.backgroundColor }
    ]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.calculatorContainer}>
        <Display />
        <MemoryBar />
        <View style={styles.keypadContainer}>
          {isScientificMode ? <ScientificKeypad /> : <Keypad />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calculatorContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  keypadContainer: {
    flex: 1,
    marginTop: 8,
  }
});