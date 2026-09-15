import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCalcNote } from '@/context/CalcNoteContext';
import {
  summarizeDocumentWithAI,
  AISummaryResult,
  getStoredModel,
} from '@/utils/aiEngine';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Share2,
  Lightbulb,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BannerAdView } from '@/components/ads/BannerAdView';
import { showRewardedAd, showInterstitialAd } from '@/utils/adMobService';

type AISummaryModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AISummaryModal({ visible, onClose }: AISummaryModalProps) {
  const { theme, isDarkMode } = useTheme();
  const { language, t, isRTL } = useLanguage();
  const { activeDoc, evaluation } = useCalcNote();

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [modelName, setModelName] = useState('OpenRouter Free Tier');

  useEffect(() => {
    if (visible) {
      runSummary();
    }
  }, [visible, activeDoc.id, language]);

  const runSummary = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);
    try {
      const activeModel = await getStoredModel();
      setModelName(activeModel.split('/')[1] || activeModel);

      const result = await summarizeDocumentWithAI({
        title: activeDoc.title,
        lines: evaluation.lines,
        grandTotal: evaluation.formattedGrandTotal,
        language,
      });
      setSummaryData(result);
      showInterstitialAd();
    } catch (e) {
      console.warn('AI Summary failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summaryData) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const textToCopy = [
      `📊 ${activeDoc.title || 'Calculation Note'} - ${t.aiInsights}`,
      `Total: ${evaluation.formattedGrandTotal}`,
      '',
      summaryData.summary,
      '',
      '📌 Key Insights:',
      ...summaryData.keyInsights.map((k) => `• ${k}`),
      '',
      '💡 Recommendations:',
      ...summaryData.recommendations.map((r) => `• ${r}`),
    ].join('\n');

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      await Share.share({
        title: `${activeDoc.title} AI Summary`,
        message: textToCopy,
      });
    }

    showInterstitialAd();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.cardColor, borderColor: theme.glassBorder },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.sparkleBadge, { backgroundColor: theme.pillActiveBg }]}>
                <Sparkles size={18} color={theme.accentColor} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textColor }]}>
                  {t.aiInsights}
                </Text>
                <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
                  {activeDoc.title.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
              onPress={onClose}
            >
              <X size={18} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>

          {/* Model Status Pill */}
          <View
            style={[
              styles.modelPill,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.04)'
                  : theme.cardSubtle,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <Sparkles size={12} color={theme.accentColor} style={{ marginRight: 6 }} />
            <Text style={[styles.modelText, { color: theme.secondaryTextColor }]}>
              {language === 'ar'
                ? 'محرك الذكاء الاصطناعي المالي'
                : language === 'bn'
                ? 'স্মার্ট আর্থিক বিশ্লেষণ ইঞ্জিন'
                : 'AI Financial Intelligence'}
            </Text>
            <TouchableOpacity
              onPress={runSummary}
              disabled={loading}
              style={{ marginLeft: 'auto', padding: 2 }}
            >
              <RefreshCw
                size={12}
                color={theme.accentColor}
                style={loading ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accentColor} />
              <Text style={[styles.loadingText, { color: theme.secondaryTextColor }]}>
                {language === 'ar'
                  ? 'جاري تحليل المعادلات واستخراج الرؤى المالية...'
                  : language === 'bn'
                  ? 'হিসাবসমূহ বিশ্লেষণ করে এআই অন্তর্দৃষ্টি তৈরি হচ্ছে...'
                  : 'Analyzing equations & generating financial insights...'}
              </Text>
            </View>
          ) : summaryData ? (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Executive Summary Card */}
              <View
                style={[
                  styles.insightCard,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(0, 242, 254, 0.06)'
                      : 'rgba(2, 132, 199, 0.06)',
                    borderColor: theme.accentColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardHeaderLabel,
                    { color: theme.accentColor },
                    isRTL && styles.rtlText,
                  ]}
                >
                  {language === 'ar'
                    ? 'الملخص التنفيذي'
                    : language === 'bn'
                    ? 'সারসংক্ষেপ'
                    : 'EXECUTIVE SUMMARY'}
                </Text>
                <Text
                  style={[
                    styles.summaryText,
                    { color: theme.textColor },
                    isRTL && styles.rtlText,
                  ]}
                >
                  {summaryData.summary}
                </Text>
              </View>

              {/* Key Insights List */}
              {summaryData.keyInsights.length > 0 && (
                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.03)'
                        : theme.cardSubtle,
                      borderColor: theme.borderColor,
                    },
                  ]}
                >
                  <View style={[styles.sectionRow, isRTL && styles.rtlRow]}>
                    <TrendingUp size={15} color={theme.accentColor} style={{ marginRight: 6 }} />
                    <Text
                      style={[
                        styles.cardHeaderLabel,
                        { color: theme.textColor },
                        isRTL && styles.rtlText,
                      ]}
                    >
                      {language === 'ar'
                        ? 'الرؤى والبيانات الأساسية'
                        : language === 'bn'
                        ? 'মূল পর্যবেক্ষণ'
                        : 'KEY OBSERVATIONS'}
                    </Text>
                  </View>

                  {summaryData.keyInsights.map((item, idx) => (
                    <View
                      key={idx}
                      style={[styles.bulletRow, isRTL && styles.rtlRow]}
                    >
                      <View
                        style={[
                          styles.bulletDot,
                          { backgroundColor: theme.accentColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.bulletText,
                          { color: theme.secondaryTextColor },
                          isRTL && styles.rtlText,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Recommendations */}
              {summaryData.recommendations.length > 0 && (
                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.03)'
                        : theme.cardSubtle,
                      borderColor: theme.borderColor,
                    },
                  ]}
                >
                  <View style={[styles.sectionRow, isRTL && styles.rtlRow]}>
                    <Lightbulb size={15} color={theme.accentColor} style={{ marginRight: 6 }} />
                    <Text
                      style={[
                        styles.cardHeaderLabel,
                        { color: theme.textColor },
                        isRTL && styles.rtlText,
                      ]}
                    >
                      {language === 'ar'
                        ? 'التوصيات والخطوات المقترحة'
                        : language === 'bn'
                        ? 'পরামর্শ ও পদক্ষেপ'
                        : 'FINANCIAL ADVICE'}
                    </Text>
                  </View>

                  {summaryData.recommendations.map((item, idx) => (
                    <View
                      key={idx}
                      style={[styles.bulletRow, isRTL && styles.rtlRow]}
                    >
                      <View
                        style={[
                          styles.bulletDot,
                          { backgroundColor: theme.accentColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.bulletText,
                          { color: theme.secondaryTextColor },
                          isRTL && styles.rtlText,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : null}

          {/* Action Row */}
          <View style={[styles.actionRow, isRTL && styles.rtlRow]}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accentColor }]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              {copied ? (
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              ) : (
                <Copy size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.primaryBtnText}>
                {copied ? t.copied : t.copy}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.borderColor, flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                showRewardedAd(() => {
                  runSummary();
                });
              }}
              activeOpacity={0.8}
            >
              <RefreshCw size={14} color={theme.textColor} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryBtnText, { color: theme.textColor }]}>
                {language === 'ar' ? 'إعادة التحليل' : language === 'bn' ? 'পুনঃবিশ্লেষণ' : 'Re-Analyze'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.borderColor }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textColor }]}>
                {t.close}
              </Text>
            </TouchableOpacity>
          </View>

          {/* AdMob Banner */}
          <BannerAdView style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  modelText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  contentScroll: {
    maxHeight: 380,
  },
  insightCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Roboto-Medium',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontFamily: 'Roboto-Regular',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  secondaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
