import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluate } from '@/utils/calculator';
import { useHistory } from './HistoryContext';

type CalculatorContextType = {
  display: string;
  expression: string;
  memory: string;
  error: string | null;
  isScientificMode: boolean;
  lastResult: string;
  toggleScientificMode: () => void;
  setExpression: (expression: string) => void;
  appendToExpression: (value: string) => void;
  clearExpression: () => void;
  deleteLastCharacter: () => void;
  calculateResult: () => void;
  clearMemory: () => void;
  addToMemory: () => void;
  subtractFromMemory: () => void;
  recallMemory: () => void;
  totalUsageTime: number;
  totalCalculations: number;
  trackSessionTime: () => void;
  lastActiveTime: number;
  setLastActiveTime: (time: number) => void;
};

const CalculatorContext = createContext<CalculatorContextType>({
  display: '0',
  expression: '',
  memory: '0',
  error: null,
  isScientificMode: false,
  lastResult: '0',
  toggleScientificMode: () => {},
  setExpression: () => {},
  appendToExpression: () => {},
  clearExpression: () => {},
  deleteLastCharacter: () => {},
  calculateResult: () => {},
  clearMemory: () => {},
  addToMemory: () => {},
  subtractFromMemory: () => {},
  recallMemory: () => {},
  totalUsageTime: 0,
  totalCalculations: 0,
  trackSessionTime: () => {},
  lastActiveTime: 0,
  setLastActiveTime: () => {},
});

export const CalculatorProvider = ({ children }: { children: React.ReactNode }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpressionState] = useState('');
  const [memory, setMemory] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [lastResult, setLastResult] = useState('0');
  const [totalUsageTime, setTotalUsageTime] = useState(0);
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  
  const { addToHistory } = useHistory();

  // Load calculator state from storage
  useEffect(() => {
    const loadCalculatorState = async () => {
      try {
        const savedMemory = await AsyncStorage.getItem('calculatorMemory');
        const savedScientificMode = await AsyncStorage.getItem('isScientificMode');
        const savedTotalUsageTime = await AsyncStorage.getItem('totalUsageTime');
        const savedTotalCalculations = await AsyncStorage.getItem('totalCalculations');
        
        if (savedMemory) {
          setMemory(savedMemory);
        }
        
        if (savedScientificMode !== null) {
          setIsScientificMode(savedScientificMode === 'true');
        }
        
        if (savedTotalUsageTime !== null) {
          setTotalUsageTime(parseInt(savedTotalUsageTime, 10));
        }
        
        if (savedTotalCalculations !== null) {
          setTotalCalculations(parseInt(savedTotalCalculations, 10));
        }
      } catch (error) {
        console.error('Error loading calculator state:', error);
      }
    };
    
    loadCalculatorState();
  }, []);

  // Save calculator state to storage when it changes
  useEffect(() => {
    const saveCalculatorState = async () => {
      try {
        await AsyncStorage.setItem('calculatorMemory', memory);
        await AsyncStorage.setItem('isScientificMode', isScientificMode.toString());
        await AsyncStorage.setItem('totalUsageTime', totalUsageTime.toString());
        await AsyncStorage.setItem('totalCalculations', totalCalculations.toString());
      } catch (error) {
        console.error('Error saving calculator state:', error);
      }
    };
    
    saveCalculatorState();
  }, [memory, isScientificMode, totalUsageTime, totalCalculations]);

  // Update display when expression changes
  useEffect(() => {
    if (expression === '') {
      setDisplay('0');
    } else {
      setDisplay(expression);
    }
    setError(null);
  }, [expression]);

  const toggleScientificMode = () => {
    setIsScientificMode((prev) => !prev);
  };

  const setExpression = (value: string) => {
    setExpressionState(value);
  };

  const appendToExpression = (value: string) => {
    setError(null);
    
    if (expression === '0' && !isNaN(Number(value)) && value !== '.') {
      setExpressionState(value);
    } else if (expression === '0' && value === '.') {
      setExpressionState('0.');
    } else {
      setExpressionState((prev) => prev + value);
    }
  };

  const clearExpression = () => {
    setExpressionState('');
    setError(null);
  };

  const deleteLastCharacter = () => {
    setError(null);
    setExpressionState((prev) => {
      if (prev.length <= 1) {
        return '';
      }
      return prev.slice(0, -1);
    });
  };

  const calculateResult = () => {
    if (!expression) return;
    
    try {
      const result = evaluate(expression);
      
      // Add to history
      addToHistory({
        expression,
        result: result.toString(),
        mode: isScientificMode ? 'scientific' : 'standard',
      });
      
      setLastResult(result.toString());
      setExpressionState(result.toString());
      setTotalCalculations((prev) => prev + 1);
    } catch (err) {
      setError('Error');
    }
  };

  const clearMemory = () => {
    setMemory('0');
  };

  const addToMemory = () => {
    try {
      if (expression) {
        const result = evaluate(expression);
        const newMemory = (parseFloat(memory) + parseFloat(result)).toString();
        setMemory(newMemory);
      }
    } catch (err) {
      setError('Error');
    }
  };

  const subtractFromMemory = () => {
    try {
      if (expression) {
        const result = evaluate(expression);
        const newMemory = (parseFloat(memory) - parseFloat(result)).toString();
        setMemory(newMemory);
      }
    } catch (err) {
      setError('Error');
    }
  };

  const recallMemory = () => {
    if (memory !== '0') {
      setExpressionState(memory);
    }
  };

  const trackSessionTime = () => {
    const now = Date.now();
    const timeDiff = now - lastActiveTime;
    const minutesDiff = Math.floor(timeDiff / 60000); // Convert to minutes
    
    if (minutesDiff > 0) {
      setTotalUsageTime((prev) => prev + minutesDiff);
      setLastActiveTime(now);
    }
  };

  return (
    <CalculatorContext.Provider
      value={{
        display,
        expression,
        memory,
        error,
        isScientificMode,
        lastResult,
        toggleScientificMode,
        setExpression,
        appendToExpression,
        clearExpression,
        deleteLastCharacter,
        calculateResult,
        clearMemory,
        addToMemory,
        subtractFromMemory,
        recallMemory,
        totalUsageTime,
        totalCalculations,
        trackSessionTime,
        lastActiveTime,
        setLastActiveTime,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);