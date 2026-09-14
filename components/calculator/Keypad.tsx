import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCalculator } from '@/context/CalculatorContext';
import CalculatorButton from './CalculatorButton';
import { Delete } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function Keypad() {
  const { theme } = useTheme();
  const {
    appendToExpression,
    clearExpression,
    deleteLastCharacter,
    calculateResult,
    toggleSign,
    applyPercentage,
  } = useCalculator();

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <CalculatorButton
          label="AC"
          type="danger"
          onPress={clearExpression}
          flex={1}
          fontSize={20}
        />
        <CalculatorButton
          label="DEL"
          type="function"
          onPress={deleteLastCharacter}
          flex={1}
          icon={<Delete size={22} color={theme.functionTextColor} />}
        />
        <CalculatorButton
          label="±"
          type="function"
          onPress={toggleSign}
          flex={1}
          fontSize={22}
        />
        <CalculatorButton
          label="÷"
          type="operator"
          onPress={() => appendToExpression('/')}
          flex={1}
          fontSize={26}
        />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <CalculatorButton
          label="7"
          type="number"
          onPress={() => appendToExpression('7')}
          flex={1}
        />
        <CalculatorButton
          label="8"
          type="number"
          onPress={() => appendToExpression('8')}
          flex={1}
        />
        <CalculatorButton
          label="9"
          type="number"
          onPress={() => appendToExpression('9')}
          flex={1}
        />
        <CalculatorButton
          label="×"
          type="operator"
          onPress={() => appendToExpression('*')}
          flex={1}
          fontSize={26}
        />
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        <CalculatorButton
          label="4"
          type="number"
          onPress={() => appendToExpression('4')}
          flex={1}
        />
        <CalculatorButton
          label="5"
          type="number"
          onPress={() => appendToExpression('5')}
          flex={1}
        />
        <CalculatorButton
          label="6"
          type="number"
          onPress={() => appendToExpression('6')}
          flex={1}
        />
        <CalculatorButton
          label="−"
          type="operator"
          onPress={() => appendToExpression('-')}
          flex={1}
          fontSize={26}
        />
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        <CalculatorButton
          label="1"
          type="number"
          onPress={() => appendToExpression('1')}
          flex={1}
        />
        <CalculatorButton
          label="2"
          type="number"
          onPress={() => appendToExpression('2')}
          flex={1}
        />
        <CalculatorButton
          label="3"
          type="number"
          onPress={() => appendToExpression('3')}
          flex={1}
        />
        <CalculatorButton
          label="+"
          type="operator"
          onPress={() => appendToExpression('+')}
          flex={1}
          fontSize={26}
        />
      </View>

      {/* Row 5 */}
      <View style={styles.row}>
        <CalculatorButton
          label="%"
          type="function"
          onPress={applyPercentage}
          flex={1}
          fontSize={20}
        />
        <CalculatorButton
          label="0"
          type="number"
          onPress={() => appendToExpression('0')}
          flex={1}
        />
        <CalculatorButton
          label="."
          type="number"
          onPress={() => appendToExpression('.')}
          flex={1}
          fontSize={26}
        />
        <CalculatorButton
          label="="
          type="equal"
          onPress={calculateResult}
          flex={1}
          fontSize={28}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
});