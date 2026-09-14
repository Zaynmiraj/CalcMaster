import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import * as Haptics from 'expo-haptics';

export default function MemoryBar() {
  const { theme, isDarkMode } = useTheme();
  const {
    memory,
    clearMemory,
    addToMemory,
    subtractFromMemory,
    recallMemory,
    hapticsEnabled,
  } = useCalculator();

  const hasMemory = memory !== '0';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.selectionAsync();
    }
  };

  const memButtons = [
    { label: 'MC', action: clearMemory, disabled: !hasMemory },
    { label: 'M+', action: addToMemory, disabled: false },
    { label: 'M−', action: subtractFromMemory, disabled: false },
    { label: 'MR', action: recallMemory, disabled: !hasMemory },
  ];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.035)' : theme.cardColor,
            borderColor: theme.glassBorder,
          },
        ]}
      >
        <View style={styles.buttonRow}>
          {memButtons.map((btn, index) => {
            const isClickable = !btn.disabled;
            const isRecalling = hasMemory && btn.label === 'MR';

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.memButton,
                  isRecalling && {
                    backgroundColor: theme.pillActiveBg,
                  },
                ]}
                onPress={() => {
                  if (isClickable) {
                    triggerHaptic();
                    btn.action();
                  }
                }}
                activeOpacity={0.5}
                disabled={!isClickable}
              >
                <Text
                  style={[
                    styles.memButtonText,
                    {
                      color: isClickable
                        ? isRecalling
                          ? theme.accentColor
                          : theme.textColor
                        : theme.mutedTextColor,
                      fontFamily: isRecalling ? 'Roboto-Bold' : 'Roboto-Medium',
                    },
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {hasMemory && (
          <TouchableOpacity
            style={[
              styles.activeMemoryTag,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(16, 185, 129, 0.14)'
                  : 'rgba(16, 185, 129, 0.1)',
                borderColor: theme.memoryColor,
              },
            ]}
            onPress={() => {
              triggerHaptic();
              recallMemory();
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.memoryJewel,
                {
                  backgroundColor: theme.memoryColor,
                  shadowColor: theme.memoryColor,
                },
              ]}
            />
            <Text style={[styles.memoryTagText, { color: theme.memoryColor }]}>
              {memory}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 6,
  },
  memButton: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memButtonText: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
  activeMemoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  memoryJewel: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
    }),
  },
  memoryTagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
});