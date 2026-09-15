import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { LiveVoiceSession, normalizeSpokenMath } from '@/utils/voicePipeline';
import { convertNaturalLanguageToMath } from '@/utils/aiEngine';
import {
  Mic,
  MicOff,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Lightbulb,
  CornerDownLeft,
  ClipboardPaste,
} from 'lucide-react-native';
import { getClipboardString } from '@/utils/clipboard';
import * as Haptics from 'expo-haptics';
import { BannerAdView } from '@/components/ads/BannerAdView';
import { showInterstitialAd } from '@/utils/adMobService';

type VoiceDictationModalProps = {
  visible: boolean;
  onClose: () => void;
  onInsertMath: (mathText: string) => void;
};

export default function VoiceDictationModal({
  visible,
  onClose,
  onInsertMath,
}: VoiceDictationModalProps) {
  const { theme, isDarkMode } = useTheme();
  const { language, isRTL, t } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [parsedLines, setParsedLines] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [voiceSession, setVoiceSession] = useState<LiveVoiceSession | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Multilingual quick sample chips
  const samplePrompts =
    language === 'bn'
      ? [
          '৫টি খাতা ৪০ টাকা করে এবং ৩টি কলম ১০ টাকা',
          'বাজার খরচ: আলু ৬০, পেঁয়াজ ১২০, মোট ভাগ ২',
          'বেতন ৫০,০০০, বাসা ভাড়া ১৫,০০০ বাদ',
        ]
      : language === 'ar'
      ? [
          '٥ أقلام بسعر ٢٠ ريال، ودفتر ٥٠ ريال',
          'فاتورة المطعم ١٨٠ ريال مع ضريبة ١٥٪ مقسومة على ٣',
          'راتب ٥٠٠٠ دولار، إيجار ١٥٠٠، توفير ٢٠٪',
        ]
      : [
          '3 shirts at 25 dollars and shoes for 80',
          'Dinner 120 with 15% tip, split between 3',
          '500 USD to EUR at 0.92 plus 25 shipping',
        ];

  useEffect(() => {
    if (visible) {
      const session = new LiveVoiceSession(language);
      setVoiceSession(session);
      setSpeechSupported(session.isSupported());
      setPromptText('');
      setParsedLines([]);
      setIsRecording(false);
    } else {
      voiceSession?.stop();
      setIsRecording(false);
    }
  }, [visible, language]);

  const handleToggleRecord = () => {
    if ((Platform.OS as string) !== 'web' && !speechSupported) {
      // Guide user on mobile to use keyboard dictation
      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (isRecording) {
      voiceSession?.stop();
      setIsRecording(false);
      if ((Platform.OS as string) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // Auto-trigger AI conversion on speech end
      if (promptText.trim()) {
        triggerAiConversion(promptText.trim());
      }
    } else if (voiceSession) {
      setIsRecording(true);
      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      voiceSession.start(
        (recognized) => {
          setPromptText(recognized);
        },
        (err) => {
          console.warn('Voice recognition error:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const triggerAiConversion = async (text: string) => {
    if (!text.trim() || isConverting) return;
    setIsConverting(true);
    if ((Platform.OS as string) !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // 1. First run through local spoken normalizer
      const locallyNormalized = normalizeSpokenMath(text);

      // 2. Query OpenRouter AI model cascade for intelligent multi-line math structuring
      const aiLines = await convertNaturalLanguageToMath(text, language);

      if (aiLines && aiLines.length > 0) {
        setParsedLines(aiLines);
      } else {
        setParsedLines([`# ${text}`, locallyNormalized]);
      }
      showInterstitialAd();
    } catch (e) {
      console.warn('AI conversion failed:', e);
      setParsedLines([`# ${text}`, normalizeSpokenMath(text)]);
    } finally {
      setIsConverting(false);
    }
  };

  const handlePasteIntoPrompt = async () => {
    if ((Platform.OS as string) !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const clipText = await getClipboardString();
    if (clipText) {
      setPromptText((prev) => (prev.trim() ? `${prev.trim()} ${clipText}` : clipText));
    }
  };

  const handleInsert = () => {
    if (parsedLines.length === 0) return;
    if ((Platform.OS as string) !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const mathContent = parsedLines.join('\n');
    showInterstitialAd();
    onInsertMath(mathContent);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.cardColor, borderColor: theme.glassBorder },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <View>
              <View style={[styles.headerTitleRow, isRTL && styles.rtlRow]}>
                <Sparkles size={18} color={theme.accentColor} style={{ marginRight: 6 }} />
                <Text style={[styles.title, { color: theme.textColor }]}>
                  AI Math Dictation
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
                SPEAK FORMULAS, NUMBERS & CURRENCY
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
              onPress={onClose}
            >
              <X size={18} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>

          {/* Prominent Center Microphone Button */}
          <View style={styles.visualizerArea}>
            <TouchableOpacity
              style={[
                styles.micCircle,
                {
                  backgroundColor: isRecording ? theme.accentColor : theme.cardSubtle,
                  borderColor: isRecording ? '#FFFFFF' : theme.glassBorder,
                  shadowColor: isRecording ? theme.accentColor : '#000',
                },
              ]}
              onPress={handleToggleRecord}
              activeOpacity={0.8}
            >
              {isConverting ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : isRecording ? (
                <Mic size={38} color="#FFFFFF" />
              ) : (
                <Mic size={38} color={theme.accentColor} />
              )}
            </TouchableOpacity>

            <Text
              style={[
                styles.statusText,
                { color: isRecording ? theme.accentColor : theme.secondaryTextColor },
              ]}
            >
              {isConverting
                ? 'Processing with NoteCalc Pro AI...'
                : isRecording
                ? 'Listening... Speak formulas now'
                : 'Tap microphone to speak'}
            </Text>
          </View>

          {/* Quick Example Chips */}
          <View style={styles.chipSection}>
            <View style={[styles.chipHeaderRow, isRTL && styles.rtlRow]}>
              <Lightbulb size={12} color={theme.accentColor} style={{ marginRight: 4 }} />
              <Text style={[styles.chipHeaderLabel, { color: theme.secondaryTextColor }]}>
                QUICK EXAMPLES (TAP TO TRY)
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {samplePrompts.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.exampleChip,
                    {
                      backgroundColor: theme.cardSubtle,
                      borderColor: theme.borderColor,
                    },
                  ]}
                  onPress={() => {
                    setPromptText(s);
                    triggerAiConversion(s);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: theme.textColor }]} numberOfLines={1}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Natural Language Prompt Input */}
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <TextInput
              style={[styles.promptInput, { color: theme.textColor }]}
              placeholder={
                language === 'bn'
                  ? 'কথা বলুন অথবা লিখুন (যেমন: ৫টি শার্ট ২৫ ডলার, জুতো ৮০)'
                  : language === 'ar'
                  ? 'تحدث أو اكتب (مثال: ٣ قمصان بسعر ٢٥ و حذاء ٨٠)'
                  : "Speak or type (e.g. '3 shirts at $25 and shoes for $80')"
              }
              placeholderTextColor={theme.placeholderColor}
              value={promptText}
              onChangeText={setPromptText}
              multiline
            />

            <View style={[styles.inputBottomRow, isRTL && styles.rtlRow]}>
              <View style={[styles.inputBottomLeft, isRTL && styles.rtlRow]}>
                <TouchableOpacity
                  style={[
                    styles.promptPasteBtn,
                    isRTL && styles.rtlRow,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : theme.cardSubtle,
                      borderColor: theme.borderColor,
                    },
                  ]}
                  onPress={handlePasteIntoPrompt}
                  activeOpacity={0.7}
                >
                  <ClipboardPaste size={12} color={theme.accentColor} style={{ marginEnd: 4 }} />
                  <Text style={[styles.promptPasteText, { color: theme.textColor }]}>{t.paste}</Text>
                </TouchableOpacity>

                <Text style={[styles.platformHintText, { color: theme.secondaryTextColor }]}>
                  {promptText.trim() ? `${promptText.length} chars` : 'Voice, typing or paste'}
                </Text>
              </View>

              {/* Transform with AI Button */}
              <TouchableOpacity
                style={[
                  styles.convertBtn,
                  {
                    backgroundColor: promptText.trim() ? theme.accentColor : theme.cardSubtle,
                    opacity: promptText.trim() ? 1 : 0.6,
                  },
                ]}
                onPress={() => triggerAiConversion(promptText)}
                disabled={!promptText.trim() || isConverting}
                activeOpacity={0.8}
              >
                {isConverting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.convertBtnText}>AI Convert</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Generated Result Preview */}
          {parsedLines.length > 0 && (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: isDarkMode ? 'rgba(0, 242, 254, 0.05)' : 'rgba(2, 132, 199, 0.04)',
                  borderColor: theme.accentColor,
                },
              ]}
            >
              <View style={[styles.resultHeader, isRTL && styles.rtlRow]}>
                <Sparkles size={13} color={theme.accentColor} style={{ marginRight: 6 }} />
                <Text style={[styles.resultHeaderLabel, { color: theme.accentColor }]}>
                  AI PARSED CALCNOTE FORMULAS
                </Text>
              </View>

              <ScrollView style={styles.resultScroll}>
                {parsedLines.map((line, idx) => (
                  <View key={idx} style={[styles.resultLineRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.lineNumberText, { color: theme.secondaryTextColor }]}>
                      {idx + 1}.
                    </Text>
                    <Text
                      style={[
                        styles.resultLineText,
                        {
                          color: line.startsWith('#')
                            ? theme.secondaryTextColor
                            : theme.accentColor,
                          fontFamily: line.startsWith('#') ? 'Roboto-Regular' : 'Roboto-Bold',
                        },
                      ]}
                    >
                      {line}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action Row */}
          <View style={[styles.actionRow, isRTL && styles.rtlRow]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.cardSubtle }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.secondaryTextColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.insertBtn,
                {
                  backgroundColor:
                    parsedLines.length > 0 ? theme.accentColor : theme.cardSubtle,
                  opacity: parsedLines.length > 0 ? 1 : 0.5,
                },
              ]}
              onPress={handleInsert}
              disabled={parsedLines.length === 0}
              activeOpacity={0.8}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.insertBtnText}>Insert into Note</Text>
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
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizerArea: {
    alignItems: 'center',
    marginVertical: 12,
  },
  micCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
  },
  chipSection: {
    marginBottom: 10,
  },
  chipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  chipHeaderLabel: {
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  chipScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  exampleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 240,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  inputBox: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
  promptInput: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    minHeight: 50,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },
  inputBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  inputBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptPasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  promptPasteText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
  },
  platformHintText: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
  },
  micActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  micBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  convertBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  resultCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    maxHeight: 140,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultHeaderLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  resultScroll: {
    maxHeight: 100,
  },
  resultLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  lineNumberText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    width: 20,
  },
  resultLineText: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  insertBtn: {
    flex: 1.6,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insertBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});
