import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useLanguage } from '@/context/LanguageContext';
import { Copy, Check, Sparkles, FlaskConical, ClipboardPaste } from 'lucide-react-native';
import { getClipboardString, setClipboardString } from '@/utils/clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function Display() {
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  const {
    display,
    error,
    expression,
    liveResult,
    angleUnit,
    toggleAngleUnit,
    isScientificMode,
    toggleScientificMode,
    hapticsEnabled,
    setExpression,
    appendToExpression,
  } = useCalculator();

  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  const handleCopy = async () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setClipboardString(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handlePaste = async () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const text = await getClipboardString();
    if (!text) return;

    const cleaned = text.trim().replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (cleaned) {
      if (!expression || expression === '0') {
        setExpression(cleaned);
      } else {
        appendToExpression(cleaned);
      }
      setPasted(true);
      setTimeout(() => setPasted(false), 1400);
    }
  };

  // Compact dynamic font sizing
  const getMainFontSize = () => {
    if (display.length > 15) return 22;
    if (display.length > 11) return 26;
    if (display.length > 7) return 30;
    return 36;
  };

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={
          isDarkMode
            ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.015)']
            : ['#FFFFFF', '#F8FAFC']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.container,
          {
            borderColor: theme.glassBorder,
          },
        ]}
      >
        {/* Top Floating Telemetry & Micro-Actions */}
        <View style={[styles.topTelemetryRow, isRTL && styles.rtlRow]}>
          <View style={[styles.statusPills, isRTL && styles.rtlRow]}>
            {/* Scientific / Standard Mode Pill */}
            <TouchableOpacity
              style={[
                styles.modePill,
                {
                  backgroundColor: isScientificMode ? theme.pillActiveBg : theme.cardSubtle,
                  borderColor: isScientificMode ? theme.accentColor : theme.borderColor,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web' && hapticsEnabled) {
                  Haptics.selectionAsync();
                }
                toggleScientificMode();
              }}
              activeOpacity={0.7}
            >
              <FlaskConical
                size={12}
                color={isScientificMode ? theme.accentColor : theme.secondaryTextColor}
                style={{ marginEnd: 5 }}
              />
              <Text
                style={[
                  styles.modePillText,
                  {
                    color: isScientificMode ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: isScientificMode ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
              >
                {isScientificMode ? t.modeScientific.toUpperCase() : t.modeStandard.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {/* Angle Unit Toggle (Visible in Scientific mode) */}
            {isScientificMode && (
              <TouchableOpacity
                style={[
                  styles.anglePill,
                  {
                    backgroundColor: theme.cardSubtle,
                    borderColor: theme.borderColor,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web' && hapticsEnabled) {
                    Haptics.selectionAsync();
                  }
                  toggleAngleUnit();
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.glowingDot,
                    { backgroundColor: theme.accentColor, shadowColor: theme.accentColor },
                  ]}
                />
                <Text style={[styles.anglePillText, { color: theme.accentColor }]}>
                  {angleUnit.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.actionsGroup, isRTL && styles.rtlRow]}>
            {/* Paste Button */}
            <TouchableOpacity
              style={[
                styles.copyActionBtn,
                {
                  backgroundColor: pasted ? theme.pillActiveBg : theme.cardSubtle,
                  borderColor: pasted ? theme.accentColor : theme.borderColor,
                },
              ]}
              onPress={handlePaste}
              activeOpacity={0.7}
            >
              {pasted ? (
                <View style={[styles.copiedState, isRTL && styles.rtlRow]}>
                  <Check size={13} color={theme.accentColor} strokeWidth={2.5} />
                  <Text style={[styles.copiedLabel, { color: theme.accentColor }]}>{t.pasted}</Text>
                </View>
              ) : (
                <ClipboardPaste size={14} color={theme.secondaryTextColor} />
              )}
            </TouchableOpacity>

            {/* Copy Button */}
            <TouchableOpacity
              style={[
                styles.copyActionBtn,
                {
                  backgroundColor: copied ? theme.pillActiveBg : theme.cardSubtle,
                  borderColor: copied ? theme.accentColor : theme.borderColor,
                },
              ]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              {copied ? (
                <View style={[styles.copiedState, isRTL && styles.rtlRow]}>
                  <Check size={13} color={theme.accentColor} strokeWidth={2.5} />
                  <Text style={[styles.copiedLabel, { color: theme.accentColor }]}>{t.copied}</Text>
                </View>
              ) : (
                <Copy size={14} color={theme.secondaryTextColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Formula Tape Stream */}
        <View style={styles.formulaStream}>
          {expression.length > 0 && (
            <ScrollView
              horizontal
              contentContainerStyle={styles.formulaScroll}
              showsHorizontalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.formulaText,
                  {
                    color: theme.secondaryTextColor,
                  },
                ]}
              >
                {display}
              </Text>
            </ScrollView>
          )}
        </View>

        {/* Floating Live Calculation Hint */}
        <View style={styles.liveHintRow}>
          {liveResult && !error && (
            <View
              style={[
                styles.liveResultBadge,
                {
                  backgroundColor: theme.pillActiveBg,
                  borderColor: theme.accentColor,
                },
              ]}
            >
              <Sparkles size={12} color={theme.accentColor} style={{ marginRight: 5 }} />
              <Text style={[styles.liveResultText, { color: theme.accentColor }]}>
                = {liveResult}
              </Text>
            </View>
          )}
        </View>

        {/* Hero Digital Readout */}
        <View style={styles.mainReadoutArea}>
          {error ? (
            <View
              style={[
                styles.errorBadge,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 71, 87, 0.16)'
                    : 'rgba(255, 71, 87, 0.1)',
                  borderColor: theme.dangerColor,
                },
              ]}
            >
              <Text style={[styles.errorText, { color: theme.dangerColor }]}>
                Syntax Error
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              contentContainerStyle={styles.mainNumberScroll}
              showsHorizontalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.heroNumber,
                  {
                    color: theme.textColor,
                    fontSize: getMainFontSize(),
                  },
                ]}
                numberOfLines={1}
              >
                {display}
              </Text>
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginVertical: 4,
    borderRadius: 22,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  glowingDot: {
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
  anglePillText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.5,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copiedState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copiedLabel: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
  },
  formulaStream: {
    minHeight: 18,
    justifyContent: 'center',
    marginTop: 2,
  },
  formulaScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  liveHintRow: {
    minHeight: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  liveResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  liveResultText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  mainReadoutArea: {
    marginTop: 2,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  mainNumberScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  heroNumber: {
    fontFamily: 'Roboto-Bold',
    textAlign: 'right',
    letterSpacing: -0.3,
  },
  errorBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});