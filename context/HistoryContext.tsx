import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AngleUnit, formatDisplayExpression } from '@/utils/calculator';

export type HistoryItem = {
  id: string;
  expression: string;
  formattedExpression: string;
  result: string;
  timestamp: number;
  mode: 'standard' | 'scientific' | 'calcnote';
  docId?: string;
  docTitle?: string;
  lineNumber?: number;
  angleUnit?: AngleUnit;
};

type HistoryContextType = {
  history: HistoryItem[];
  filteredHistory: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'formattedExpression'> & { timestamp?: number; formattedExpression?: string }) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  loadSampleHistory: () => void;
  historyRetentionDays: number;
  setHistoryRetentionDays: (days: number) => void;
};

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  filteredHistory: [],
  searchQuery: '',
  setSearchQuery: () => {},
  addToHistory: () => {},
  deleteHistoryItem: () => {},
  clearHistory: () => {},
  loadSampleHistory: () => {},
  historyRetentionDays: 30,
  setHistoryRetentionDays: () => {},
});

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyRetentionDays, setHistoryRetentionDaysState] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load history & preferences from storage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('calculatorHistory');
        const savedRetention = await AsyncStorage.getItem('historyRetentionDays');

        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          // Migrate legacy items that didn't have id or formattedExpression
          const normalized: HistoryItem[] = parsed.map((item: any, idx: number) => ({
            id: item.id || `legacy-${item.timestamp || Date.now()}-${idx}`,
            expression: item.expression,
            formattedExpression: item.formattedExpression || formatDisplayExpression(item.expression),
            result: item.result,
            timestamp: item.timestamp || Date.now(),
            mode: item.mode || 'standard',
            angleUnit: item.angleUnit || 'deg',
          }));
          setHistory(normalized);
        }

        if (savedRetention) {
          setHistoryRetentionDaysState(parseInt(savedRetention, 10));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    loadHistory();
  }, []);

  // Save history to storage
  useEffect(() => {
    AsyncStorage.setItem('calculatorHistory', JSON.stringify(history)).catch(console.error);
  }, [history]);

  // Clean up old history entries based on retention policy
  useEffect(() => {
    if (historyRetentionDays > 0 && history.length > 0) {
      const now = Date.now();
      const retentionMs = historyRetentionDays * 24 * 60 * 60 * 1000;
      const cutoffTime = now - retentionMs;

      const filtered = history.filter((item) => item.timestamp >= cutoffTime);
      if (filtered.length !== history.length) {
        setHistory(filtered);
      }
    }
  }, [historyRetentionDays, history]);

  const setHistoryRetentionDays = async (days: number) => {
    setHistoryRetentionDaysState(days);
    try {
      await AsyncStorage.setItem('historyRetentionDays', days.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const addToHistory = (
    item: Omit<HistoryItem, 'id' | 'timestamp' | 'formattedExpression'> & {
      timestamp?: number;
      formattedExpression?: string;
    }
  ) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      formattedExpression: item.formattedExpression || formatDisplayExpression(item.expression),
      timestamp: item.timestamp || Date.now(),
      mode: item.mode || 'standard',
    };

    setHistory((prev) => [newItem, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const loadSampleHistory = useCallback(() => {
    const now = Date.now();
    const samples: HistoryItem[] = [
      {
        id: `sample-${now}-1`,
        expression: '85 * 12',
        formattedExpression: '85 × 12',
        result: '1,020',
        timestamp: now - 15 * 60 * 1000,
        mode: 'standard',
      },
      {
        id: `sample-${now}-2`,
        expression: '1250 - 15%',
        formattedExpression: '1,250 − 15%',
        result: '1,062.5',
        timestamp: now - 3 * 3600 * 1000,
        mode: 'standard',
      },
      {
        id: `sample-${now}-3`,
        expression: 'sin(30) + sqrt(144)',
        formattedExpression: 'sin(30°) + √(144)',
        result: '12.5',
        timestamp: now - 26 * 3600 * 1000,
        mode: 'scientific',
        angleUnit: 'deg',
      },
    ];

    setHistory((prev) => {
      const existingExprs = new Set(prev.map((i) => i.expression));
      const filteredSamples = samples.filter((s) => !existingExprs.has(s.expression));
      return [...filteredSamples, ...prev];
    });
  }, []);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        item.formattedExpression.toLowerCase().includes(q) ||
        (item.docTitle && item.docTitle.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        filteredHistory,
        searchQuery,
        setSearchQuery,
        addToHistory,
        deleteHistoryItem,
        clearHistory,
        loadSampleHistory,
        historyRetentionDays,
        setHistoryRetentionDays,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);