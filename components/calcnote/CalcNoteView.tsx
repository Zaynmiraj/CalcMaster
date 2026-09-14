import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCalcNote } from '@/context/CalcNoteContext';
import NotepadEditor from './NotepadEditor';
import MathAccessoryBar from './MathAccessoryBar';
import DocumentsSheet from './DocumentsSheet';
import ExportModal from './ExportModal';
import VoiceDictationModal from './VoiceDictationModal';
import AISummaryModal from './AISummaryModal';
import NoteOptionsSheet from './NoteOptionsSheet';
import {
  FolderOpen,
  Share2,
  Mic,
  Plus,
  Sigma,
  Sparkles,
  ChevronDown,
  Bot,
  RotateCcw,
  ClipboardPaste,
  Check,
  MoreHorizontal,
} from 'lucide-react-native';
import { getClipboardString, setClipboardString } from '@/utils/clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function CalcNoteView() {
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  const { activeDoc, updateContent, evaluation, createDocument, clearCurrentDocument } = useCalcNote();
  const { width: screenWidth } = useWindowDimensions();

  const isSmallScreen = screenWidth < 380;
  const isWideScreen = screenWidth >= 480;

  const [docsSheetVisible, setDocsSheetVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState(activeDoc.content.length);
  const [copiedGrandTotal, setCopiedGrandTotal] = useState(false);

  const handleCopyGrandTotal = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setClipboardString(evaluation.formattedGrandTotal);
    setCopiedGrandTotal(true);
    setTimeout(() => setCopiedGrandTotal(false), 1400);
  };

  const editorInputRef = useRef<TextInput>(null);
  const editorCaptureRef = useRef<View>(null);

  const handleInsertToken = (token: string) => {
    const text = activeDoc.content;
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const next = before + token + after;
    updateContent(next);
    setCursorPos(before.length + token.length);
  };

  const handleVoiceInsert = (mathText: string) => {
    const text = activeDoc.content;
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const separator = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const next = before + separator + mathText + after;
    updateContent(next);
    setCursorPos(next.length);
  };

  const handleCreateNewNote = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    createDocument();
  };

  const handleClearCurrentNote = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!activeDoc.content.trim()) {
      return;
    }
    Alert.alert(
      t.clearNote,
      t.clearNoteConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.clear,
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            clearCurrentDocument();
            setCursorPos(0);
          },
        },
      ]
    );
  };

  const handlePasteIntoNote = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const clipText = await getClipboardString();
    if (!clipText) return;

    const text = activeDoc.content;
    const pos = Math.min(Math.max(0, cursorPos), text.length);
    const before = text.slice(0, pos);
    const after = text.slice(pos);
    const separator = before.length > 0 && !before.endsWith('\n') && clipText.includes('\n') ? '\n' : '';
    const next = before + separator + clipText + after;
    updateContent(next);
    setCursorPos((before + separator + clipText).length);
  };

  return (
    <View style={styles.container}>
        {/* Document Top Bar */}
        <View style={[styles.docHeader, isRTL && styles.rtlRow]}>
          <TouchableOpacity
            style={[
              styles.docPickerBtn,
              isRTL && styles.rtlRow,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : theme.cardSubtle,
                borderColor: theme.glassBorder,
                paddingHorizontal: isSmallScreen ? 8 : 10,
                paddingVertical: isSmallScreen ? 5 : 7,
              },
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setDocsSheetVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.folderIconSquircle,
                {
                  backgroundColor: theme.pillActiveBg,
                  width: isSmallScreen ? 22 : 25,
                  height: isSmallScreen ? 22 : 25,
                  marginEnd: isSmallScreen ? 6 : 8,
                },
              ]}
            >
              <FolderOpen size={isSmallScreen ? 13 : 15} color={theme.accentColor} />
            </View>
            <Text
              style={[
                styles.docTitleText,
                {
                  color: theme.textColor,
                  fontSize: isSmallScreen ? 12.5 : 13.5,
                },
                isRTL && styles.rtlText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeDoc.title}
            </Text>
            <ChevronDown
              size={isSmallScreen ? 12 : 14}
              color={theme.secondaryTextColor}
              style={{ marginStart: 4 }}
            />
          </TouchableOpacity>

          {/* Action Controls */}
          <View
            style={[
              styles.actionButtonsRow,
              isRTL && styles.rtlRow,
              { gap: isSmallScreen ? 4 : 5 },
            ]}
          >
            {/* AI Financial Intelligence Analysis */}
            <TouchableOpacity
              style={[
                styles.actionIconBtn,
                {
                  width: isSmallScreen ? 31 : 34,
                  height: isSmallScreen ? 31 : 34,
                  borderRadius: isSmallScreen ? 9 : 11,
                  backgroundColor: isDarkMode
                    ? 'rgba(168, 85, 247, 0.14)'
                    : 'rgba(168, 85, 247, 0.1)',
                  borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.4)' : '#A855F7',
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAiModalVisible(true);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Sparkles size={isSmallScreen ? 15 : 16} color="#A855F7" />
            </TouchableOpacity>

            {/* Voice Math Dictation */}
            <TouchableOpacity
              style={[
                styles.actionIconBtn,
                {
                  width: isSmallScreen ? 31 : 34,
                  height: isSmallScreen ? 31 : 34,
                  borderRadius: isSmallScreen ? 9 : 11,
                  backgroundColor: isDarkMode
                    ? 'rgba(0, 242, 254, 0.12)'
                    : 'rgba(2, 132, 199, 0.1)',
                  borderColor: theme.glassBorder,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setVoiceModalVisible(true);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Mic size={isSmallScreen ? 15 : 16} color={theme.accentColor} />
            </TouchableOpacity>

            {/* Direct Paste Button (visible on screens >= 380px) */}
            {!isSmallScreen && (
              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    backgroundColor: isDarkMode
                      ? 'rgba(0, 242, 254, 0.12)'
                      : 'rgba(2, 132, 199, 0.1)',
                    borderColor: theme.glassBorder,
                  },
                ]}
                onPress={handlePasteIntoNote}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <ClipboardPaste size={16} color={theme.accentColor} />
              </TouchableOpacity>
            )}

            {/* 1-Tap Create New Note (visible on wide screens / tablets >= 480px) */}
            {isWideScreen && (
              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 11,
                    backgroundColor: isDarkMode
                      ? 'rgba(255, 255, 255, 0.06)'
                      : theme.cardSubtle,
                    borderColor: theme.glassBorder,
                  },
                ]}
                onPress={handleCreateNewNote}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Plus size={16} color={theme.textColor} />
              </TouchableOpacity>
            )}

            {/* More Options / Overflow Menu (always visible) */}
            <TouchableOpacity
              style={[
                styles.actionIconBtn,
                {
                  width: isSmallScreen ? 31 : 34,
                  height: isSmallScreen ? 31 : 34,
                  borderRadius: isSmallScreen ? 9 : 11,
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.07)'
                    : theme.cardSubtle,
                  borderColor: theme.glassBorder,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setOptionsSheetVisible(true);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <MoreHorizontal size={isSmallScreen ? 16 : 17} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Two-Column Notepad & Results View */}
        <View ref={editorCaptureRef} style={styles.editorViewArea} collapsable={false}>
          <NotepadEditor
            editorRef={editorInputRef}
            onSelectionChange={setCursorPos}
          />
        </View>

      {/* Reanimated Custom Math Accessory Bar */}
      <MathAccessoryBar onInsertToken={handleInsertToken} />

      {/* Sticky Grand Total Footer Card */}
      <View
        style={[
          styles.footerSummaryCard,
          {
            backgroundColor: isDarkMode
              ? 'rgba(12, 17, 26, 0.95)'
              : theme.cardColor,
            borderColor: theme.glassBorder,
          },
          isRTL && styles.rtlRow,
        ]}
      >
        <TouchableOpacity
          style={[styles.footerLeft, isRTL && styles.rtlRow]}
          onPress={handleCopyGrandTotal}
          activeOpacity={0.7}
        >
          <View style={[styles.sigmaBadge, { backgroundColor: copiedGrandTotal ? theme.pillActiveBg : theme.pillActiveBg }]}>
            {copiedGrandTotal ? (
              <Check size={16} color={theme.accentColor} strokeWidth={2.5} />
            ) : (
              <Sigma size={16} color={theme.accentColor} />
            )}
          </View>
          <View style={isRTL && { alignItems: 'flex-end' }}>
            <Text style={[styles.grandTotalLabel, { color: copiedGrandTotal ? theme.accentColor : theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              {copiedGrandTotal ? t.copied : `${t.grandTotal} • ${evaluation.solvedCount} ${t.solved}`}
            </Text>
            <Text style={[styles.grandTotalValue, { color: theme.textColor }, isRTL && styles.rtlText]}>
              {evaluation.formattedGrandTotal}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickExportBtn, isRTL && styles.rtlRow, { backgroundColor: theme.accentColor }]}
          onPress={() => setExportModalVisible(true)}
          activeOpacity={0.8}
        >
          <Share2 size={14} color="#FFFFFF" style={{ marginEnd: 6 }} />
          <Text style={styles.quickExportText}>{t.export}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <DocumentsSheet
        visible={docsSheetVisible}
        onClose={() => setDocsSheetVisible(false)}
      />

      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        editorViewRef={editorCaptureRef}
      />

      <VoiceDictationModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onInsertMath={handleVoiceInsert}
      />

      <AISummaryModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />

      <NoteOptionsSheet
        visible={optionsSheetVisible}
        onClose={() => setOptionsSheetVisible(false)}
        onNewNote={handleCreateNewNote}
        onPaste={handlePasteIntoNote}
        onClearNote={handleClearCurrentNote}
        onOpenExport={() => setExportModalVisible(true)}
        onOpenDocsSheet={() => setDocsSheetVisible(true)}
        activeDocTitle={activeDoc.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  docPickerBtn: {
    flex: 1,
    flexShrink: 1,
    minWidth: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginEnd: 8,
  },
  folderIconSquircle: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docTitleText: {
    fontFamily: 'Roboto-Bold',
    flex: 1,
    flexShrink: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionIconBtn: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  editorViewArea: {
    flex: 1,
    marginBottom: 4,
  },
  footerSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sigmaBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 10,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  grandTotalValue: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  quickExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickExportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
