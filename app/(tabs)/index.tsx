import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useLanguage } from '@/context/LanguageContext';
import { logScreenView } from '@/utils/analyticsService';
import Display from '@/components/calculator/Display';
import Keypad from '@/components/calculator/Keypad';
import ScientificKeypad from '@/components/calculator/ScientificKeypad';
import MemoryBar from '@/components/calculator/MemoryBar';
import CalcNoteView from '@/components/calcnote/CalcNoteView';
import { FileEdit, Grid } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkspaceScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  const params = useLocalSearchParams<{ mode?: 'notepad' | 'keypad' }>();
  const insets = useSafeAreaInsets();
  const bottomClearance = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12) + 64 + 14;

  useFocusEffect(
    useCallback(() => {
      logScreenView('CalcNoteWorkspace', 'WorkspaceScreen');
    }, [])
  );

  const {
    isScientificMode,
    trackSessionTime,
    hapticsEnabled,
  } = useCalculator();

  const [viewMode, setViewMode] = useState<'notepad' | 'keypad'>('notepad');

  useEffect(() => {
    if (params.mode === 'notepad' || params.mode === 'keypad') {
      setViewMode(params.mode);
    }
  }, [params.mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      trackSessionTime();
    }, 60000);

    return () => {
      clearInterval(interval);
      trackSessionTime();
    };
  }, [trackSessionTime]);

  const handleSwitchMode = (mode: 'notepad' | 'keypad') => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.selectionAsync();
    }
    setViewMode(mode);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      {/* Ambient background light orb */}
      {isDarkMode && (
        <View style={styles.ambientGlowContainer} pointerEvents="none">
          <LinearGradient
            colors={[theme.accentGlow, 'transparent']}
            style={styles.ambientTopOrb}
          />
        </View>
      )}

      <View style={[styles.container, { paddingBottom: bottomClearance }]}>
        {/* Top View Mode Switcher Header */}
        <View style={[styles.topHeader, isRTL && styles.rtlRow]}>
          <View
            style={[
              styles.segmentContainer,
              isRTL && styles.rtlRow,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : theme.cardSubtle,
                borderColor: theme.glassBorder,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentTab,
                viewMode === 'notepad' && [
                  styles.segmentTabActive,
                  {
                    backgroundColor: isDarkMode ? theme.cardSubtle : '#FFFFFF',
                    borderColor: theme.borderColor,
                    shadowColor: theme.accentColor,
                  },
                ],
              ]}
              onPress={() => handleSwitchMode('notepad')}
              activeOpacity={0.7}
            >
              <FileEdit
                size={14}
                color={viewMode === 'notepad' ? theme.accentColor : theme.secondaryTextColor}
                style={{ marginEnd: 6 }}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  {
                    color: viewMode === 'notepad' ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: viewMode === 'notepad' ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t.smartNotepad}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentTab,
                viewMode === 'keypad' && [
                  styles.segmentTabActive,
                  {
                    backgroundColor: isDarkMode ? theme.cardSubtle : '#FFFFFF',
                    borderColor: theme.borderColor,
                    shadowColor: theme.accentColor,
                  },
                ],
              ]}
              onPress={() => handleSwitchMode('keypad')}
              activeOpacity={0.7}
            >
              <Grid
                size={14}
                color={viewMode === 'keypad' ? theme.accentColor : theme.secondaryTextColor}
                style={{ marginEnd: 6 }}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  {
                    color: viewMode === 'keypad' ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: viewMode === 'keypad' ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t.keypadCalc}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode Content */}
        {viewMode === 'notepad' ? (
          <CalcNoteView />
        ) : (
          <View style={styles.keypadView}>
            <Display />
            <MemoryBar />
            <View style={styles.keypadWrapper}>
              {isScientificMode ? <ScientificKeypad /> : <Keypad />}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  ambientGlowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientTopOrb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.35,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    gap: 4,
    width: '100%',
    maxWidth: 420,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  segmentTabText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  keypadView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  keypadWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});