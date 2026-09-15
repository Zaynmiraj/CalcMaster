import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/context/LanguageContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useHistory } from '@/context/HistoryContext';
import {
  Moon,
  Sun,
  Palette,
  Compass,
  Vibrate,
  History as HistoryIcon,
  Trash2,
  Sliders,
  Languages,
  Sparkles,
  Zap,
  Mic,
  Coins,
  FileDown,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import ThemeSelector from '@/components/settings/ThemeSelector';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAdView } from '@/components/ads/BannerAdView';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD' },
  { code: 'EUR', symbol: '€', name: 'EUR' },
  { code: 'GBP', symbol: '£', name: 'GBP' },
  { code: 'BDT', symbol: '৳', name: 'BDT' },
  { code: 'AED', symbol: 'د.إ', name: 'AED' },
  { code: 'SAR', symbol: 'ر.س', name: 'SAR' },
];

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const {
    angleUnit,
    toggleAngleUnit,
    hapticsEnabled,
    toggleHaptics,
  } = useCalculator();

  const { historyRetentionDays, setHistoryRetentionDays, clearHistory, history } = useHistory();

  // Smart Preferences State
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [decimalPrecision, setDecimalPrecision] = useState('4');

  useEffect(() => {
    (async () => {
      const storedInsights = await AsyncStorage.getItem('calcmaster_ai_insights_enabled');
      if (storedInsights !== null) setAiInsightsEnabled(storedInsights === 'true');

      const storedCurr = await AsyncStorage.getItem('calcmaster_default_currency');
      if (storedCurr) setActiveCurrency(storedCurr);

      const storedPrec = await AsyncStorage.getItem('calcmaster_precision');
      if (storedPrec) setDecimalPrecision(storedPrec);
    })();
  }, []);

  const handleToggleAiInsights = async (val: boolean) => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAiInsightsEnabled(val);
    await AsyncStorage.setItem('calcmaster_ai_insights_enabled', val ? 'true' : 'false');
  };

  const handleSelectCurrency = async (currCode: string) => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.selectionAsync();
    }
    setActiveCurrency(currCode);
    await AsyncStorage.setItem('calcmaster_default_currency', currCode);
  };

  const handleSelectPrecision = async (prec: string) => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.selectionAsync();
    }
    setDecimalPrecision(prec);
    await AsyncStorage.setItem('calcmaster_precision', prec);
  };

  const handleClearHistory = () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(t.purgeConfirmTitle, t.purgeConfirmMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.purgeButton,
        style: 'destructive',
        onPress: () => {
          if (Platform.OS !== 'web' && hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          clearHistory();
        },
      },
    ]);
  };

  const handleExportAllBackup = async () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const storedDocs = await AsyncStorage.getItem('calcmaster_documents_v1');
      const backupPayload = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        language,
        defaultCurrency: activeCurrency,
        documents: storedDocs ? JSON.parse(storedDocs) : [],
        history,
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notecalc_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          title: 'NoteCalc Pro Backup Export',
          message: jsonString,
        });
      }
    } catch (e) {
      console.warn('Backup export failed:', e);
    }
  };

  const retentionOptions = [
    { label: '24 Hours', value: 1 },
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: 'Indefinite', value: 0 },
  ];

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

      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rtlRow]}>
          <View>
            <Text style={[styles.pageTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
              {t.preferencesTitle}
            </Text>
            <Text style={[styles.pageSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.preferencesSubtitle}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* GROUP 1: LANGUAGE & REGION */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.languageSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              {/* Language Selector Header */}
              <View style={[styles.itemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 132, 199, 0.1)' }]}>
                  <Languages size={17} color={theme.accentColor} />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.languageLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.languageDesc}
                  </Text>
                </View>
              </View>

              {/* 3-Language Segmented Tabs */}
              <View style={[styles.segmentedContainer, isRTL && styles.rtlRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle, borderColor: theme.borderColor }]}>
                {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langKey) => {
                  const item = SUPPORTED_LANGUAGES[langKey];
                  const isActive = language === item.code;

                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.segmentTab,
                        isActive && [
                          styles.segmentTabActive,
                          {
                            backgroundColor: theme.accentColor,
                            shadowColor: theme.accentColor,
                          },
                        ],
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web' && hapticsEnabled) {
                          Haptics.selectionAsync();
                        }
                        setLanguage(item.code);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.segmentFlag}>{item.flag}</Text>
                      <Text
                        style={[
                          styles.segmentTabText,
                          { color: isActive ? '#FFFFFF' : theme.textColor },
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Currency Selector Row */}
              <View style={[styles.itemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.1)' }]}>
                  <Coins size={17} color="#F59E0B" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.currencyLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    CalcNote active conversion currency
                  </Text>
                </View>
              </View>

              {/* Currency Pills Grid */}
              <View style={[styles.currencyGrid, isRTL && styles.rtlRow]}>
                {CURRENCIES.map((c) => {
                  const isSel = activeCurrency === c.code;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.currencyGridItem,
                        {
                          backgroundColor: isSel ? theme.accentColor : isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle,
                          borderColor: isSel ? theme.accentColor : theme.borderColor,
                        },
                      ]}
                      onPress={() => handleSelectCurrency(c.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.currencySymbol, { color: isSel ? '#FFFFFF' : theme.accentColor }]}>
                        {c.symbol}
                      </Text>
                      <Text style={[styles.currencyCode, { color: isSel ? '#FFFFFF' : theme.textColor }]}>
                        {c.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* GROUP 2: AI & SMART FEATURES */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.aiSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              {/* Feature 1: Engine Status */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.1)' }]}>
                  <Sparkles size={17} color="#A855F7" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.aiStatusTitle}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.aiStatusDesc}
                  </Text>
                </View>
                <View style={[styles.activeStatusPill, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <View style={styles.activeStatusDot} />
                  <Text style={styles.activeStatusText}>Active</Text>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Feature 2: Automated Document Insights Switch */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(234, 179, 8, 0.14)' : 'rgba(234, 179, 8, 0.1)' }]}>
                  <Zap size={17} color="#EAB308" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.aiSummariesLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.aiSummariesDesc}
                  </Text>
                </View>
                <Switch
                  value={aiInsightsEnabled}
                  onValueChange={handleToggleAiInsights}
                  trackColor={{ false: theme.borderColor, true: theme.accentColor }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Feature 3: Voice Math Recognition */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 132, 199, 0.1)' }]}>
                  <Mic size={17} color={theme.accentColor} />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    Voice Math Dictation
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    Multilingual speech-to-formula parsing
                  </Text>
                </View>
                <View style={[styles.readyPill, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.cardSubtle, borderColor: theme.borderColor }]}>
                  <Text style={[styles.readyPillText, { color: theme.secondaryTextColor }]}>Ready</Text>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Feature 4: Privacy & Security */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <ShieldCheck size={17} color="#10B981" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    100% Private & Zero-Setup
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.aiPrivacyNotice}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* GROUP 3: APPEARANCE & THEME */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.themeSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              {/* Dark Mode Switch */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 132, 199, 0.1)' }]}>
                  {isDarkMode ? (
                    <Moon size={17} color={theme.accentColor} />
                  ) : (
                    <Sun size={17} color={theme.accentColor} />
                  )}
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.darkModeLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.darkModeDesc}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={() => {
                    if (Platform.OS !== 'web' && hapticsEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    toggleDarkMode();
                  }}
                  trackColor={{ false: theme.borderColor, true: theme.accentColor }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Theme Palette */}
              <View style={{ paddingTop: 4 }}>
                <View style={[styles.itemRow, isRTL && styles.rtlRow, { marginBottom: 6 }]}>
                  <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.1)' }]}>
                    <Palette size={17} color="#A855F7" />
                  </View>
                  <View style={styles.rowLabelContainer}>
                    <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                      {t.themePaletteLabel}
                    </Text>
                    <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      Custom accent hue & radiant glow
                    </Text>
                  </View>
                </View>
                <ThemeSelector />
              </View>
            </View>
          </View>

          {/* GROUP 4: CALCULATION ENGINE */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.calculationSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              {/* Decimal Precision */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.1)' }]}>
                  <Sliders size={17} color="#3B82F6" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.precisionLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    Fixed decimal places
                  </Text>
                </View>

                {/* Precision Segmented Control */}
                <View style={[styles.miniSegmentedRow, isRTL && styles.rtlRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle }]}>
                  {['2', '4', '6', 'Auto'].map((val) => {
                    const isSel = decimalPrecision === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.miniSegmentBtn,
                          isSel && [
                            styles.miniSegmentBtnActive,
                            { backgroundColor: theme.accentColor },
                          ],
                        ]}
                        onPress={() => handleSelectPrecision(val)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.miniSegmentText,
                            { color: isSel ? '#FFFFFF' : theme.textColor },
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Angle Unit */}
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.1)' }]}>
                  <Compass size={17} color="#F97316" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.angleUnitLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    Trigonometric calculation angle
                  </Text>
                </View>

                {/* DEG / RAD Segmented Control */}
                <View style={[styles.miniSegmentedRow, isRTL && styles.rtlRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle }]}>
                  {(['deg', 'rad'] as const).map((unit) => {
                    const isSel = angleUnit === unit;
                    return (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.miniSegmentBtn,
                          isSel && [
                            styles.miniSegmentBtnActive,
                            { backgroundColor: theme.accentColor },
                          ],
                        ]}
                        onPress={() => {
                          if (angleUnit !== unit) toggleAngleUnit();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.miniSegmentText,
                            { color: isSel ? '#FFFFFF' : theme.textColor },
                          ]}
                        >
                          {unit.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* GROUP 5: SENSORY & FEEDBACK */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.sensorySection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              <View style={[styles.settingItemRow, isRTL && styles.rtlRow]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.14)' : 'rgba(139, 92, 246, 0.1)' }]}>
                  <Vibrate size={17} color="#8B5CF6" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.hapticsLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    {t.hapticsDesc}
                  </Text>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    toggleHaptics();
                  }}
                  trackColor={{ false: theme.borderColor, true: theme.accentColor }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* GROUP 6: EQUATION LEDGER */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.ledgerSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              {/* Retention Row */}
              <View style={[styles.itemRow, isRTL && styles.rtlRow, { marginBottom: 10 }]}>
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 132, 199, 0.1)' }]}>
                  <HistoryIcon size={17} color={theme.accentColor} />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.retentionLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    History storage auto-cleanup period
                  </Text>
                </View>
              </View>

              {/* 4-Item Retention Pill Control */}
              <View style={[styles.retentionPillRow, isRTL && styles.rtlRow]}>
                {retentionOptions.map((opt) => {
                  const isSelected = historyRetentionDays === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.retentionPillItem,
                        {
                          backgroundColor: isSelected ? theme.accentColor : isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle,
                          borderColor: isSelected ? theme.accentColor : theme.borderColor,
                        },
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web' && hapticsEnabled) {
                          Haptics.selectionAsync();
                        }
                        setHistoryRetentionDays(opt.value);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.retentionPillText,
                          { color: isSelected ? '#FFFFFF' : theme.textColor },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.glassBorder }]} />

              {/* Purge History Row */}
              <TouchableOpacity
                style={[styles.destructiveRow, isRTL && styles.rtlRow]}
                onPress={handleClearHistory}
                activeOpacity={0.7}
              >
                <View style={[styles.squircle, { backgroundColor: 'rgba(239, 68, 68, 0.14)' }]}>
                  <Trash2 size={17} color="#EF4444" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: '#EF4444' }, isRTL && styles.rtlText]}>
                    {t.purgeHistoryLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    Permanently delete all calculation entries
                  </Text>
                </View>
                <View style={styles.destructiveBadge}>
                  <Text style={styles.destructiveBadgeText}>{t.purgeButton}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* GROUP 7: DATA & BACKUP */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {t.backupSection.toUpperCase()}
            </Text>

            <View style={[styles.groupCard, { backgroundColor: theme.cardColor, borderColor: theme.glassBorder }]}>
              <TouchableOpacity
                style={[styles.settingItemRow, isRTL && styles.rtlRow]}
                onPress={handleExportAllBackup}
                activeOpacity={0.7}
              >
                <View style={[styles.squircle, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <FileDown size={17} color="#10B981" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.exportBackupLabel}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                    Export full JSON of notes & ledger histories
                  </Text>
                </View>
                <View style={[styles.exportBtnBadge, { backgroundColor: theme.pillActiveBg, borderColor: theme.accentColor }]}>
                  <Text style={[styles.exportBtnText, { color: theme.accentColor }]}>
                    Export
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footerContainer}>
            <ShieldCheck size={20} color={theme.accentColor} style={{ marginBottom: 6 }} />
            <Text style={[styles.footerBrandText, { color: theme.textColor }]}>
              NoteCalc Pro
            </Text>
            <Text style={[styles.footerVersionText, { color: theme.secondaryTextColor }]}>
              {t.versionLabel} 1.0.0 • {t.privacyBadge}
            </Text>
            <TouchableOpacity
              style={[
                styles.privacyLinkPill,
                {
                  backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(14, 165, 233, 0.08)',
                  borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.3)' : 'rgba(14, 165, 233, 0.25)',
                },
              ]}
              onPress={async () => {
                try {
                  await WebBrowser.openBrowserAsync('https://policy.nimions.com/privacy/notecalc-pro');
                } catch {
                  // fallback
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.privacyLinkText, { color: theme.accentColor }]}>
                Privacy Policy &amp; Data Safety ↗
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* AdMob Adaptive Banner */}
        <BannerAdView aboveTabBar style={{ marginTop: 4 }} />
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
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  squircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  rowLabelContainer: {
    flex: 1,
    paddingEnd: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    letterSpacing: -0.1,
  },
  rowSubtitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    marginTop: 2,
    lineHeight: 15,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginTop: 12,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 9,
    gap: 6,
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  segmentFlag: {
    fontSize: 15,
  },
  segmentTabText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  currencyGridItem: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  currencySymbol: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  currencyCode: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  activeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeStatusText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#10B981',
  },
  readyPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  readyPillText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  miniSegmentedRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  miniSegmentBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniSegmentBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  miniSegmentText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
  },
  retentionPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  retentionPillItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retentionPillText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  destructiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  destructiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  destructiveBadgeText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#EF4444',
  },
  exportBtnBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerBrandText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  footerVersionText: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    marginTop: 2,
  },
  privacyLinkPill: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  privacyLinkText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});