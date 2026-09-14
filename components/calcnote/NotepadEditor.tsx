import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCalcNote } from '@/context/CalcNoteContext';
import { useLanguage } from '@/context/LanguageContext';
import * as Haptics from 'expo-haptics';
import { Plus, Check, Sparkles, BookOpen } from 'lucide-react-native';
import { setClipboardString } from '@/utils/clipboard';

type NotepadEditorProps = {
  editorRef?: React.RefObject<TextInput | null>;
  onSelectionChange?: (cursor: number) => void;
};

export default function NotepadEditor({ editorRef, onSelectionChange }: NotepadEditorProps) {
  const { theme, isDarkMode } = useTheme();
  const { language, t, isRTL } = useLanguage();
  const { activeDoc, updateContent, evaluation, loadSampleNote } = useCalcNote();
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);

  const lines = activeDoc.content.split('\n');
  const lineInputRefs = useRef<Array<TextInput | null>>([]);
  const lastSubmitTimeRef = useRef<number>(0);

  const isDocEmpty = lines.length <= 1 && lines[0].trim() === '';

  const getLinePlaceholder = (idx: number): string => {
    if (language === 'bn') {
      if (idx === 0) return 'হিসাব বা নোট লিখুন, যেমন: বেতন = 50000 বা 25 * 4';
      if (idx === 1) return 'যেমন: বোনাস 1000 বা 15% ছাড়';
      if (idx === 2) return 'যেমন: মোট = Line 1 + Line 2';
      if (idx === 3) return 'যেমন: 50 USD to BDT অথবা ভাগ / ২';
      return '';
    }
    if (language === 'ar') {
      if (idx === 0) return 'اكتب الحساب أو الملاحظة، مثال: الراتب = 5000 أو 25 * 4';
      if (idx === 1) return 'مثال: مكافأة 1000 أو خصم 15%';
      if (idx === 2) return 'مثال: الإجمالي = سطر 1 + سطر 2';
      if (idx === 3) return 'مثال: 100 USD to SAR أو قسمة / 2';
      return '';
    }
    if (idx === 0) return 'Type notes & math, e.g. Salary = 5000 or 25 * 4';
    if (idx === 1) return 'e.g. Bonus: 1000 or 15% discount';
    if (idx === 2) return 'e.g. Total: Line 1 + Line 2';
    if (idx === 3) return 'e.g. 100 USD to EUR or split / 2';
    return '';
  };

  const starterSuggestions =
    language === 'bn'
      ? [
          {
            label: 'বেতন ও খরচ',
            content: 'বেতন: ৫০,০০০\nবাজার খরচ: ১২,৫০০\nঅবশিষ্ট: Line 1 - Line 2',
          },
          {
            label: 'ডিসকাউন্ট',
            content: 'শপিং: ১২০০\nছাড়: 15% of Line 1\nমোট প্রদেয়: Line 1 - Line 2',
          },
          {
            label: 'মুদ্রা রূপান্তর',
            content: '100 USD to BDT\n50 EUR to BDT',
          },
        ]
      : language === 'ar'
      ? [
          {
            label: 'راتب ومصروف',
            content: 'الراتب: 5000\nالمصاريف: 1800\nالمتبقي: سطر 1 - سطر 2',
          },
          {
            label: 'حساب الخصم',
            content: 'مشتريات: 1200\nخصم: 15% of Line 1\nالإجمالي: Line 1 - Line 2',
          },
          {
            label: 'تحويل عملات',
            content: '100 USD to SAR\n50 EUR to SAR',
          },
        ]
      : [
          {
            label: 'Salary & Expenses',
            content: 'Salary: $5,000\nExpenses: 1,800\nSavings: Line 1 - Line 2',
          },
          {
            label: 'Discount & Tax',
            content: 'Items: 4 * 25\nTax: 10% of Line 1\nTotal: Line 1 + Line 2',
          },
          {
            label: 'Currency Exchange',
            content: '100 USD to EUR\n50 GBP to USD',
          },
        ];

  // Sync incoming editorRef to the active line input
  useEffect(() => {
    if (editorRef) {
      (editorRef as any).current = lineInputRefs.current[activeLineIdx] || null;
    }
  }, [activeLineIdx, editorRef]);

  // Calculate global cursor position from line index and col offset
  const reportCursorPosition = (lineIndex: number, colIndex: number) => {
    let globalPos = 0;
    for (let i = 0; i < lineIndex; i++) {
      globalPos += (lines[i] ? lines[i].length : 0) + 1;
    }
    globalPos += colIndex;
    onSelectionChange?.(globalPos);
  };

  const handleLineChange = (index: number, newText: string) => {
    // If the text contains newline (e.g. pasted multi-line text or return key)
    if (newText.includes('\n')) {
      lastSubmitTimeRef.current = Date.now();
      const splitLines = newText.split('\n');
      const current = activeDoc.content.split('\n');
      current.splice(index, 1, ...splitLines);
      updateContent(current.join('\n'));

      const nextTargetIdx = index + splitLines.length - 1;
      setActiveLineIdx(nextTargetIdx);
      setTimeout(() => {
        lineInputRefs.current[nextTargetIdx]?.focus();
      }, 60);
      return;
    }

    const current = activeDoc.content.split('\n');
    current[index] = newText;
    updateContent(current.join('\n'));
  };

  const handleKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace') {
      const current = activeDoc.content.split('\n');
      if (current[index] === '' && current.length > 1) {
        current.splice(index, 1);
        updateContent(current.join('\n'));
        const prevIdx = Math.max(0, index - 1);
        setActiveLineIdx(prevIdx);
        setTimeout(() => {
          lineInputRefs.current[prevIdx]?.focus();
        }, 50);
      }
    }
  };

  const handleLineSubmit = (index: number) => {
    // Prevent double newline if onChangeText already handled newline
    if (Date.now() - lastSubmitTimeRef.current < 250) {
      return;
    }
    lastSubmitTimeRef.current = Date.now();

    const current = activeDoc.content.split('\n');
    current.splice(index + 1, 0, '');
    updateContent(current.join('\n'));
    setActiveLineIdx(index + 1);
    setTimeout(() => {
      lineInputRefs.current[index + 1]?.focus();
    }, 60);
  };

  const handleAddLine = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const current = activeDoc.content.split('\n');
    current.push('');
    updateContent(current.join('\n'));
    const nextIdx = current.length - 1;
    setActiveLineIdx(nextIdx);
    setTimeout(() => {
      lineInputRefs.current[nextIdx]?.focus();
    }, 60);
  };

  // Tapping a line number inserts "Line X" into the active line
  const handleLineNumPress = (lineNum: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const current = activeDoc.content.split('\n');
    const targetIdx = Math.min(activeLineIdx, current.length - 1);
    const currText = current[targetIdx] || '';
    const needsSpace =
      currText.length > 0 &&
      !currText.endsWith(' ') &&
      !currText.endsWith('+') &&
      !currText.endsWith('-') &&
      !currText.endsWith('*') &&
      !currText.endsWith('/');
    const linePrefix = isRTL ? 'سطر ' : 'Line ';
    const insertion = (needsSpace ? ' ' : '') + `${linePrefix}${lineNum}`;
    current[targetIdx] = currText + insertion;
    updateContent(current.join('\n'));
  };

  const handleResultPress = (lineNum: number, resultVal: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopiedLine(lineNum);
    setClipboardString(resultVal);
    setTimeout(() => setCopiedLine(null), 1400);

    const linePrefix = isRTL ? 'سطر ' : 'Line ';
    Alert.alert(
      `${linePrefix}${lineNum}`,
      `Computed: ${resultVal}`,
      [
        { text: t.done, style: 'cancel' },
        {
          text: `Insert "${linePrefix}${lineNum}"`,
          onPress: () => {
            const current = activeDoc.content.split('\n');
            const targetIdx = Math.min(activeLineIdx, current.length - 1);
            const currText = current[targetIdx] || '';
            const needsSpace =
              currText.length > 0 &&
              !currText.endsWith(' ') &&
              !currText.endsWith('+') &&
              !currText.endsWith('-');
            current[targetIdx] = currText + (needsSpace ? ' ' : '') + `${linePrefix}${lineNum}`;
            updateContent(current.join('\n'));
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.editorWrapper,
        {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : theme.cardColor,
          borderColor: theme.glassBorder,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const evalLine = evaluation.lines[idx];
          const hasResult = !!evalLine && !!evalLine.resultText;
          const isError = !!evalLine && evalLine.hasError;
          const isCopied = copiedLine === lineNum;
          const isComment =
            lineText.trim().startsWith('//') ||
            lineText.trim().startsWith('#') ||
            lineText.trim().startsWith('/*');
          const isActive = activeLineIdx === idx;

          return (
            <View
              key={idx}
              style={[
                styles.rowWrapper,
                isRTL && styles.rtlRow,
                isActive && {
                  backgroundColor: isDarkMode
                    ? 'rgba(0, 242, 254, 0.035)'
                    : 'rgba(0, 114, 255, 0.03)',
                },
              ]}
            >
              {/* Line Number Badge (Tap to reference) */}
              <TouchableOpacity
                style={[
                  styles.lineNumBadge,
                  {
                    backgroundColor: isActive
                      ? isDarkMode
                        ? 'rgba(0, 242, 254, 0.14)'
                        : 'rgba(0, 114, 255, 0.12)'
                      : 'transparent',
                  },
                ]}
                onPress={() => handleLineNumPress(lineNum)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.lineNumText,
                    {
                      color: isActive ? theme.accentColor : theme.mutedTextColor,
                    },
                  ]}
                >
                  {lineNum}
                </Text>
              </TouchableOpacity>

              {/* Center Line Text Input */}
              <View style={styles.lineInputBox}>
                <TextInput
                  ref={(ref) => {
                    lineInputRefs.current[idx] = ref;
                  }}
                  style={[
                    styles.lineInput,
                    {
                      color: isComment ? theme.mutedTextColor : theme.textColor,
                      fontStyle: isComment ? 'italic' : 'normal',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  value={lineText}
                  onChangeText={(text) => handleLineChange(idx, text)}
                  onSelectionChange={(e) =>
                    reportCursorPosition(idx, e.nativeEvent.selection.start)
                  }
                  onFocus={() => {
                    setActiveLineIdx(idx);
                    reportCursorPosition(idx, lineText.length);
                  }}
                  onKeyPress={(e) => handleKeyPress(idx, e)}
                  onSubmitEditing={() => handleLineSubmit(idx)}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  multiline={true}
                  scrollEnabled={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  placeholder={getLinePlaceholder(idx)}
                  placeholderTextColor={theme.placeholderColor}
                />
              </View>

              {/* Line Result Chip */}
              <View style={[styles.lineResultBox, isRTL && styles.lineResultBoxRTL]}>
                {hasResult && evalLine && (
                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      {
                        backgroundColor: isError
                          ? isDarkMode
                            ? 'rgba(255, 71, 87, 0.18)'
                            : 'rgba(255, 71, 87, 0.12)'
                          : isDarkMode
                          ? 'rgba(0, 242, 254, 0.12)'
                          : theme.pillActiveBg,
                        borderColor: isError
                          ? theme.dangerColor
                          : isCopied
                          ? theme.memoryColor
                          : isDarkMode
                          ? 'rgba(0, 242, 254, 0.35)'
                          : theme.borderColor,
                      },
                    ]}
                    onPress={() => handleResultPress(lineNum, evalLine.resultText)}
                    activeOpacity={0.7}
                  >
                    {isCopied ? (
                      <View style={[styles.chipCopiedRow, isRTL && styles.rtlRow]}>
                        <Check size={11} color={theme.memoryColor} style={{ marginEnd: 3 }} />
                        <Text style={[styles.resultText, { color: theme.memoryColor }]}>
                          {t.copied}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.resultText,
                          {
                            color: isError ? theme.dangerColor : theme.accentColor,
                            fontFamily: 'Roboto-Bold',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {evalLine.resultText}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* Smart Calculation Guide Card (Shown when sheet is empty to guide user) */}
        {isDocEmpty && (
          <View
            style={[
              styles.emptyGuideCard,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.03)'
                  : theme.cardSubtle,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <View style={[styles.guideHeader, isRTL && styles.rtlRow]}>
              <Sparkles size={16} color={theme.accentColor} style={{ marginEnd: 6 }} />
              <Text style={[styles.guideTitle, { color: theme.textColor }]}>
                {t.quickGuideTitle}
              </Text>
            </View>

            <View style={styles.guideItemsList}>
              <View style={[styles.guideItemRow, isRTL && styles.rtlRow]}>
                <Text style={styles.guideItemIcon}>✍️</Text>
                <Text style={[styles.guideItemText, { color: theme.secondaryTextColor }]}>
                  {t.guideMathText}
                </Text>
              </View>

              <View style={[styles.guideItemRow, isRTL && styles.rtlRow]}>
                <Text style={styles.guideItemIcon}>🔗</Text>
                <Text style={[styles.guideItemText, { color: theme.secondaryTextColor }]}>
                  {t.guideLineRef}
                </Text>
              </View>

              <View style={[styles.guideItemRow, isRTL && styles.rtlRow]}>
                <Text style={styles.guideItemIcon}>💱</Text>
                <Text style={[styles.guideItemText, { color: theme.secondaryTextColor }]}>
                  {t.guideCurrency}
                </Text>
              </View>

              <View style={[styles.guideItemRow, isRTL && styles.rtlRow]}>
                <Text style={styles.guideItemIcon}>🎙️</Text>
                <Text style={[styles.guideItemText, { color: theme.secondaryTextColor }]}>
                  {t.guideAiVoice}
                </Text>
              </View>
            </View>

            {/* Quick Starter Chips */}
            <View style={styles.starterChipsContainer}>
              <Text style={[styles.starterChipsLabel, { color: theme.mutedTextColor }]}>
                {language === 'bn'
                  ? 'শুরু করতে ট্যাপ করুন:'
                  : language === 'ar'
                  ? 'انقر للبدء سريعا:'
                  : 'TAP TO START CALCULATION:'}
              </Text>
              <View style={[styles.starterChipsRow, isRTL && styles.rtlRow]}>
                {starterSuggestions.map((suggestion, sIdx) => (
                  <TouchableOpacity
                    key={sIdx}
                    style={[
                      styles.starterChip,
                      {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.cardColor,
                        borderColor: theme.borderColor,
                      },
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      updateContent(suggestion.content);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.starterChipText, { color: theme.accentColor }]}>
                      {suggestion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Load Sample Note Button */}
            <TouchableOpacity
              style={[
                styles.loadSampleBtn,
                {
                  borderColor: theme.borderColor,
                  backgroundColor: isDarkMode
                    ? 'rgba(0, 242, 254, 0.08)'
                    : 'rgba(2, 132, 199, 0.08)',
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                loadSampleNote();
              }}
              activeOpacity={0.7}
            >
              <BookOpen size={14} color={theme.accentColor} style={{ marginEnd: 6 }} />
              <Text style={[styles.loadSampleText, { color: theme.accentColor }]}>
                {t.loadSample}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Add Line Row */}
        <TouchableOpacity
          style={[
            styles.addLineRow,
            isRTL && styles.rtlRow,
            {
              borderColor: theme.borderColor,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : theme.cardSubtle,
            },
          ]}
          onPress={handleAddLine}
          activeOpacity={0.7}
        >
          <Plus size={14} color={theme.accentColor} style={{ marginEnd: 6 }} />
          <Text style={[styles.addLineText, { color: theme.accentColor }]}>
            {t.addLine}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  editorWrapper: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    minHeight: '100%',
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 38,
  },
  lineNumBadge: {
    width: 28,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginEnd: 4,
  },
  lineNumText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  lineInputBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  lineInput: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 0,
    margin: 0,
  },
  lineResultBox: {
    minWidth: 88,
    maxWidth: 130,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 2,
    paddingHorizontal: 4,
  },
  lineResultBoxRTL: {
    alignItems: 'flex-start',
  },
  resultChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCopiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  addLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addLineText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
  },
  emptyGuideCard: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  guideItemsList: {
    gap: 9,
    marginBottom: 14,
  },
  guideItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideItemIcon: {
    fontSize: 15,
    width: 22,
    textAlign: 'center',
  },
  guideItemText: {
    fontSize: 12.5,
    fontFamily: 'Roboto-Medium',
    flex: 1,
    lineHeight: 18,
  },
  starterChipsContainer: {
    marginTop: 6,
    marginBottom: 14,
  },
  starterChipsLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  starterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  starterChipText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  loadSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadSampleText: {
    fontSize: 12.5,
    fontFamily: 'Roboto-Bold',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});
