import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { HistoryItem as HistoryItemType } from '@/context/HistoryContext';
import { Calculator, ChevronRight } from 'lucide-react-native';

type HistoryItemProps = {
  item: HistoryItemType;
  onPress: () => void;
};

export default function HistoryItem({ item, onPress }: HistoryItemProps) {
  const { theme } = useTheme();
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.expressionRow}>
          <Text style={[styles.expression, { color: theme.textColor }]}>
            {item.expression}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={[styles.equals, { color: theme.secondaryTextColor }]}>=</Text>
          <Text style={[styles.result, { color: theme.accentColor }]}>
            {item.result}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text style={[styles.time, { color: theme.secondaryTextColor }]}>
            {formatTime(item.timestamp)}
          </Text>
          
          <View style={styles.modeContainer}>
            <Calculator size={14} color={theme.secondaryTextColor} />
            <Text style={[styles.mode, { color: theme.secondaryTextColor }]}>
              {item.mode === 'scientific' ? 'Scientific' : 'Standard'}
            </Text>
          </View>
        </View>
      </View>
      
      <ChevronRight size={20} color={theme.secondaryTextColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  expressionRow: {
    marginBottom: 4,
  },
  expression: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equals: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: 'Roboto-Regular',
  },
  result: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    marginRight: 12,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mode: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    marginLeft: 4,
  },
});