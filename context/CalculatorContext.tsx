import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluate, formatResult, getLivePreview, AngleUnit, formatDisplayExpression } from '@/utils/calculator';
import { useHistory } from './HistoryContext';

type CalculatorContextType = {
  display: string;
  expression: string;
  liveResult: string | null;
  memory: string;
  error: string | null;
  isScientificMode: boolean;
  angleUnit: AngleUnit;
  hapticsEnabled: boolean;
  lastResult: string;
  toggleScientificMode: () => void;
  toggleAngleUnit: () => void;
  toggleHaptics: () => void;
  setExpression: (expression: string) => void;
  appendToExpression: (value: string) => void;
  toggleSign: () => void;
  applyParentheses: () => void;
  applyPercentage: () => void;
  applyInverse: () => void;
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
};

const CalculatorContext = createContext<CalculatorContextType>({
  display: '0',
  expression: '',
  liveResult: null,
  memory: '0',
  error: null,
  isScientificMode: false,
  angleUnit: 'deg',
  hapticsEnabled: true,
  lastResult: '0',
  toggleScientificMode: () => {},
  toggleAngleUnit: () => {},
  toggleHaptics: () => {},
  setExpression: () => {},
  appendToExpression: () => {},
  toggleSign: () => {},
  applyParentheses: () => {},
  applyPercentage: () => {},
  applyInverse: () => {},
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
});

