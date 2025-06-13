import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

type ButtonType = 'number' | 'operator' | 'function' | 'equal' | 'memory';

type CalculatorButtonProps = {
  label: string;
  type: ButtonType;
  onPress: () => void;
  size?: number;
};

export default function CalculatorButton({ label, type, onPress, size = 70 }: CalculatorButtonProps) {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'number':
        return theme.numberColor;
      case 'operator':
        return theme.operatorColor;
      case 'function':
        return theme.functionColor;
      case 'equal':
        return theme.accentColor;
      case 'memory':
        return theme.memoryColor;
      default:
        return theme.numberColor;
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'operator':
      case 'equal':
      case 'memory':
        return '#FFFFFF';
      default:
        return theme.textColor;
    }
  };
  
  const handlePress = () => {
    // Only use haptics on native platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          width: size,
          height: size,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: 'Roboto-Medium',
  },
});