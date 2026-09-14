import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme, THEME_PALETTES, ThemeScheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useLanguage } from '@/context/LanguageContext';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ThemeSelectorProps {
  showHeader?: boolean;
}

export default function ThemeSelector({ showHeader = false }: ThemeSelectorProps) {
  const { theme, selectedTheme, setSelectedTheme, allThemes, isDarkMode } = useTheme();
  const { hapticsEnabled } = useCalculator();
  const { isRTL } = useLanguage();

  const handleSelect = (themeKey: ThemeScheme) => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTheme(themeKey);
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <Text style={[styles.sectionHeading, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
          THEME PALETTES
        </Text>
      )}

      <View style={styles.paletteList}>
        {allThemes.map((key) => {
          const palette = THEME_PALETTES[key];
          const isSelected = selectedTheme === key;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.paletteRow,
                isRTL && styles.rtlRow,
                {
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.03)'
                      : theme.cardSubtle,
                  borderColor: isSelected ? palette.primary : theme.borderColor,
                },
                isSelected && {
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => handleSelect(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.previewRow, isRTL && styles.previewRowRTL]}>
                <View
                  style={[
                    styles.primaryDot,
                    {
                      backgroundColor: palette.primary,
                      shadowColor: palette.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.secondaryDot,
                    {
                      backgroundColor: palette.secondary,
                    },
                  ]}
                />
              </View>

              <View style={[styles.nameBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text
                  style={[
                    styles.paletteName,
                    {
                      color: isSelected ? palette.primary : theme.textColor,
                      fontFamily: isSelected ? 'Roboto-Bold' : 'Roboto-Medium',
                    },
                    isRTL && styles.rtlText,
                  ]}
                  numberOfLines={1}
                >
                  {palette.name}
                </Text>
                <Text
                  style={[
                    styles.paletteDesc,
                    { color: theme.mutedTextColor },
                    isRTL && styles.rtlText,
                  ]}
                  numberOfLines={1}
                >
                  {palette.description}
                </Text>
              </View>

              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: palette.primary }]}>
                  <Check
                    size={11}
                    color={key === 'titanium' && isDarkMode ? '#000000' : '#FFFFFF'}
                    strokeWidth={3}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  paletteList: {
    gap: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: 12,
  },
  previewRowRTL: {
    flexDirection: 'row-reverse',
  },
  primaryDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 5,
      },
    }),
  },
  secondaryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginStart: -6,
    zIndex: 1,
    opacity: 0.85,
  },
  nameBlock: {
    flex: 1,
  },
  paletteName: {
    fontSize: 13,
  },
  paletteDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 8,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});