export const CalculatorProvider = ({ children }: { children: React.ReactNode }) => {
  const [expression, setExpressionState] = useState('');
  const [memory, setMemory] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [lastResult, setLastResult] = useState('0');
  const [totalUsageTime, setTotalUsageTime] = useState(0);
  const [totalCalculations, setTotalCalculations] = useState(0);

  const lastActiveTimeRef = useRef<number>(Date.now());
  const { addToHistory } = useHistory();

  // Load calculator state from storage
  useEffect(() => {
    const loadCalculatorState = async () => {
      try {
        const savedMemory = await AsyncStorage.getItem('calculatorMemory');
        const savedScientificMode = await AsyncStorage.getItem('isScientificMode');
        const savedAngleUnit = await AsyncStorage.getItem('angleUnit');
        const savedHaptics = await AsyncStorage.getItem('hapticsEnabled');
        const savedTotalUsageTime = await AsyncStorage.getItem('totalUsageTime');
        const savedTotalCalculations = await AsyncStorage.getItem('totalCalculations');

        if (savedMemory) setMemory(savedMemory);
        if (savedScientificMode !== null) setIsScientificMode(savedScientificMode === 'true');
        if (savedAngleUnit === 'deg' || savedAngleUnit === 'rad') setAngleUnit(savedAngleUnit);
        if (savedHaptics !== null) setHapticsEnabled(savedHaptics === 'true');
        if (savedTotalUsageTime !== null) setTotalUsageTime(parseInt(savedTotalUsageTime, 10));
        if (savedTotalCalculations !== null) setTotalCalculations(parseInt(savedTotalCalculations, 10));
      } catch (err) {
        console.error('Error loading calculator state:', err);
      }
    };

    loadCalculatorState();
  }, []);

  // Save changes to storage
  useEffect(() => {
    AsyncStorage.setItem('calculatorMemory', memory).catch(console.error);
    AsyncStorage.setItem('isScientificMode', isScientificMode.toString()).catch(console.error);
    AsyncStorage.setItem('angleUnit', angleUnit).catch(console.error);
    AsyncStorage.setItem('hapticsEnabled', hapticsEnabled.toString()).catch(console.error);
    AsyncStorage.setItem('totalUsageTime', totalUsageTime.toString()).catch(console.error);
    AsyncStorage.setItem('totalCalculations', totalCalculations.toString()).catch(console.error);
  }, [memory, isScientificMode, angleUnit, hapticsEnabled, totalUsageTime, totalCalculations]);

  // Formatted display
  const display = expression === '' ? '0' : formatDisplayExpression(expression);

  // Compute live preview on the fly
  const liveResult = expression ? getLivePreview(expression, angleUnit) : null;

  const toggleScientificMode = () => setIsScientificMode((prev) => !prev);
  const toggleAngleUnit = () => setAngleUnit((prev) => (prev === 'deg' ? 'rad' : 'deg'));
  const toggleHaptics = () => setHapticsEnabled((prev) => !prev);

  const setExpression = (value: string) => {
    setError(null);
    setExpressionState(value);
  };

  const clearExpression = () => {
    setExpressionState('');
    setError(null);
  };

  const deleteLastCharacter = () => {
    setError(null);
    setExpressionState((prev) => {
      if (prev.length <= 1) return '';
      // If ends with function like "sin(" or "cos(", remove the whole function call name
      const funcMatch = prev.match(/(sin\(|cos\(|tan\(|log\(|ln\(|sqrt\()$/);
      if (funcMatch) {
        return prev.slice(0, -funcMatch[0].length);
      }
      return prev.slice(0, -1);
    });
  };

  const appendToExpression = (value: string) => {
    setError(null);

    setExpressionState((prev) => {
      // 1. Initial zero handling
      if (prev === '' || prev === '0') {
        if (!isNaN(Number(value))) return value;
        if (value === '.') return '0.';
        if (['+', '-', '*', '/'].includes(value)) return `0${value}`;
        return value;
      }

      const lastChar = prev.slice(-1);
      const isOperator = (ch: string) => ['+', '-', '*', '/', '^'].includes(ch);

      // 2. Prevent consecutive operators by swapping the operator
      if (isOperator(lastChar) && isOperator(value)) {
        if (value === '-' && lastChar !== '-') {
          // Allow negative sign after operator e.g. 5 * -
          return prev + value;
        }
        return prev.slice(0, -1) + value;
      }

      // 3. Prevent multiple decimals in the same number segment
      if (value === '.') {
        const segments = prev.split(/[+\-*/^()]/);
        const currentSegment = segments[segments.length - 1];
        if (currentSegment.includes('.')) {
          return prev; // ignore redundant dot
        }
      }

      return prev + value;
    });
  };

  // Smart toggle sign (+/-)
  const toggleSign = () => {
    setError(null);
    setExpressionState((prev) => {
      if (!prev || prev === '0') return '-';
      if (prev === '-') return '';

      // Match last signed number segment: e.g. "12 + 5" or "12 + (-5)" or "-15"
      const matchNegWrapped = prev.match(/\((-(\d+(\.\d+)?))\)$/);
      if (matchNegWrapped) {
        // Remove (-X) and replace with X
        return prev.slice(0, -matchNegWrapped[0].length) + matchNegWrapped[1].slice(1);
      }

      const matchLastNumber = prev.match(/(\d+(\.\d+)?)$/);
      if (matchLastNumber) {
        const numStr = matchLastNumber[0];
        const prefix = prev.slice(0, -numStr.length);
        if (prefix.endsWith('-')) {
          // e.g. "10 - 5" -> "10 + 5" or "-5" -> "5"
          if (prefix === '-') return numStr;
          return prefix.slice(0, -1) + '+' + numStr;
        }
        return `${prefix}(-${numStr})`;
      }

      return prev;
    });
  };

  // Smart parentheses
  const applyParentheses = () => {
    setError(null);
    setExpressionState((prev) => {
      if (!prev) return '(';
      const lastChar = prev.slice(-1);
      const openCount = (prev.match(/\(/g) || []).length;
      const closeCount = (prev.match(/\)/g) || []).length;

      if (openCount > closeCount && (/[0-9)πe!%]$/.test(lastChar))) {
        return prev + ')';
      }
      if (/[0-9)πe!%]$/.test(lastChar)) {
        return prev + '*(';
      }
      return prev + '(';
    });
  };

  const applyPercentage = () => {
    setError(null);
    setExpressionState((prev) => {
      if (!prev || /[+\-*/^(]$/.test(prev)) return prev;
      return prev + '%';
    });
  };

  const applyInverse = () => {
    setError(null);
    setExpressionState((prev) => {
      if (!prev || prev === '0') return '1/';
      return `1/(${prev})`;
    });
  };

  const calculateResult = () => {
    if (!expression.trim()) return;

    try {
      const numericResult = evaluate(expression, angleUnit);
      const formatted = formatResult(numericResult);

      if (formatted === 'Error') {
        setError('Error');
        return;
      }

      // Add to calculation history
      addToHistory({
        expression,
        result: formatted,
        mode: isScientificMode ? 'scientific' : 'standard',
        angleUnit,
      });

      setLastResult(formatted);
      setExpressionState(formatted);
      setTotalCalculations((prev) => prev + 1);
    } catch (err) {
      setError('Error');
    }
  };

  // Memory functions
  const clearMemory = () => setMemory('0');

  const addToMemory = () => {
    try {
      const valToUse = expression ? evaluate(expression, angleUnit) : parseFloat(lastResult || '0');
      const currentMem = parseFloat(memory) || 0;
      const newMemory = formatResult(currentMem + valToUse);
      setMemory(newMemory);
    } catch {
      setError('Error');
    }
  };

  const subtractFromMemory = () => {
    try {
      const valToUse = expression ? evaluate(expression, angleUnit) : parseFloat(lastResult || '0');
      const currentMem = parseFloat(memory) || 0;
      const newMemory = formatResult(currentMem - valToUse);
      setMemory(newMemory);
    } catch {
      setError('Error');
    }
  };

  const recallMemory = () => {
    if (memory !== '0') {
      setError(null);
      setExpressionState((prev) => {
        if (!prev || prev === '0') return memory;
        const lastChar = prev.slice(-1);
        if (['+', '-', '*', '/', '^', '('].includes(lastChar)) {
          return prev + memory;
        }
        return memory;
      });
    }
  };

  // Safe incremental session time tracking
  const trackSessionTime = useCallback(() => {
    const now = Date.now();
    const diffMs = now - lastActiveTimeRef.current;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes > 0) {
      setTotalUsageTime((prev) => prev + minutes);
      lastActiveTimeRef.current = now;
    }
  }, []);

  return (
    <CalculatorContext.Provider
      value={{
        display,
        expression,
        liveResult,
        memory,
        error,
        isScientificMode,
        angleUnit,
        hapticsEnabled,
        lastResult,
        toggleScientificMode,
        toggleAngleUnit,
        toggleHaptics,
        setExpression,
        appendToExpression,
        toggleSign,
        applyParentheses,
        applyPercentage,
        applyInverse,
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
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);