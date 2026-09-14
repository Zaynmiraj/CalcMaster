import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useHistory, HistoryItem as HistoryItemType } from '@/context/HistoryContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useCalcNote } from '@/context/CalcNoteContext';
import { evaluateDocument } from '@/utils/calcNoteEngine';
import {
  Trash2,
  Search,
  X,
  History as HistoryIcon,
  Hash,
  Sparkles,
  FileEdit,
  Calculator,
  Layers,
} from 'lucide-react-native';
import HistoryItem from '@/components/history/HistoryItem';
import EmptyState from '@/components/common/EmptyState';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerAdView } from '@/components/ads/BannerAdView';

type GroupedHistory = {
  title: string;
  items: HistoryItemType[];
};

export default function HistoryScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { t, isRTL } = useLanguage();
  const {
    clearHistory,
    deleteHistoryItem,
    searchQuery,
    setSearchQuery,
    history,
    loadSampleHistory,
  } = useHistory();
  const { setExpression, hapticsEnabled } = useCalculator();
  const { documents, selectDocument, loadSampleNote } = useCalcNote();

  const [filterTab, setFilterTab] = useState<'all' | 'calcnote' | 'keypad'>('all');

  // Dynamically extract evaluated equations from all saved Smart Notepad documents
  const calcNoteItems: HistoryItemType[] = useMemo(() => {
    const items: HistoryItemType[] = [];
    documents.forEach((doc) => {
      const evalResult = evaluateDocument(doc.content);
      evalResult.lines.forEach((line) => {
        if (line.resultText && !line.hasError && !line.isComment && line.rawText.trim()) {
          items.push({
            id: `calcnote-${doc.id}-L${line.lineNumber}`,
            expression: line.rawText.trim(),
            formattedExpression: line.rawText.trim(),
            result: line.resultText,
            timestamp: doc.updatedAt || Date.now(),
            mode: 'calcnote',
            docId: doc.id,
            docTitle: doc.title,
            lineNumber: line.lineNumber,
          });
        }
      });
    });
    return items;
  }, [documents]);

  // Combined history sorted by timestamp descending
  const allHistoryItems = useMemo(() => {
    const combined = [...history, ...calcNoteItems];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, calcNoteItems]);

  // Items filtered by current tab (All, Notepad, Keypad)
  const tabFilteredItems = useMemo(() => {
    if (filterTab === 'calcnote') return calcNoteItems.sort((a, b) => b.timestamp - a.timestamp);
    if (filterTab === 'keypad') return history.sort((a, b) => b.timestamp - a.timestamp);
    return allHistoryItems;
  }, [filterTab, calcNoteItems, history, allHistoryItems]);

  // Items filtered by search query
  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredItems;
    const q = searchQuery.toLowerCase();
    return tabFilteredItems.filter(
      (item) =>
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        item.formattedExpression.toLowerCase().includes(q) ||
        (item.docTitle && item.docTitle.toLowerCase().includes(q))
    );
  }, [tabFilteredItems, searchQuery]);

  // Group by relative date (Today, Yesterday, Date)
  const groupedSections: GroupedHistory[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, HistoryItemType[]> = {};

    searchFilteredItems.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);

      let title = '';
      if (itemDate.getTime() === today.getTime()) {
        title = t.today;
      } else if (itemDate.getTime() === yesterday.getTime()) {
        title = t.yesterday;
      } else {
        title = itemDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: itemDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(item);
    });

    return Object.entries(groups).map(([title, items]) => ({
      title,
      items,
    }));
  }, [searchFilteredItems, t.today, t.yesterday]);

  // Calculations computed today
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allHistoryItems.filter((item) => {
      const d = new Date(item.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;
  }, [allHistoryItems]);

  const handleClearHistory = () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      t.purgeConfirmTitle || 'Clear Ledger',
      t.purgeConfirmMsg || 'Are you sure you want to permanently erase all saved keypad calculation history?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.clear,
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web' && hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            clearHistory();
          },
        },
      ]
    );
  };

  const handleUseResult = (item: HistoryItemType) => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.selectionAsync();
    }
    if (item.mode === 'calcnote' && item.docId) {
      selectDocument(item.docId);
      router.push({ pathname: '/(tabs)', params: { mode: 'notepad' } });
    } else {
      setExpression(item.result);
      router.push({ pathname: '/(tabs)', params: { mode: 'keypad' } });
    }
  };

  const renderSection = ({ item }: { item: GroupedHistory }) => (
    <View style={styles.sectionContainer}>
      <View style={[styles.sectionHeaderRow, isRTL && styles.rtlRow]}>
        <View style={[styles.sectionDot, { backgroundColor: theme.accentColor }]} />
        <Text style={[styles.sectionTitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
          {item.title}
        </Text>
      </View>
      {item.items.map((historyItem) => (
        <HistoryItem
          key={historyItem.id}
          item={historyItem}
          onPress={() => handleUseResult(historyItem)}
          onDelete={historyItem.mode !== 'calcnote' ? () => deleteHistoryItem(historyItem.id) : undefined}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      {/* Ambient background light */}
      {isDarkMode && (
        <View style={styles.ambientGlowContainer} pointerEvents="none">
          <LinearGradient
            colors={[theme.accentGlow, 'transparent']}
            style={styles.ambientTopOrb}
          />
        </View>
      )}

      <View style={styles.container}>
        {/* Top Header */}
        <View style={[styles.header, isRTL && styles.rtlRow]}>
          <View style={isRTL && { alignItems: 'flex-end' }}>
            <Text style={[styles.pageTitle, { color: theme.textColor }, isRTL && styles.rtlText]}>
              Calculation Tape
            </Text>
            <Text style={[styles.pageSubtitle, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
              PERPETUAL LEDGER & HISTORY
            </Text>
          </View>

          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              style={[
                styles.clearButton,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 71, 87, 0.14)'
                    : 'rgba(255, 71, 87, 0.1)',
                  borderColor: theme.dangerColor,
                },
                isRTL && styles.rtlRow,
              ]}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={theme.dangerColor} style={{ marginEnd: 5 }} />
              <Text style={[styles.clearButtonText, { color: theme.dangerColor }]}>
                {t.clear}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Segment Tabs */}
        {allHistoryItems.length > 0 && (
          <View
            style={[
              styles.filterSegmentContainer,
              {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.cardSubtle,
                borderColor: theme.glassBorder,
              },
              isRTL && styles.rtlRow,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterTabBtn,
                filterTab === 'all' && [
                  styles.filterTabBtnActive,
                  { backgroundColor: theme.pillActiveBg, borderColor: theme.accentColor },
                ],
                isRTL && styles.rtlRow,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setFilterTab('all');
              }}
              activeOpacity={0.7}
            >
              <Layers size={13} color={filterTab === 'all' ? theme.accentColor : theme.secondaryTextColor} style={{ marginEnd: 5 }} />
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filterTab === 'all' ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: filterTab === 'all' ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {t.all} ({allHistoryItems.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTabBtn,
                filterTab === 'calcnote' && [
                  styles.filterTabBtnActive,
                  { backgroundColor: theme.pillActiveBg, borderColor: theme.accentColor },
                ],
                isRTL && styles.rtlRow,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setFilterTab('calcnote');
              }}
              activeOpacity={0.7}
            >
              <FileEdit size={13} color={filterTab === 'calcnote' ? theme.accentColor : theme.secondaryTextColor} style={{ marginEnd: 5 }} />
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filterTab === 'calcnote' ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: filterTab === 'calcnote' ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {t.smartNotepad} ({calcNoteItems.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTabBtn,
                filterTab === 'keypad' && [
                  styles.filterTabBtnActive,
                  { backgroundColor: theme.pillActiveBg, borderColor: theme.accentColor },
                ],
                isRTL && styles.rtlRow,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setFilterTab('keypad');
              }}
              activeOpacity={0.7}
            >
              <Calculator size={13} color={filterTab === 'keypad' ? theme.accentColor : theme.secondaryTextColor} style={{ marginEnd: 5 }} />
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filterTab === 'keypad' ? theme.accentColor : theme.secondaryTextColor,
                    fontFamily: filterTab === 'keypad' ? 'Roboto-Bold' : 'Roboto-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {t.keypadCalc} ({history.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bento Stats Row */}
        {allHistoryItems.length > 0 && (
          <View style={[styles.statsRow, isRTL && styles.rtlRow]}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardColor,
                  borderColor: theme.glassBorder,
                },
                isRTL && styles.rtlRow,
              ]}
            >
              <View style={[styles.statIconBadge, { backgroundColor: theme.pillActiveBg }]}>
                <Hash size={16} color={theme.accentColor} />
              </View>
              <View style={isRTL && { alignItems: 'flex-end' }}>
                <Text style={[styles.statValue, { color: theme.textColor }, isRTL && styles.rtlText]}>
                  {allHistoryItems.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                  {t.totalCalculations}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardColor,
                  borderColor: theme.glassBorder,
                },
                isRTL && styles.rtlRow,
              ]}
            >
              <View
                style={[
                  styles.statIconBadge,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(0, 245, 160, 0.15)'
                      : 'rgba(5, 150, 105, 0.12)',
                  },
                ]}
              >
                <Sparkles size={16} color={theme.memoryColor} />
              </View>
              <View style={isRTL && { alignItems: 'flex-end' }}>
                <Text style={[styles.statValue, { color: theme.textColor }, isRTL && styles.rtlText]}>
                  {todayCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.secondaryTextColor }, isRTL && styles.rtlText]}>
                  {t.today}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Frosted Glass Search Bar */}
        {allHistoryItems.length > 0 && (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : theme.cardSubtle,
                borderColor: theme.glassBorder,
              },
              isRTL && styles.rtlRow,
            ]}
          >
            <Search size={16} color={theme.secondaryTextColor} style={{ marginEnd: 10 }} />
            <TextInput
              style={[
                styles.searchInput,
                { color: theme.textColor },
                isRTL && styles.rtlText,
              ]}
              placeholder={t.searchHistoryPlaceholder}
              placeholderTextColor={theme.placeholderColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={15} color={theme.secondaryTextColor} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* List Content */}
        {allHistoryItems.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon size={44} color={theme.accentColor} />}
            title={t.ledgerEmptyTitle}
            message={t.ledgerEmptyDesc}
            actionLabel={t.startCalculating}
            onAction={() => router.push('/(tabs)')}
            secondaryActionLabel={t.loadDemoCalculations}
            onSecondaryAction={() => {
              if (Platform.OS !== 'web' && hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              loadSampleNote();
              loadSampleHistory();
            }}
          />
        ) : searchFilteredItems.length === 0 ? (
          <EmptyState
            icon={<Search size={44} color={theme.secondaryTextColor} />}
            title={t.zeroMatches}
            message={`No equations matched "${searchQuery}".`}
            actionLabel={t.clearFilter}
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <FlatList
            data={groupedSections}
            renderItem={renderSection}
            keyExtractor={(item) => item.title}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* AdMob Adaptive Banner */}
        <BannerAdView style={{ marginTop: 6, marginBottom: 2 }} />
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
    top: -100,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.3,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  filterSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    gap: 4,
    marginBottom: 10,
  },
  filterTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabBtnActive: {
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 8,
  },
  statValue: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: 'Roboto-Regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Roboto-Regular',
    paddingVertical: 2,
  },
  listContent: {
    paddingBottom: 130, // clearance for floating dock
  },
  sectionContainer: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginEnd: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
