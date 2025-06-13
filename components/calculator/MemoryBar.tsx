import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import CalculatorButton from './CalculatorButton';

export default function MemoryBar() {
  const { theme } = useTheme();
  const { 
    memory, 
    clearMemory, 
    addToMemory, 
    subtractFromMemory, 
    recallMemory 
  } = useCalculator();
  
  const hasMemory = memory !== '0';
  
  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <CalculatorButton
          label="MC"
          type="memory"
          onPress={clearMemory}
          size={60}
        />
        <CalculatorButton
          label="M+"
          type="memory"
          onPress={addToMemory}
          size={60}
        />
        <CalculatorButton
          label="M-"
          type="memory"
          onPress={subtractFromMemory}
          size={60}
        />
        <CalculatorButton
          label="MR"
          type="memory"
          onPress={recallMemory}
          size={60}
        />
      </View>
      
      {hasMemory && (
        <View style={[styles.memoryDisplay, { backgroundColor: theme.cardColor }]}>
          <Text style={[styles.memoryLabel, { color: theme.secondaryTextColor }]}>
            Memory:
          </Text>
          <Text style={[styles.memoryValue, { color: theme.textColor }]}>
            {memory}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memoryDisplay: {
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoryLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  memoryValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});