import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useCalculator } from '@/context/CalculatorContext';
import CalculatorButton from './CalculatorButton';
import { Delete } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function ScientificKeypad() {
  const { theme } = useTheme();
  const {
    appendToExpression,
    clearExpression,
    deleteLastCharacter,
    calculateResult,
    toggleSign,
    applyParentheses,
    applyPercentage,
    applyInverse,
  } = useCalculator();

  const sciHeight = 44;
  const stdHeight = 56;

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Scientific Function Grid - 5 Columns */}
      <View style={styles.sciGrid}>
        {/* Row 1 */}
        <View style={styles.row}>
          <CalculatorButton
            label="sin"
            type="function"
            onPress={() => appendToExpression('sin(')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="cos"
            type="function"
            onPress={() => appendToExpression('cos(')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="tan"
            type="function"
            onPress={() => appendToExpression('tan(')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="π"
            type="function"
            onPress={() => appendToExpression('π')}
            flex={1}
            height={sciHeight}
            fontSize={17}
          />
          <CalculatorButton
            label="e"
            type="function"
            onPress={() => appendToExpression('e')}
            flex={1}
            height={sciHeight}
            fontSize={17}
          />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <CalculatorButton
            label="log"
            type="function"
            onPress={() => appendToExpression('log(')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="ln"
            type="function"
            onPress={() => appendToExpression('ln(')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="("
            type="function"
            onPress={() => appendToExpression('(')}
            flex={1}
            height={sciHeight}
            fontSize={16}
          />
          <CalculatorButton
            label=")"
            type="function"
            onPress={() => appendToExpression(')')}
            flex={1}
            height={sciHeight}
            fontSize={16}
          />
          <CalculatorButton
            label="xʸ"
            type="function"
            onPress={() => appendToExpression('^')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <CalculatorButton
            label="√"
            type="function"
            onPress={() => appendToExpression('sqrt(')}
            flex={1}
            height={sciHeight}
            fontSize={16}
          />
          <CalculatorButton
            label="x²"
            type="function"
            onPress={() => appendToExpression('^2')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="x³"
            type="function"
            onPress={() => appendToExpression('^3')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="1/x"
            type="function"
            onPress={applyInverse}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
          <CalculatorButton
            label="x!"
            type="function"
            onPress={() => appendToExpression('!')}
            flex={1}
            height={sciHeight}
            fontSize={15}
          />
        </View>
      </View>

      {/* Standard Arithmetic & Number Grid - 4 Columns */}
      <View style={styles.standardGrid}>
        {/* Row 4 */}
        <View style={styles.row}>
          <CalculatorButton
            label="AC"
            type="danger"
            onPress={clearExpression}
            flex={1}
            height={stdHeight}
            fontSize={18}
          />
          <CalculatorButton
            label="DEL"
            type="function"
            onPress={deleteLastCharacter}
            flex={1}
            height={stdHeight}
            icon={<Delete size={20} color={theme.functionTextColor} />}
          />
          <CalculatorButton
            label="±"
            type="function"
            onPress={toggleSign}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="÷"
            type="operator"
            onPress={() => appendToExpression('/')}
            flex={1}
            height={stdHeight}
            fontSize={24}
          />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <CalculatorButton
            label="7"
            type="number"
            onPress={() => appendToExpression('7')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="8"
            type="number"
            onPress={() => appendToExpression('8')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="9"
            type="number"
            onPress={() => appendToExpression('9')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="×"
            type="operator"
            onPress={() => appendToExpression('*')}
            flex={1}
            height={stdHeight}
            fontSize={24}
          />
        </View>

        {/* Row 6 */}
        <View style={styles.row}>
          <CalculatorButton
            label="4"
            type="number"
            onPress={() => appendToExpression('4')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="5"
            type="number"
            onPress={() => appendToExpression('5')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="6"
            type="number"
            onPress={() => appendToExpression('6')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="−"
            type="operator"
            onPress={() => appendToExpression('-')}
            flex={1}
            height={stdHeight}
            fontSize={24}
          />
        </View>

        {/* Row 7 */}
        <View style={styles.row}>
          <CalculatorButton
            label="1"
            type="number"
            onPress={() => appendToExpression('1')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="2"
            type="number"
            onPress={() => appendToExpression('2')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="3"
            type="number"
            onPress={() => appendToExpression('3')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="+"
            type="operator"
            onPress={() => appendToExpression('+')}
            flex={1}
            height={stdHeight}
            fontSize={24}
          />
        </View>

        {/* Row 8 */}
        <View style={styles.row}>
          <CalculatorButton
            label="%"
            type="function"
            onPress={applyPercentage}
            flex={1}
            height={stdHeight}
            fontSize={18}
          />
          <CalculatorButton
            label="0"
            type="number"
            onPress={() => appendToExpression('0')}
            flex={1}
            height={stdHeight}
            fontSize={20}
          />
          <CalculatorButton
            label="."
            type="number"
            onPress={() => appendToExpression('.')}
            flex={1}
            height={stdHeight}
            fontSize={24}
          />
          <CalculatorButton
            label="="
            type="equal"
            onPress={calculateResult}
            flex={1}
            height={stdHeight}
            fontSize={26}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  sciGrid: {
    marginBottom: 4,
  },
  standardGrid: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
});