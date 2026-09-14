import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeColors = {
  backgroundColor: string;
  cardColor: string;
  cardSubtle: string;
  glassBg: string;
  glassBorder: string;
  textColor: string;
  secondaryTextColor: string;
  mutedTextColor: string;
  accentColor: string;
  accentSecondary: string;
  accentGlow: string;
  operatorColor: string;
  operatorTextColor: string;
  numberColor: string;
  numberBorder: string;
  numberTextColor: string;
  functionColor: string;
  functionTextColor: string;
  memoryColor: string;
  dangerColor: string;
  borderColor: string;
  placeholderColor: string;
  tabBarBackground: string;
  tabBarBorder: string;
  pillActiveBg: string;
};

export type ThemeScheme = 'cyan' | 'titanium' | 'emerald' | 'amethyst' | 'solar';

export const THEME_PALETTES: Record<
  ThemeScheme,
  {
    name: string;
    description: string;
    primary: string;
    secondary: string;
    glow: string;
    light: ThemeColors;
    dark: ThemeColors;
  }
> = {
  cyan: {
    name: 'Obsidian Cyan',
    description: 'Electric Neon & Pure Carbon',
    primary: '#00F2FE',
    secondary: '#4FACFE',
    glow: 'rgba(0, 242, 254, 0.35)',
    dark: {
      backgroundColor: '#030508',
      cardColor: '#090D14',
      cardSubtle: '#101724',
      glassBg: 'rgba(255, 255, 255, 0.04)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
      textColor: '#FFFFFF',
      secondaryTextColor: '#8B9BB4',
      mutedTextColor: '#52617A',
      accentColor: '#00F2FE',
      accentSecondary: '#4FACFE',
      accentGlow: 'rgba(0, 242, 254, 0.4)',
      operatorColor: '#00F2FE',
      operatorTextColor: '#00F2FE',
      numberColor: 'rgba(255, 255, 255, 0.045)',
      numberBorder: 'rgba(255, 255, 255, 0.07)',
      numberTextColor: '#F0F4FC',
      functionColor: 'rgba(255, 255, 255, 0.08)',
      functionTextColor: '#E2E8F0',
      memoryColor: '#10B981',
      dangerColor: '#FF4757',
      borderColor: 'rgba(255, 255, 255, 0.07)',
      placeholderColor: '#52617A',
      tabBarBackground: 'rgba(9, 13, 20, 0.92)',
      tabBarBorder: 'rgba(255, 255, 255, 0.08)',
      pillActiveBg: 'rgba(0, 242, 254, 0.15)',
    },
    light: {
      backgroundColor: '#F6F8FC',
      cardColor: '#FFFFFF',
      cardSubtle: '#EDF2F9',
      glassBg: 'rgba(255, 255, 255, 0.9)',
      glassBorder: 'rgba(0, 0, 0, 0.06)',
      textColor: '#0A0F1D',
      secondaryTextColor: '#52617A',
      mutedTextColor: '#8B9BB4',
      accentColor: '#0284C7',
      accentSecondary: '#0369A1',
      accentGlow: 'rgba(2, 132, 199, 0.25)',
      operatorColor: '#0284C7',
      operatorTextColor: '#0284C7',
      numberColor: '#FFFFFF',
      numberBorder: 'rgba(0, 0, 0, 0.07)',
      numberTextColor: '#0A0F1D',
      functionColor: '#E2E8F0',
      functionTextColor: '#1E293B',
      memoryColor: '#059669',
      dangerColor: '#E11D48',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      placeholderColor: '#8B9BB4',
      tabBarBackground: 'rgba(255, 255, 255, 0.94)',
      tabBarBorder: 'rgba(0, 0, 0, 0.07)',
      pillActiveBg: '#E0F2FE',
    },
  },
  titanium: {
    name: 'Titanium Luxe',
    description: 'Monochrome Bauhaus & Leica Minimal',
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    glow: 'rgba(255, 255, 255, 0.25)',
    dark: {
      backgroundColor: '#050505',
      cardColor: '#0F0F0F',
      cardSubtle: '#181818',
      glassBg: 'rgba(255, 255, 255, 0.05)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      textColor: '#FFFFFF',
      secondaryTextColor: '#A1A1AA',
      mutedTextColor: '#52525B',
      accentColor: '#FFFFFF',
      accentSecondary: '#D4D4D8',
      accentGlow: 'rgba(255, 255, 255, 0.35)',
      operatorColor: '#FFFFFF',
      operatorTextColor: '#FFFFFF',
      numberColor: 'rgba(255, 255, 255, 0.04)',
      numberBorder: 'rgba(255, 255, 255, 0.07)',
      numberTextColor: '#F4F4F5',
      functionColor: 'rgba(255, 255, 255, 0.09)',
      functionTextColor: '#E4E4E7',
      memoryColor: '#D4D4D8',
      dangerColor: '#EF4444',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      placeholderColor: '#52525B',
      tabBarBackground: 'rgba(15, 15, 15, 0.94)',
      tabBarBorder: 'rgba(255, 255, 255, 0.09)',
      pillActiveBg: 'rgba(255, 255, 255, 0.14)',
    },
    light: {
      backgroundColor: '#F8F9FA',
      cardColor: '#FFFFFF',
      cardSubtle: '#F1F3F5',
      glassBg: 'rgba(255, 255, 255, 0.92)',
      glassBorder: 'rgba(0, 0, 0, 0.07)',
      textColor: '#111827',
      secondaryTextColor: '#4B5563',
      mutedTextColor: '#9CA3AF',
      accentColor: '#111827',
      accentSecondary: '#374151',
      accentGlow: 'rgba(17, 24, 39, 0.2)',
      operatorColor: '#111827',
      operatorTextColor: '#111827',
      numberColor: '#FFFFFF',
      numberBorder: 'rgba(0, 0, 0, 0.08)',
      numberTextColor: '#111827',
      functionColor: '#E5E7EB',
      functionTextColor: '#1F2937',
      memoryColor: '#4B5563',
      dangerColor: '#DC2626',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      placeholderColor: '#9CA3AF',
      tabBarBackground: 'rgba(255, 255, 255, 0.95)',
      tabBarBorder: 'rgba(0, 0, 0, 0.07)',
      pillActiveBg: '#E5E7EB',
    },
  },
  emerald: {
    name: 'Matrix Emerald',
    primary: '#00F5A0',
    secondary: '#00D9F5',
    description: 'Cyberpunk Neon Green & Mint',
    glow: 'rgba(0, 245, 160, 0.35)',
    dark: {
      backgroundColor: '#020705',
      cardColor: '#07150E',
      cardSubtle: '#0E2319',
      glassBg: 'rgba(0, 245, 160, 0.03)',
      glassBorder: 'rgba(0, 245, 160, 0.12)',
      textColor: '#FFFFFF',
      secondaryTextColor: '#86A795',
      mutedTextColor: '#4B6B59',
      accentColor: '#00F5A0',
      accentSecondary: '#00D9F5',
      accentGlow: 'rgba(0, 245, 160, 0.4)',
      operatorColor: '#00F5A0',
      operatorTextColor: '#00F5A0',
      numberColor: 'rgba(255, 255, 255, 0.04)',
      numberBorder: 'rgba(0, 245, 160, 0.08)',
      numberTextColor: '#E8FFF3',
      functionColor: 'rgba(0, 245, 160, 0.09)',
      functionTextColor: '#00F5A0',
      memoryColor: '#00D9F5',
      dangerColor: '#FF4757',
      borderColor: 'rgba(0, 245, 160, 0.1)',
      placeholderColor: '#4B6B59',
      tabBarBackground: 'rgba(7, 21, 14, 0.94)',
      tabBarBorder: 'rgba(0, 245, 160, 0.12)',
      pillActiveBg: 'rgba(0, 245, 160, 0.16)',
    },
    light: {
      backgroundColor: '#F5FBF7',
      cardColor: '#FFFFFF',
      cardSubtle: '#E8F7EE',
      glassBg: 'rgba(255, 255, 255, 0.92)',
      glassBorder: 'rgba(0, 0, 0, 0.06)',
      textColor: '#062817',
      secondaryTextColor: '#38664D',
      mutedTextColor: '#7CA88F',
      accentColor: '#059669',
      accentSecondary: '#047857',
      accentGlow: 'rgba(5, 150, 105, 0.25)',
      operatorColor: '#059669',
      operatorTextColor: '#059669',
      numberColor: '#FFFFFF',
      numberBorder: 'rgba(0, 0, 0, 0.07)',
      numberTextColor: '#062817',
      functionColor: '#D1FAE5',
      functionTextColor: '#065F46',
      memoryColor: '#0284C7',
      dangerColor: '#E11D48',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      placeholderColor: '#7CA88F',
      tabBarBackground: 'rgba(255, 255, 255, 0.95)',
      tabBarBorder: 'rgba(0, 0, 0, 0.07)',
      pillActiveBg: '#A7F3D0',
    },
  },
  amethyst: {
    name: 'Neo Amethyst',
    primary: '#B026FF',
    secondary: '#FF2A85',
    description: 'Electric Purple & Laser Magenta',
    glow: 'rgba(176, 38, 255, 0.35)',
    dark: {
      backgroundColor: '#06030A',
      cardColor: '#11081C',
      cardSubtle: '#1C0E2D',
      glassBg: 'rgba(176, 38, 255, 0.04)',
      glassBorder: 'rgba(176, 38, 255, 0.14)',
      textColor: '#FFFFFF',
      secondaryTextColor: '#A78BB8',
      mutedTextColor: '#654D75',
      accentColor: '#B026FF',
      accentSecondary: '#FF2A85',
      accentGlow: 'rgba(176, 38, 255, 0.45)',
      operatorColor: '#FF2A85',
      operatorTextColor: '#FF2A85',
      numberColor: 'rgba(255, 255, 255, 0.04)',
      numberBorder: 'rgba(176, 38, 255, 0.09)',
      numberTextColor: '#F9F2FF',
      functionColor: 'rgba(176, 38, 255, 0.1)',
      functionTextColor: '#E9D5FF',
      memoryColor: '#38BDF8',
      dangerColor: '#FF3366',
      borderColor: 'rgba(176, 38, 255, 0.1)',
      placeholderColor: '#654D75',
      tabBarBackground: 'rgba(17, 8, 28, 0.94)',
      tabBarBorder: 'rgba(176, 38, 255, 0.12)',
      pillActiveBg: 'rgba(176, 38, 255, 0.18)',
    },
    light: {
      backgroundColor: '#FCF7FF',
      cardColor: '#FFFFFF',
      cardSubtle: '#F4EBFF',
      glassBg: 'rgba(255, 255, 255, 0.92)',
      glassBorder: 'rgba(0, 0, 0, 0.06)',
      textColor: '#1F0A33',
      secondaryTextColor: '#664085',
      mutedTextColor: '#A080BD',
      accentColor: '#9333EA',
      accentSecondary: '#C026D3',
      accentGlow: 'rgba(147, 51, 234, 0.25)',
      operatorColor: '#C026D3',
      operatorTextColor: '#C026D3',
      numberColor: '#FFFFFF',
      numberBorder: 'rgba(0, 0, 0, 0.07)',
      numberTextColor: '#1F0A33',
      functionColor: '#F3E8FF',
      functionTextColor: '#6B21A8',
      memoryColor: '#0284C7',
      dangerColor: '#E11D48',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      placeholderColor: '#A080BD',
      tabBarBackground: 'rgba(255, 255, 255, 0.95)',
      tabBarBorder: 'rgba(0, 0, 0, 0.07)',
      pillActiveBg: '#E9D5FF',
    },
  },
  solar: {
    name: 'Solar Gold',
    primary: '#FFB800',
    secondary: '#FF5E00',
    description: 'Liquid Amber & Molten Gold',
    glow: 'rgba(255, 184, 0, 0.35)',
    dark: {
      backgroundColor: '#080501',
      cardColor: '#160F04',
      cardSubtle: '#261908',
      glassBg: 'rgba(255, 184, 0, 0.03)',
      glassBorder: 'rgba(255, 184, 0, 0.12)',
      textColor: '#FFFFFF',
      secondaryTextColor: '#B39F80',
      mutedTextColor: '#6B5B42',
      accentColor: '#FFB800',
      accentSecondary: '#FF5E00',
      accentGlow: 'rgba(255, 184, 0, 0.4)',
      operatorColor: '#FFB800',
      operatorTextColor: '#FFB800',
      numberColor: 'rgba(255, 255, 255, 0.04)',
      numberBorder: 'rgba(255, 184, 0, 0.08)',
      numberTextColor: '#FFFBF0',
      functionColor: 'rgba(255, 184, 0, 0.09)',
      functionTextColor: '#FED7AA',
      memoryColor: '#34D399',
      dangerColor: '#FF4757',
      borderColor: 'rgba(255, 184, 0, 0.1)',
      placeholderColor: '#6B5B42',
      tabBarBackground: 'rgba(22, 15, 4, 0.94)',
      tabBarBorder: 'rgba(255, 184, 0, 0.12)',
      pillActiveBg: 'rgba(255, 184, 0, 0.16)',
    },
    light: {
      backgroundColor: '#FFFDF9',
      cardColor: '#FFFFFF',
      cardSubtle: '#FEF3C7',
      textColor: '#291802',
      secondaryTextColor: '#78541E',
      mutedTextColor: '#B5925A',
      glassBg: 'rgba(255, 255, 255, 0.92)',
      glassBorder: 'rgba(0, 0, 0, 0.06)',
      accentColor: '#D97706',
      accentSecondary: '#EA580C',
      accentGlow: 'rgba(217, 119, 6, 0.25)',
      operatorColor: '#EA580C',
      operatorTextColor: '#EA580C',
      numberColor: '#FFFFFF',
      numberBorder: 'rgba(0, 0, 0, 0.07)',
      numberTextColor: '#291802',
      functionColor: '#FEF3C7',
      functionTextColor: '#92400E',
      memoryColor: '#059669',
      dangerColor: '#DC2626',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      placeholderColor: '#B5925A',
      tabBarBackground: 'rgba(255, 255, 255, 0.95)',
      tabBarBorder: 'rgba(0, 0, 0, 0.07)',
      pillActiveBg: '#FDE68A',
    },
  },
};

