import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeSelector() {
  const { theme, selectedTheme, setSelectedTheme, allThemes } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        Theme
      </Text>
      
      <View style={styles.themeGrid}>
        {allThemes.map((themeName) => (
          <TouchableOpacity
            key={themeName}
            style={[
              styles.themeButton,
              selectedTheme === themeName && styles.selectedThemeButton,
              { 
                borderColor: selectedTheme === themeName 
                  ? theme.accentColor 
                  : 'transparent' 
              }
            ]}
            onPress={() => setSelectedTheme(themeName)}
          >
            <View 
              style={[
                styles.colorCircle, 
                { backgroundColor: themeName === 'blue' ? '#007AFF' : 
                                   themeName === 'green' ? '#34C759' : 
                                   themeName === 'purple' ? '#AF52DE' : 
                                   '#FF3B30' }
              ]} 
            />
            <Text style={[
              styles.themeName, 
              { color: theme.textColor },
              selectedTheme === themeName && { fontFamily: 'Roboto-Medium' }
            ]}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  selectedThemeButton: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  themeName: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
});