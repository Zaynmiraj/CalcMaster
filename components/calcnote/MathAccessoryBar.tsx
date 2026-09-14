import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { ClipboardPaste } from 'lucide-react-native';
import { getClipboardString } from '@/utils/clipboard';
import * as Haptics from 'expo-haptics';

type MathAccessoryBarProps = {
  onInsertToken: (token: string) => void;
};

export default function MathAccessoryBar({ onInsertToken }: MathAccessoryBarProps) {
  const { theme, isDarkMode } = useTheme();
  const { language, t, isRTL } = useLanguage();

  const handlePress = (token: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onInsertToken(token);
  };

  const handlePaste = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const clipText = await getClipboardString();
    if (clipText) {
      onInsertToken(clipText);
    }
  };

  const getTokens = () => {
    if (language === 'bn') {
      return [
        { label: '+', value: ' + ' },
        { label: '−', value: ' - ' },
        { label: '×', value: ' * ' },
        { label: '÷', value: ' / ' },
        { label: '%', value: '%' },
        { label: '=', value: ' = ' },
        { label: '(', value: '(' },
        { label: ')', value: ')' },
        { label: '৳', value: '৳' },
        { label: '$', value: '$' },
        { label: 'লাইন', value: 'লাইন ' },
        { label: 'আগের', value: 'আগের' },
        { label: 'মোট', value: 'মোট' },
        { label: 'to BDT', value: ' to BDT' },
        { label: 'to USD', value: ' to USD' },
        { label: 'to EUR', value: ' to EUR' },
        { label: '০', value: '০' },
        { label: '১', value: '১' },
        { label: '২', value: '২' },
        { label: '৩', value: '৩' },
        { label: '৪', value: '৪' },
        { label: '৫', value: '৫' },
        { label: '৬', value: '৬' },
        { label: '৭', value: '৭' },
        { label: '৮', value: '৮' },
        { label: '৯', value: '৯' },
      ];
    }

    if (language === 'ar') {
      return [
        { label: '+', value: ' + ' },
        { label: '−', value: ' - ' },
        { label: '×', value: ' * ' },
        { label: '÷', value: ' / ' },
        { label: '%', value: '%' },
        { label: '=', value: ' = ' },
        { label: '(', value: '(' },
        { label: ')', value: ')' },
        { label: 'ر.س', value: ' SAR' },
        { label: 'د.إ', value: ' AED' },
        { label: '$', value: '$' },
        { label: 'سطر', value: 'سطر ' },
        { label: 'السابق', value: 'السابق' },
        { label: 'المجموع', value: 'المجموع' },
        { label: 'to SAR', value: ' to SAR' },
        { label: 'to AED', value: ' to AED' },
        { label: 'to USD', value: ' to USD' },
        { label: '٠', value: '٠' },
        { label: '١', value: '١' },
        { label: '٢', value: '٢' },
        { label: '٣', value: '٣' },
        { label: '٤', value: '٤' },
        { label: '٥', value: '٥' },
        { label: '٦', value: '٦' },
        { label: '٧', value: '٧' },
        { label: '٨', value: '٨' },
        { label: '٩', value: '٩' },
      ];
    }

    return [
      { label: '+', value: ' + ' },
      { label: '−', value: ' - ' },
      { label: '×', value: ' * ' },
      { label: '÷', value: ' / ' },
      { label: '%', value: '%' },
      { label: '=', value: ' = ' },
      { label: '(', value: '(' },
      { label: ')', value: ')' },
      { label: '^', value: '^' },
      { label: '$', value: '$' },
      { label: '€', value: '€' },
      { label: '£', value: '£' },
      { label: 'Line', value: 'Line ' },
      { label: 'prev', value: 'prev' },
      { label: 'total', value: 'total' },
      { label: 'to USD', value: ' to USD' },
      { label: 'to EUR', value: ' to EUR' },
      { label: 'to CAD', value: ' to CAD' },
    ];
  };

  const tokens = getTokens();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? 'rgba(9, 13, 20, 0.95)' : theme.cardColor,
          borderTopColor: theme.glassBorder,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.rtlRow]}
      >
        <TouchableOpacity
          style={[
            styles.pasteButton,
            isRTL && styles.rtlRow,
            {
              backgroundColor: isDarkMode
                ? 'rgba(0, 242, 254, 0.14)'
                : 'rgba(2, 132, 199, 0.12)',
              borderColor: isDarkMode
                ? 'rgba(0, 242, 254, 0.4)'
                : theme.accentColor,
            },
          ]}
          onPress={handlePaste}
          activeOpacity={0.7}
        >
          <ClipboardPaste size={13} color={theme.accentColor} style={{ marginEnd: 5 }} />
          <Text style={[styles.pasteLabel, { color: theme.accentColor }]}>
            {t.paste}
          </Text>
        </TouchableOpacity>

        {tokens.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.tokenButton,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.06)'
                  : theme.cardSubtle,
                borderColor: theme.borderColor,
              },
            ]}
            onPress={() => handlePress(item.value)}
            activeOpacity={0.65}
          >
            <Text
              style={[
                styles.tokenLabel,
                {
                  color: item.label === 'Line' || item.label === 'prev' || item.label === 'total'
                    ? theme.accentColor
                    : theme.textColor,
                  fontFamily: item.label === 'Line' ? 'Roboto-Bold' : 'Roboto-Medium',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginEnd: 4,
  },
  pasteLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  tokenButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
