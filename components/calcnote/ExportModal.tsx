import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCalcNote } from '@/context/CalcNoteContext';
import {
  exportNoteAsPdf,
  exportNoteAsImage,
  exportNoteAsText,
  formatReceiptText,
  generateWebReceiptPng,
  generateWebPdf,
  isPrintAvailable,
  isViewShotAvailable,
} from '@/utils/documentExport';
import { showInterstitialAd } from '@/utils/adMobService';
import { AnalyticsEvents } from '@/utils/analyticsService';
import {
  FileText,
  Image as ImageIcon,
  Share2,
  X,
  CheckCircle2,
  Copy,
  Receipt,
  ArrowLeft,
  Check,
  Download,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type ExportModalProps = {
  visible: boolean;
  onClose: () => void;
  editorViewRef?: any;
};

type ViewMode = 'menu' | 'receipt' | 'document';

export default function ExportModal({ visible, onClose, editorViewRef }: ExportModalProps) {
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  const { activeDoc, evaluation } = useCalcNote();

  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [loadingType, setLoadingType] = useState<'pdf' | 'img' | 'txt' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [sharingReceipt, setSharingReceipt] = useState(false);
  const [sharingDocument, setSharingDocument] = useState(false);

  const receiptCardRef = useRef<any>(null);

  const handleClose = () => {
    setViewMode('menu');
    setFeedbackMsg(null);
    setCopiedReceipt(false);
    onClose();
  };

  const handleExportPdf = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoadingType('pdf');
    try {
      AnalyticsEvents.logExportNote('pdf');
      if (Platform.OS === 'web') {
        const res = await exportNoteAsPdf({
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        setFeedbackMsg(res.message);
      } else {
        // Open document preview in app - never pops up unprompted text share
        setViewMode('document');
      }
      showInterstitialAd();
    } finally {
      setLoadingType(null);
    }
  };

  const handleExportImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoadingType('img');
    try {
      AnalyticsEvents.logExportNote('png');
      if (Platform.OS === 'web') {
        const res = await exportNoteAsImage(null, {
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        setFeedbackMsg(res.message);
      } else {
        // Open digital receipt card in app - never pops up unprompted text share
        setViewMode('receipt');
      }
      showInterstitialAd();
    } finally {
      setLoadingType(null);
    }
  };

  const handleExportText = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoadingType('txt');
    try {
      AnalyticsEvents.logExportNote('text');
      const res = await exportNoteAsText({
        title: activeDoc.title,
        evaluation,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showInterstitialAd();
      setFeedbackMsg(res.message);
      setTimeout(() => {
        setFeedbackMsg(null);
        handleClose();
      }, 2000);
    } finally {
      setLoadingType(null);
    }
  };

  const handleShareReceiptAction = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSharingReceipt(true);
    try {
      if (Platform.OS === 'web') {
        await generateWebReceiptPng({
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        setFeedbackMsg('PNG receipt downloaded to files!');
        showInterstitialAd();
        return;
      }

      if (isViewShotAvailable()) {
        const res = await exportNoteAsImage(receiptCardRef, {
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        if (res.success) {
          showInterstitialAd();
          return;
        }
      }

      // Explicit text share when native image capturing is unavailable
      const receipt = formatReceiptText({
        title: activeDoc.title,
        evaluation,
      });
      await Share.share({
        title: `${activeDoc.title} Receipt`,
        message: receipt,
      });
      showInterstitialAd();
    } finally {
      setSharingReceipt(false);
    }
  };

  const handleShareDocumentAction = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSharingDocument(true);
    try {
      if (Platform.OS === 'web') {
        await generateWebPdf({
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        showInterstitialAd();
        return;
      }

      if (isPrintAvailable()) {
        const res = await exportNoteAsPdf({
          title: activeDoc.title,
          evaluation,
          themeAccentColor: theme.accentColor,
          isDarkMode,
        });
        if (res.success) {
          showInterstitialAd();
          return;
        }
      }

      // Explicit text share when native PDF is unavailable
      const receipt = formatReceiptText({
        title: activeDoc.title,
        evaluation,
      });
      await Share.share({
        title: `${activeDoc.title} Document`,
        message: receipt,
      });
      showInterstitialAd();
    } finally {
      setSharingDocument(false);
    }
  };

  const handleCopyCurrentReceipt = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const receipt = formatReceiptText({
      title: activeDoc.title,
      evaluation,
    });

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(receipt);
    } else {
      await Share.share({
        title: `${activeDoc.title} Receipt`,
        message: receipt,
      });
    }

    showInterstitialAd();
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const exportOptions = [
    {
      type: 'pdf' as const,
      title: t.printPdf,
      desc: t.printPdfDesc,
      icon: FileText,
      action: handleExportPdf,
    },
    {
      type: 'img' as const,
      title: t.visualReceipt,
      desc: t.visualReceiptDesc,
      icon: ImageIcon,
      action: handleExportImage,
    },
    {
      type: 'txt' as const,
      title: t.plainText,
      desc: t.plainTextDesc,
      icon: Share2,
      action: handleExportText,
    },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.cardColor, borderColor: theme.glassBorder },
          ]}
        >
          {viewMode === 'menu' && (
            <>
              {/* Menu Header */}
              <View style={[styles.header, isRTL && styles.rtlRow]}>
                <View>
                  <Text style={[styles.title, { color: theme.textColor }]}>
                    {t.exportModalTitle}
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
                    {activeDoc.title.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={handleClose}
                >
                  <X size={18} color={theme.secondaryTextColor} />
                </TouchableOpacity>
              </View>

              {/* Feedback Success Notification */}
              {feedbackMsg && (
                <View
                  style={[
                    styles.feedbackBanner,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(0, 242, 254, 0.12)'
                        : 'rgba(0, 114, 255, 0.1)',
                      borderColor: theme.accentColor,
                    },
                  ]}
                >
                  <CheckCircle2 size={16} color={theme.accentColor} style={{ marginRight: 8 }} />
                  <Text style={[styles.feedbackText, { color: theme.textColor }]}>
                    {feedbackMsg}
                  </Text>
                </View>
              )}

              {/* Options */}
              <View style={styles.optionsList}>
                {exportOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const isLoading = loadingType === opt.type;

                  return (
                    <TouchableOpacity
                      key={opt.type}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isDarkMode
                            ? 'rgba(255, 255, 255, 0.04)'
                            : theme.cardSubtle,
                          borderColor: theme.borderColor,
                        },
                      ]}
                      onPress={opt.action}
                      disabled={loadingType !== null}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconBackdrop,
                          { backgroundColor: theme.pillActiveBg },
                        ]}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={theme.accentColor} />
                        ) : (
                          <IconComp size={20} color={theme.accentColor} />
                        )}
                      </View>

                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionTitle, { color: theme.textColor }]}>
                          {opt.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: theme.secondaryTextColor }]}>
                          {opt.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {viewMode === 'receipt' && (
            <View style={styles.receiptWrapper}>
              {/* Receipt Navigation Bar */}
              <View style={[styles.viewHeader, isRTL && styles.rtlRow]}>
                <TouchableOpacity
                  style={[styles.backBtn, { backgroundColor: theme.cardSubtle }, isRTL && styles.rtlRow]}
                  onPress={() => setViewMode('menu')}
                >
                  <ArrowLeft size={16} color={theme.textColor} style={{ marginHorizontal: 4 }} />
                  <Text style={[styles.backBtnText, { color: theme.textColor }]}>{t.back}</Text>
                </TouchableOpacity>
                <Text style={[styles.receiptViewTitle, { color: theme.textColor }]}>
                  {t.digitalReceiptTitle}
                </Text>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={handleClose}
                >
                  <X size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>
              </View>

              {/* Receipt Paper Card */}
              <View
                ref={receiptCardRef}
                collapsable={false}
                style={[
                  styles.receiptCard,
                  {
                    backgroundColor: isDarkMode ? '#080C14' : '#F8FAFC',
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <View style={styles.receiptInner}>
                  <Text style={[styles.receiptBrand, { color: theme.accentColor }]}>
                    CALCNOTE EVOLUTION
                  </Text>
                  <Text style={[styles.receiptSubtitle, { color: theme.secondaryTextColor }]}>
                    OFFICIAL CALCULATION RECEIPT
                  </Text>
                  <Text style={[styles.receiptDocTitle, { color: theme.textColor }]}>
                    {activeDoc.title}
                  </Text>
                  <Text style={[styles.receiptMetaDate, { color: theme.mutedTextColor }]}>
                    {new Date().toLocaleString()}
                  </Text>

                  {/* Dashed Separator */}
                  <View style={[styles.dashedLine, { borderColor: theme.borderColor }]} />

                  {/* Table Header */}
                  <View style={styles.receiptRowHeader}>
                    <Text style={[styles.rcNumHead, { color: theme.secondaryTextColor }]}>#</Text>
                    <Text style={[styles.rcTextHead, { color: theme.secondaryTextColor }]}>
                      ITEM / EQUATION
                    </Text>
                    <Text style={[styles.rcValHead, { color: theme.secondaryTextColor }]}>
                      AMOUNT
                    </Text>
                  </View>

                  {/* Items List */}
                  <ScrollView
                    style={styles.receiptScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {evaluation.lines.map((l) => {
                      if (l.isComment && !l.rawText.trim()) return null;
                      return (
                        <View key={l.lineNumber} style={styles.rcItemRow}>
                          <Text style={[styles.rcItemNum, { color: theme.mutedTextColor }]}>
                            {l.lineNumber}
                          </Text>
                          <Text
                            style={[
                              styles.rcItemText,
                              { color: l.isComment ? theme.mutedTextColor : theme.textColor },
                              l.isComment && { fontStyle: 'italic' },
                            ]}
                            numberOfLines={2}
                          >
                            {l.rawText}
                          </Text>
                          <Text
                            style={[
                              styles.rcItemVal,
                              {
                                color: l.hasError
                                  ? theme.dangerColor
                                  : l.resultText
                                  ? theme.accentColor
                                  : 'transparent',
                              },
                            ]}
                          >
                            {l.resultText || '—'}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Dashed Separator */}
                  <View style={[styles.dashedLine, { borderColor: theme.borderColor }]} />

                  {/* Grand Total Footer */}
                  <View style={styles.receiptTotalContainer}>
                    <Text style={[styles.rcTotalLabel, { color: theme.secondaryTextColor }]}>
                      GRAND TOTAL (NET)
                    </Text>
                    <Text style={[styles.rcTotalValue, { color: theme.textColor }]}>
                      {evaluation.formattedGrandTotal}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.receiptActionsRow}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: theme.accentColor }]}
                  onPress={handleShareReceiptAction}
                  disabled={sharingReceipt}
                  activeOpacity={0.8}
                >
                  {sharingReceipt ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : Platform.OS === 'web' ? (
                    <Download size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : isViewShotAvailable() ? (
                    <ImageIcon size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : (
                    <Share2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.primaryActionText}>
                    {Platform.OS === 'web'
                      ? t.downloadPng
                      : isViewShotAvailable()
                      ? 'Share PNG'
                      : t.share}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { borderColor: theme.borderColor }]}
                  onPress={handleCopyCurrentReceipt}
                  activeOpacity={0.8}
                >
                  {copiedReceipt ? (
                    <Check size={15} color={theme.accentColor} style={{ marginRight: 6 }} />
                  ) : (
                    <Copy size={15} color={theme.textColor} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[styles.secondaryActionText, { color: theme.textColor }]}>
                    {copiedReceipt ? t.copied : t.copy}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {viewMode === 'document' && (
            <View style={styles.receiptWrapper}>
              {/* Document Navigation Bar */}
              <View style={[styles.viewHeader, isRTL && styles.rtlRow]}>
                <TouchableOpacity
                  style={[styles.backBtn, { backgroundColor: theme.cardSubtle }, isRTL && styles.rtlRow]}
                  onPress={() => setViewMode('menu')}
                >
                  <ArrowLeft size={16} color={theme.textColor} style={{ marginHorizontal: 4 }} />
                  <Text style={[styles.backBtnText, { color: theme.textColor }]}>{t.back}</Text>
                </TouchableOpacity>
                <Text style={[styles.receiptViewTitle, { color: theme.textColor }]}>
                  {t.documentSheetTitle}
                </Text>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: theme.cardSubtle }]}
                  onPress={handleClose}
                >
                  <X size={16} color={theme.secondaryTextColor} />
                </TouchableOpacity>
              </View>

              {/* Document Sheet Preview */}
              <View
                style={[
                  styles.docSheetCard,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <View style={[styles.docSheetHeader, isRTL && styles.rtlRow]}>
                  <View>
                    <Text style={[styles.docSheetBadge, { color: theme.accentColor }]}>
                      CALCNOTE REPORT
                    </Text>
                    <Text style={[styles.docSheetTitle, { color: theme.textColor }]}>
                      {activeDoc.title}
                    </Text>
                  </View>
                  <Text style={[styles.docSheetDate, { color: theme.secondaryTextColor }]}>
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>

                <View style={[styles.docSheetDivider, { backgroundColor: theme.glassBorder }]} />

                {/* Table */}
                <ScrollView style={styles.docSheetScroll} showsVerticalScrollIndicator={false}>
                  {evaluation.lines.map((l) => (
                    <View key={l.lineNumber} style={[styles.docSheetRow, isRTL && styles.rtlRow]}>
                      <Text style={[styles.dsNum, { color: theme.mutedTextColor }]}>
                        {l.lineNumber}
                      </Text>
                      <Text
                        style={[
                          styles.dsText,
                          { color: l.isComment ? theme.mutedTextColor : theme.textColor },
                          l.isComment && { fontStyle: 'italic' },
                        ]}
                      >
                        {l.rawText || '—'}
                      </Text>
                      <Text
                        style={[
                          styles.dsVal,
                          {
                            color: l.hasError
                              ? theme.dangerColor
                              : l.resultText
                              ? theme.accentColor
                              : 'transparent',
                          },
                        ]}
                      >
                        {l.resultText || ''}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={[styles.docSheetDivider, { backgroundColor: theme.glassBorder }]} />

                {/* Summary */}
                <View style={[styles.docSheetSummary, isRTL && styles.rtlRow]}>
                  <Text style={[styles.dsSumLabel, { color: theme.secondaryTextColor }]}>
                    {t.grandTotal}
                  </Text>
                  <Text style={[styles.dsSumVal, { color: theme.textColor }]}>
                    {evaluation.formattedGrandTotal}
                  </Text>
                </View>
              </View>

              {/* Document Actions */}
              <View style={[styles.receiptActionsRow, isRTL && styles.rtlRow]}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: theme.accentColor }]}
                  onPress={handleShareDocumentAction}
                  disabled={sharingDocument}
                  activeOpacity={0.8}
                >
                  {sharingDocument ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : Platform.OS === 'web' ? (
                    <FileText size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : isPrintAvailable() ? (
                    <FileText size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  ) : (
                    <Share2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.primaryActionText}>
                    {Platform.OS === 'web'
                      ? t.printPdfButton
                      : isPrintAvailable()
                      ? 'Share PDF'
                      : t.share}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { borderColor: theme.borderColor }]}
                  onPress={handleCopyCurrentReceipt}
                  activeOpacity={0.8}
                >
                  {copiedReceipt ? (
                    <Check size={15} color={theme.accentColor} style={{ marginRight: 6 }} />
                  ) : (
                    <Copy size={15} color={theme.textColor} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[styles.secondaryActionText, { color: theme.textColor }]}>
                    {copiedReceipt ? t.copied : t.copy}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
  },
  iconBackdrop: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  optionDesc: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  receiptWrapper: {
    width: '100%',
  },
  viewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  receiptViewTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  receiptInner: {
    alignItems: 'center',
  },
  receiptBrand: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.5,
  },
  receiptSubtitle: {
    fontSize: 9,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  receiptDocTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    marginTop: 6,
    textAlign: 'center',
  },
  receiptMetaDate: {
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
    marginTop: 2,
  },
  dashedLine: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptRowHeader: {
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 4,
  },
  rcNumHead: {
    width: 24,
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  rcTextHead: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  rcValHead: {
    width: 80,
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    textAlign: 'right',
  },
  receiptScroll: {
    maxHeight: 220,
    width: '100%',
  },
  rcItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rcItemNum: {
    width: 24,
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  rcItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    paddingRight: 6,
  },
  rcItemVal: {
    width: 84,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    textAlign: 'right',
  },
  receiptTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  rcTotalLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.5,
  },
  rcTotalValue: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  receiptActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  docSheetCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  docSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docSheetBadge: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1,
  },
  docSheetTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    marginTop: 2,
  },
  docSheetDate: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  docSheetDivider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
  docSheetScroll: {
    maxHeight: 220,
  },
  docSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dsNum: {
    width: 24,
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  dsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  dsVal: {
    width: 80,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
    textAlign: 'right',
  },
  docSheetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  dsSumLabel: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.5,
  },
  dsSumVal: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});
