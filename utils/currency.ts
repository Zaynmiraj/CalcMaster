import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyRateMatrix = Record<string, number>;

// Baseline offline fallback rates relative to USD (USD = 1.0)
export const DEFAULT_RATES: CurrencyRateMatrix = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.91,
  CNY: 7.24,
  INR: 83.5,
  BRL: 5.42,
  SGD: 1.35,
  HKD: 7.81,
  KRW: 1375.0,
  MXN: 17.1,
  SEK: 10.6,
  NZD: 1.65,
  AED: 3.67,
  SAR: 3.75,
};

// Common symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  'C$': 'CAD',
  'A$': 'AUD',
  'R$': 'BRL',
};

const STORAGE_KEY = '@calcnote_currency_rates';
const LAST_SYNC_KEY = '@calcnote_currency_last_sync';

let inMemoryRates: CurrencyRateMatrix = { ...DEFAULT_RATES };

/**
 * Initializes currency matrix from cache or defaults
 */
export const initCurrencyRates = async (): Promise<CurrencyRateMatrix> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      inMemoryRates = { ...DEFAULT_RATES, ...parsed };
      return inMemoryRates;
    }
  } catch (e) {
    console.warn('Using default currency rates:', e);
  }
  inMemoryRates = { ...DEFAULT_RATES };
  return inMemoryRates;
};

/**
 * Synchronously retrieves current rates
 */
export const getActiveRates = (): CurrencyRateMatrix => inMemoryRates;

/**
 * Converts an amount from one currency to another using offline matrix
 */
export const convertCurrency = (
  amount: number,
  fromCurr: string,
  toCurr: string
): number => {
  const from = fromCurr.toUpperCase();
  const to = toCurr.toUpperCase();

  if (from === to) return amount;

  const rates = getActiveRates();
  const fromRate = rates[from] || 1.0;
  const toRate = rates[to] || 1.0;

  // Convert to USD base, then to target
  const inUSD = amount / fromRate;
  return inUSD * toRate;
};

/**
 * Background sync service - checks rates every 12-24 hours
 */
export const syncExchangeRatesIfStale = async (force: boolean = false): Promise<boolean> => {
  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const now = Date.now();
    const twelveHoursMs = 12 * 60 * 60 * 1000;

    if (!force && lastSync && now - parseInt(lastSync, 10) < twelveHoursMs) {
      return false; // Still fresh
    }

    // Free public open API fallback (frankfurter.app or open.er-api.com)
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data && data.rates) {
      const merged: CurrencyRateMatrix = { ...DEFAULT_RATES };
      Object.keys(DEFAULT_RATES).forEach((code) => {
        if (typeof data.rates[code] === 'number') {
          merged[code] = data.rates[code];
        }
      });

      inMemoryRates = merged;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
      return true;
    }
  } catch (error) {
    // Network resilient: silently retain cached/default rates
    console.warn('Currency sync offline, using cached rates.');
  }
  return false;
};

/**
 * Normalizes currency symbols in a string (e.g. "$50" -> "50 USD")
 */
export const normalizeCurrencySymbols = (expr: string): string => {
  let result = expr;

  // Handle prefix currency codes like "USD 50" or "EUR 100"
  result = result.replace(
    /\b(USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|BRL|SGD|HKD|KRW|MXN|SEK|NZD)\s*(\d+(?:\.\d+)?)\b/gi,
    '$2 $1'
  );

  // Replace prefix symbols like $50 or € 100
  result = result.replace(/\$\s*(\d+(\.\d+)?)/g, '$1 USD');
  result = result.replace(/€\s*(\d+(\.\d+)?)/g, '$1 EUR');
  result = result.replace(/£\s*(\d+(\.\d+)?)/g, '$1 GBP');
  result = result.replace(/¥\s*(\d+(\.\d+)?)/g, '$1 JPY');
  result = result.replace(/₹\s*(\d+(\.\d+)?)/g, '$1 INR');

  // Replace suffix symbols like 50$ or 100€
  result = result.replace(/(\d+(\.\d+)?)\s*\$/g, '$1 USD');
  result = result.replace(/(\d+(\.\d+)?)\s*€/g, '$1 EUR');
  result = result.replace(/(\d+(\.\d+)?)\s*£/g, '$1 GBP');
  result = result.replace(/(\d+(\.\d+)?)\s*¥/g, '$1 JPY');
  result = result.replace(/(\d+(\.\d+)?)\s*₹/g, '$1 INR');

  // Replace currency names
  result = result.replace(/(\d+(?:\.\d+)?)\s*(?:dollars?|bucks?)\b/gi, '$1 USD');
  result = result.replace(/(\d+(?:\.\d+)?)\s*(?:euros?)\b/gi, '$1 EUR');
  result = result.replace(/(\d+(?:\.\d+)?)\s*(?:pounds?)\b/gi, '$1 GBP');

  return result;
};

/**
 * Evaluates inline cross-currency syntax:
 * Examples:
 * - "50 USD to EUR"
 * - "100 EUR in CAD"
 * - "50 USD + 20 EUR to CAD"
 */
export const processCurrencyExpressions = (text: string): { processed: string; targetCurrency?: string } => {
  let normalized = normalizeCurrencySymbols(text);

  // Check for conversion target: "to CAD" or "in USD" or "as EUR"
  const targetMatch = normalized.match(/\b(to|in|as)\s+([A-Za-z]{3})\b/i);
  const targetCurrency = targetMatch ? targetMatch[2].toUpperCase() : undefined;

  if (targetMatch) {
    // Remove "to XYZ"
    normalized = normalized.replace(/\b(to|in|as)\s+[A-Za-z]{3}\b/i, '').trim();
  }

  // Convert standalone currency tokens like "50 USD" or "20 EUR"
  // into base USD numeric value so mathjs can calculate addition/subtraction
  const currencyPattern = /(\d+(\.\d+)?)\s*([A-Za-z]{3})\b/g;

  normalized = normalized.replace(currencyPattern, (match, amountStr, _, code) => {
    const amt = parseFloat(amountStr);
    const curr = code.toUpperCase();
    if (inMemoryRates[curr]) {
      // If targetCurrency is specified, convert directly to target currency
      if (targetCurrency) {
        const converted = convertCurrency(amt, curr, targetCurrency);
        return converted.toString();
      }
      // If no target currency, convert to USD
      const inUsd = convertCurrency(amt, curr, 'USD');
      return inUsd.toString();
    }
    return match;
  });

  return {
    processed: normalized,
    targetCurrency,
  };
};
