import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { HistoryItem as HistoryItemType } from '@/context/HistoryContext';
import { useCalculator } from '@/context/CalculatorContext';
import { Calculator, Trash2, Copy, Check, FileEdit } from 'lucide-react-native';
import { setClipboardString } from '@/utils/clipboard';
import * as Haptics from 'expo-haptics';

type HistoryItemProps = {
  item: HistoryItemType;
  onPress: () => void;
  onDelete?: () => void;
};

export default function HistoryItem({ item, onPress, onDelete }: HistoryItemProps) {
  const { theme } = useTheme();
  const { hapticsEnabled } = useCalculator();
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setClipboardString(item.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web' && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDelete?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.cardColor,
          borderColor: theme.borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Meta Header */}
      <View style={styles.metaHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.modeBadge, { backgroundColor: item.mode === 'calcnote' ? theme.pillActiveBg : theme.cardSubtle }]}>
            {item.mode === 'calcnote' ? (
              <FileEdit size={12} color={theme.accentColor} style={{ marginRight: 4 }} />
            ) : (
              <Calculator size={12} color={theme.secondaryTextColor} style={{ marginRight: 4 }} />
            )}
            <Text
              style={[
                styles.modeText,
                { color: item.mode === 'calcnote' ? theme.accentColor : theme.secondaryTextColor },
              ]}
              numberOfLines={1}
            >
              {item.mode === 'calcnote'
                ? (item.docTitle ? `${item.docTitle}${item.lineNumber ? ` • L${item.lineNumber}` : ''}` : 'Smart Note')
                : (item.mode === 'scientific' ? 'Scientific' : 'Standard')}
            </Text>
          </View>

          {item.angleUnit && item.mode === 'scientific' && (
            <View style={[styles.unitBadge, { backgroundColor: theme.pillActiveBg }]}>
              <Text style={[styles.unitText, { color: theme.accentColor }]}>
                {item.angleUnit.toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={[styles.timeText, { color: theme.mutedTextColor }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardSubtle }]}
            onPress={handleCopy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {copied ? (
              <Check size={14} color={theme.memoryColor} />
            ) : (
              <Copy size={14} color={theme.secondaryTextColor} />
            )}
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.cardSubtle }]}
              onPress={handleDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={14} color={theme.dangerColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Expression */}
      <Text style={[styles.expression, { color: theme.secondaryTextColor }]} numberOfLines={2}>
        {item.formattedExpression || item.expression}
      </Text>

      {/* Result */}
      <View style={styles.resultRow}>
        <Text style={[styles.equalsSign, { color: theme.mutedTextColor }]}>=</Text>
        <Text style={[styles.resultText, { color: theme.accentColor }]} numberOfLines={1}>
          {item.result}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  modeText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
  },
  unitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unitText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expression: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  equalsSign: {
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    marginRight: 6,
  },
  resultText: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.5,
  },
});