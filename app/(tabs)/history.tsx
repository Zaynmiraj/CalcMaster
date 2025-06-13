import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useHistory } from '@/context/HistoryContext';
import { useCalculator } from '@/context/CalculatorContext';
import { Trash2, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import HistoryItem from '@/components/history/HistoryItem';
import EmptyState from '@/components/common/EmptyState';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { history, clearHistory } = useHistory();
  const { setExpression } = useCalculator();
  const [groupedHistory, setGroupedHistory] = useState<any>({});

  useEffect(() => {
    // Group history items by date
    const grouped = history.reduce((acc: any, item) => {
      const date = new Date(item.timestamp);
      const dateString = date.toLocaleDateString();
      
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      
      acc[dateString].push(item);
      return acc;
    }, {});
    
    setGroupedHistory(grouped);
  }, [history]);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all calculation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearHistory() }
      ]
    );
  };

  const handleUseExpression = (expression: string, result: string) => {
    setExpression(result);
  };

  const renderHistoryGroup = ({ item }: { item: { date: string, items: any[] }}) => (
    <View style={styles.groupContainer}>
      <Text style={[styles.dateHeader, { color: theme.textColor }]}>
        {item.date}
      </Text>
      {item.items.map((historyItem, index) => (
        <HistoryItem 
          key={index}
          item={historyItem} 
          onPress={() => handleUseExpression(historyItem.expression, historyItem.result)}
        />
      ))}
    </View>
  );

  const groupedHistoryArray = Object.entries(groupedHistory).map(([date, items]) => ({
    date,
    items
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <Trash2 size={22} color={theme.dangerColor} />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <EmptyState
          icon={<Clock size={64} color={theme.secondaryTextColor} />}
          title="No History Yet"
          message="Your calculation history will appear here."
        />
      ) : (
        <FlatList
          data={groupedHistoryArray}
          renderItem={renderHistoryGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  groupContainer: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
});