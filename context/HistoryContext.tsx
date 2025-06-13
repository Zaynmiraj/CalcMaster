import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
  mode: 'standard' | 'scientific';
};

type HistoryContextType = {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
  clearHistory: () => void;
  historyRetentionDays: number;
  setHistoryRetentionDays: (days: number) => void;
};

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  historyRetentionDays: 30,
  setHistoryRetentionDays: () => {},
});

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyRetentionDays, setHistoryRetentionDays] = useState(30);

  // Load history from storage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('calculatorHistory');
        const savedRetention = await AsyncStorage.getItem('historyRetentionDays');
        
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
        
        if (savedRetention) {
          setHistoryRetentionDays(parseInt(savedRetention, 10));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    
    loadHistory();
  }, []);

  // Save history to storage when it changes
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('calculatorHistory', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving history:', error);
      }
    };
    
    saveHistory();
  }, [history]);

  // Save retention days when it changes
  useEffect(() => {
    const saveRetention = async () => {
      try {
        await AsyncStorage.setItem('historyRetentionDays', historyRetentionDays.toString());
      } catch (error) {
        console.error('Error saving retention days:', error);
      }
    };
    
    saveRetention();
  }, [historyRetentionDays]);

  // Clean up old history entries based on retention policy
  useEffect(() => {
    if (historyRetentionDays > 0) {
      const now = Date.now();
      const retentionMs = historyRetentionDays * 24 * 60 * 60 * 1000;
      const cutoffTime = now - retentionMs;
      
      const filteredHistory = history.filter(item => item.timestamp >= cutoffTime);
      
      if (filteredHistory.length < history.length) {
        setHistory(filteredHistory);
      }
    }
  }, [history, historyRetentionDays]);

  const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      timestamp: Date.now(),
    };
    
    setHistory(prev => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        historyRetentionDays,
        setHistoryRetentionDays,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);