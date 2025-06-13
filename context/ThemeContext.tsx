import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
type ThemeColors = {
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  secondaryTextColor: string;
  accentColor: string;
  operatorColor: string;
  numberColor: string;
  functionColor: string;
  memoryColor: string;
  dangerColor: string;
  borderColor: string;
  placeholderColor: string;
};

const themes: Record<string, { light: ThemeColors; dark: ThemeColors }> = {
  blue: {
    light: {
      backgroundColor: '#F2F2F7',
      cardColor: '#FFFFFF',
      textColor: '#000000',
      secondaryTextColor: '#8E8E93',
      accentColor: '#007AFF',
      operatorColor: '#FF9500',
      numberColor: '#EFEFEF',
      functionColor: '#D1D1D6',
      memoryColor: '#34C759',
      dangerColor: '#FF3B30',
      borderColor: '#C6C6C8',
      placeholderColor: '#C7C7CC',
    },
    dark: {
      backgroundColor: '#1C1C1E',
      cardColor: '#2C2C2E',
      textColor: '#FFFFFF',
      secondaryTextColor: '#8E8E93',
      accentColor: '#0A84FF',
      operatorColor: '#FF9F0A',
      numberColor: '#2C2C2E',
      functionColor: '#3A3A3C',
      memoryColor: '#30D158',
      dangerColor: '#FF453A',
      borderColor: '#38383A',
      placeholderColor: '#8E8E93',
    },
  },
  green: {
    light: {
      backgroundColor: '#F2F2F7',
      cardColor: '#FFFFFF',
      textColor: '#000000',
      secondaryTextColor: '#8E8E93',
      accentColor: '#34C759',
      operatorColor: '#FF9500',
      numberColor: '#EFEFEF',
      functionColor: '#D1D1D6',
      memoryColor: '#007AFF',
      dangerColor: '#FF3B30',
      borderColor: '#C6C6C8',
      placeholderColor: '#C7C7CC',
    },
    dark: {
      backgroundColor: '#1C1C1E',
      cardColor: '#2C2C2E',
      textColor: '#FFFFFF',
      secondaryTextColor: '#8E8E93',
      accentColor: '#30D158',
      operatorColor: '#FF9F0A',
      numberColor: '#2C2C2E',
      functionColor: '#3A3A3C',
      memoryColor: '#0A84FF',
      dangerColor: '#FF453A',
      borderColor: '#38383A',
      placeholderColor: '#8E8E93',
    },
  },
  purple: {
    light: {
      backgroundColor: '#F2F2F7',
      cardColor: '#FFFFFF',
      textColor: '#000000',
      secondaryTextColor: '#8E8E93',
      accentColor: '#AF52DE',
      operatorColor: '#FF9500',
      numberColor: '#EFEFEF',
      functionColor: '#D1D1D6',
      memoryColor: '#34C759',
      dangerColor: '#FF3B30',
      borderColor: '#C6C6C8',
      placeholderColor: '#C7C7CC',
    },
    dark: {
      backgroundColor: '#1C1C1E',
      cardColor: '#2C2C2E',
      textColor: '#FFFFFF',
      secondaryTextColor: '#8E8E93',
      accentColor: '#BF5AF2',
      operatorColor: '#FF9F0A',
      numberColor: '#2C2C2E',
      functionColor: '#3A3A3C',
      memoryColor: '#30D158',
      dangerColor: '#FF453A',
      borderColor: '#38383A',
      placeholderColor: '#8E8E93',
    },
  },
  red: {
    light: {
      backgroundColor: '#F2F2F7',
      cardColor: '#FFFFFF',
      textColor: '#000000',
      secondaryTextColor: '#8E8E93',
      accentColor: '#FF3B30',
      operatorColor: '#FF9500',
      numberColor: '#EFEFEF',
      functionColor: '#D1D1D6',
      memoryColor: '#34C759',
      dangerColor: '#FF3B30',
      borderColor: '#C6C6C8',
      placeholderColor: '#C7C7CC',
    },
    dark: {
      backgroundColor: '#1C1C1E',
      cardColor: '#2C2C2E',
      textColor: '#FFFFFF',
      secondaryTextColor: '#8E8E93',
      accentColor: '#FF453A',
      operatorColor: '#FF9F0A',
      numberColor: '#2C2C2E',
      functionColor: '#3A3A3C',
      memoryColor: '#30D158',
      dangerColor: '#FF453A',
      borderColor: '#38383A',
      placeholderColor: '#8E8E93',
    },
  },
};

// Context type
type ThemeContextType = {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  allThemes: string[];
};

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.blue.light,
  isDarkMode: false,
  toggleDarkMode: () => {},
  selectedTheme: 'blue',
  setSelectedTheme: () => {},
  allThemes: Object.keys(themes),
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [selectedTheme, setSelectedTheme] = useState('blue');

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
        
        if (savedTheme) {
          setSelectedTheme(savedTheme);
        }
        
        if (savedDarkMode !== null) {
          setIsDarkMode(savedDarkMode === 'true');
        } else {
          // Use system theme if no preference is saved
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    
    loadThemePreferences();
  }, [systemColorScheme]);
  
  // Save theme preferences when they change
  useEffect(() => {
    const saveThemePreferences = async () => {
      try {
        await AsyncStorage.setItem('selectedTheme', selectedTheme);
        await AsyncStorage.setItem('isDarkMode', isDarkMode.toString());
      } catch (error) {
        console.error('Error saving theme preferences:', error);
      }
    };
    
    saveThemePreferences();
  }, [selectedTheme, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? themes[selectedTheme].dark : themes[selectedTheme].light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleDarkMode,
        selectedTheme,
        setSelectedTheme,
        allThemes: Object.keys(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);