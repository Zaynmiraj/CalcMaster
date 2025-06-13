import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import CalculatorButton from './CalculatorButton';

export default function Keypad() {
  const { theme } = useTheme();
  const { 
    appendToExpression, 
    clearExpression, 
    deleteLastCharacter, 
    calculateResult,
  } = useCalculator();
  const { width } = useWindowDimensions();
  
  // Calculate button size based on screen width
  const buttonSize = Platform.OS === 'web' 
    ? Math.min(width / 5 - 16, 70) 
    : width / 5 - 16;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CalculatorButton
          label="AC"
          type="function"
          onPress={clearExpression}
          size={buttonSize}
        />
        <CalculatorButton
          label="DEL"
          type="function"
          onPress={deleteLastCharacter}
          size={buttonSize}
        />
        <CalculatorButton
          label="%"
          type="operator"
          onPress={() => appendToExpression('%')}
          size={buttonSize}
        />
        <CalculatorButton
          label="÷"
          type="operator"
          onPress={() => appendToExpression('/')}
          size={buttonSize}
        />
      </View>
      
      <View style={styles.row}>
        <CalculatorButton
          label="7"
          type="number"
          onPress={() => appendToExpression('7')}
          size={buttonSize}
        />
        <CalculatorButton
          label="8"
          type="number"
          onPress={() => appendToExpression('8')}
          size={buttonSize}
        />
        <CalculatorButton
          label="9"
          type="number"
          onPress={() => appendToExpression('9')}
          size={buttonSize}
        />
        <CalculatorButton
          label="×"
          type="operator"
          onPress={() => appendToExpression('*')}
          size={buttonSize}
        />
      </View>
      
      <View style={styles.row}>
        <CalculatorButton
          label="4"
          type="number"
          onPress={() => appendToExpression('4')}
          size={buttonSize}
        />
        <CalculatorButton
          label="5"
          type="number"
          onPress={() => appendToExpression('5')}
          size={buttonSize}
        />
        <CalculatorButton
          label="6"
          type="number"
          onPress={() => appendToExpression('6')}
          size={buttonSize}
        />
        <CalculatorButton
          label="-"
          type="operator"
          onPress={() => appendToExpression('-')}
          size={buttonSize}
        />
      </View>
      
      <View style={styles.row}>
        <CalculatorButton
          label="1"
          type="number"
          onPress={() => appendToExpression('1')}
          size={buttonSize}
        />
        <CalculatorButton
          label="2"
          type="number"
          onPress={() => appendToExpression('2')}
          size={buttonSize}
        />
        <CalculatorButton
          label="3"
          type="number"
          onPress={() => appendToExpression('3')}
          size={buttonSize}
        />
        <CalculatorButton
          label="+"
          type="operator"
          onPress={() => appendToExpression('+')}
          size={buttonSize}
        />
      </View>
      
      <View style={styles.row}>
        <CalculatorButton
          label="+/-"
          type="function"
          onPress={() => appendToExpression('*-1')}
          size={buttonSize}
        />
        <CalculatorButton
          label="0"
          type="number"
          onPress={() => appendToExpression('0')}
          size={buttonSize}
        />
        <CalculatorButton
          label="."
          type="number"
          onPress={() => appendToExpression('.')}
          size={buttonSize}
        />
        <CalculatorButton
          label="="
          type="equal"
          onPress={calculateResult}
          size={buttonSize}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});