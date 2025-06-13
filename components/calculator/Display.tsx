import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';

export default function Display() {
  const { theme } = useTheme();
  const { display, error } = useCalculator();

  // Adjust font size based on display length
  const getFontSize = () => {
    if (display.length > 15) return 28;
    if (display.length > 10) return 36;
    return 48;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardColor }]}>
      {error ? (
        <Text style={[styles.errorText, { color: theme.dangerColor }]}>{error}</Text>
      ) : (
        <ScrollView 
          horizontal 
          contentContainerStyle={styles.scrollViewContent}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <Text 
            style={[
              styles.displayText, 
              { 
                color: theme.textColor,
                fontSize: getFontSize(),
              }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  displayText: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 24,
    fontFamily: 'Roboto-Medium',
  },
});