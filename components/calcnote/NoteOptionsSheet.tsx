import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Plus,
  ClipboardPaste,
  Share2,
  FolderOpen,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type NoteOptionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onNewNote: () => void;
  onPaste: () => void;
  onClearNote: () => void;
  onOpenExport: () => void;
  onOpenDocsSheet: () => void;
  activeDocTitle: string;
};

export default function NoteOptionsSheet({
  visible,
  onClose,
  onNewNote,
  onPaste,
  onClearNote,
  onOpenExport,
  onOpenDocsSheet,
  activeDocTitle,
}: NoteOptionsSheetProps) {
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();

  const handleAction = (actionFn: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    setTimeout(() => {
      actionFn();
    }, 150);
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                  borderColor: theme.glassBorder,
                },
              ]}
            >
              {/* Drag Handle Pill */}
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handlePill,
                    { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
                  ]}
                />
              </View>

              {/* Sheet Header */}
              <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
                <View style={styles.headerTitleArea}>
                  <Text style={[styles.titleText, { color: theme.textColor }, isRTL && styles.rtlText]}>
                    {t.noteActions}
                  </Text>
                  <Text
                    style={[styles.subtitleText, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}
                    numberOfLines={1}
                  >
                    {activeDocTitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: theme.glassBorder,
                    },
                  ]}
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={theme.secondaryTextColor} />
                </TouchableOpacity>
              </View>

              {/* Action List */}
              <View style={styles.actionsList}>
                {/* 1. New Calculation Note */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: theme.glassBorder,
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleAction(onNewNote)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(2, 132, 199, 0.14)' }]}>
                    <Plus size={18} color={theme.accentColor} />
                  </View>
                  <View style={[styles.actionTextArea, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.actionTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                      {t.newCalculationNote}
                    </Text>
                    <Text style={[styles.actionDesc, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      {t.newNote}
                    </Text>
                  </View>
                  <ChevronIcon size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>

                {/* 2. Paste from Clipboard */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: theme.glassBorder,
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleAction(onPaste)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                    <ClipboardPaste size={18} color="#10B981" />
                  </View>
                  <View style={[styles.actionTextArea, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.actionTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                      {t.paste}
                    </Text>
                    <Text style={[styles.actionDesc, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      {t.guideMathText}
                    </Text>
                  </View>
                  <ChevronIcon size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>

                {/* 3. Export & Share */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: theme.glassBorder,
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleAction(onOpenExport)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.14)' }]}>
                    <Share2 size={18} color="#A855F7" />
                  </View>
                  <View style={[styles.actionTextArea, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.actionTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                      {t.export}
                    </Text>
                    <Text style={[styles.actionDesc, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      {t.exportModalTitle}
                    </Text>
                  </View>
                  <ChevronIcon size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>

                {/* 4. Document Manager */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: theme.glassBorder,
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleAction(onOpenDocsSheet)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                    <FolderOpen size={18} color="#F59E0B" />
                  </View>
                  <View style={[styles.actionTextArea, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.actionTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
                      {t.documentsSheet}
                    </Text>
                    <Text style={[styles.actionDesc, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      {t.searchDocs}
                    </Text>
                  </View>
                  <ChevronIcon size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>

                {/* 5. Clear Note (Danger) */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.04)',
                      borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
                    },
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleAction(onClearNote)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.14)' }]}>
                    <RotateCcw size={18} color="#EF4444" />
                  </View>
                  <View style={[styles.actionTextArea, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.actionTitle, { color: '#EF4444' }, isRTL && styles.rtlText]}>
                      {t.clearNote}
                    </Text>
                    <Text style={[styles.actionDesc, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                      {t.clearNoteConfirm}
                    </Text>
                  </View>
                  <ChevronIcon size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  headerTitleArea: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginStart: 10,
  },
  actionsList: {
    gap: 8,
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  actionTextArea: {
    flex: 1,
    marginEnd: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
