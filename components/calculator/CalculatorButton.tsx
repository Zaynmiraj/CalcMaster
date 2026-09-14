import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonType = 'number' | 'operator' | 'function' | 'equal' | 'memory' | 'danger';

type CalculatorButtonProps = {
  label: string;
  type: ButtonType;
  onPress: () => void;
  width?: number;
  height?: number;
  flex?: number;
  icon?: React.ReactNode;
  fontSize?: number;
};

export default function CalculatorButton({
  label,
  type,
  onPress,
  width,
  height = 70,
  flex,
  icon,
  fontSize = 24,
}: CalculatorButtonProps) {
  const { theme, isDarkMode } = useTheme();
  const { hapticsEnabled } = useCalculator();

  const handlePress = () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      if (type === 'equal') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (type === 'operator') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'function' || type === 'danger') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.selectionAsync();
      }
    }
    onPress();
  };

  const isHeroEqual = type === 'equal';
  const isOperator = type === 'operator';
  const isDanger = type === 'danger';

  const getBackgroundColor = () => {
    switch (type) {
      case 'number':
        return theme.numberColor;
      case 'operator':
        return isDarkMode ? 'rgba(255, 255, 255, 0.055)' : theme.cardSubtle;
      case 'function':
        return theme.functionColor;
      case 'danger':
        return isDarkMode ? 'rgba(255, 71, 87, 0.14)' : 'rgba(255, 71, 87, 0.1)';
      case 'memory':
        return isDarkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)';
      default:
        return theme.numberColor;
    }
  };

  const getBorderColor = () => {
    if (isOperator) {
      return isDarkMode ? `${theme.operatorColor}40` : theme.borderColor;
    }
    if (isDanger) {
      return isDarkMode ? 'rgba(255, 71, 87, 0.35)' : 'rgba(255, 71, 87, 0.2)';
    }
    return theme.numberBorder;
  };

  const getTextColor = () => {
    switch (type) {
      case 'operator':
        return theme.operatorColor;
      case 'function':
        return theme.functionTextColor;
      case 'danger':
        return theme.dangerColor;
      case 'memory':
        return theme.memoryColor;
      default:
        return theme.numberTextColor;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.touchable,
        width ? { width } : null,
        flex ? { flex } : null,
        { height },
        isHeroEqual && {
          shadowColor: theme.accentColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDarkMode ? 0.55 : 0.35,
          shadowRadius: 14,
          elevation: 8,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {isHeroEqual ? (
        <LinearGradient
          colors={[theme.accentColor, theme.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerContainer}
        >
          <Text
            style={[
              styles.label,
              {
                color: isDarkMode && theme.accentColor === '#FFFFFF' ? '#000000' : '#FFFFFF',
                fontSize: fontSize + 2,
                fontFamily: 'Roboto-Bold',
              },
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
          ]}
        >
          {icon ? (
            icon
          ) : (
            <Text
              style={[
                styles.label,
                {
                  color: getTextColor(),
                  fontSize,
                  fontFamily: type === 'number' ? 'Roboto-Regular' : 'Roboto-Medium',
                },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    margin: 4.5,
    borderRadius: 24,
  },
  innerContainer: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});