const normalizeThemeName = (name: string): ThemeScheme => {
  if (name === 'blue') return 'cyan';
  if (name === 'purple') return 'amethyst';
  if (name === 'amber' || name === 'red') return 'solar';
  if (name === 'green') return 'emerald';
  if (name in THEME_PALETTES) return name as ThemeScheme;
  return 'cyan';
};

type ThemeContextType = {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedTheme: ThemeScheme;
  setSelectedTheme: (theme: string) => void;
  allThemes: ThemeScheme[];
  themePalettes: typeof THEME_PALETTES;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: THEME_PALETTES.cyan.dark,
  isDarkMode: true,
  toggleDarkMode: () => {},
  selectedTheme: 'cyan',
  setSelectedTheme: () => {},
  allThemes: ['cyan', 'titanium', 'emerald', 'amethyst', 'solar'],
  themePalettes: THEME_PALETTES,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedTheme, setSelectedThemeState] = useState<ThemeScheme>('cyan');

  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        const savedDarkMode = await AsyncStorage.getItem('isDarkMode');

        if (savedTheme) {
          setSelectedThemeState(normalizeThemeName(savedTheme));
        }

        if (savedDarkMode !== null) {
          setIsDarkMode(savedDarkMode === 'true');
        } else {
          // Default to OLED dark
          setIsDarkMode(true);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    loadThemePreferences();
  }, [systemColorScheme]);

  const setSelectedTheme = async (themeName: string) => {
    const normalized = normalizeThemeName(themeName);
    setSelectedThemeState(normalized);
    try {
      await AsyncStorage.setItem('selectedTheme', normalized);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = async () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem('isDarkMode', next.toString()).catch(console.error);
      return next;
    });
  };

  const activePalette = THEME_PALETTES[selectedTheme] || THEME_PALETTES.cyan;
  const theme = isDarkMode ? activePalette.dark : activePalette.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleDarkMode,
        selectedTheme,
        setSelectedTheme,
        allThemes: Object.keys(THEME_PALETTES) as ThemeScheme[],
        themePalettes: THEME_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);