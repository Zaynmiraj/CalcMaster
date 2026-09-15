import {
  getAnalytics,
  logEvent,
  logScreenView as fbLogScreenView,
  setUserId,
  setUserProperty,
  Analytics,
} from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import { isFirebaseAvailable } from './firebase';

let analyticsInstance: Analytics | null = null;

const getAnalyticsInstance = (): Analytics | null => {
  if (Platform.OS === 'web') return null;
  if (!analyticsInstance) {
    try {
      if (isFirebaseAvailable()) {
        analyticsInstance = getAnalytics();
      }
    } catch (e) {
      console.warn('[Analytics] Failed to initialize analytics instance:', e);
    }
  }
  return analyticsInstance;
};

/**
 * Log a custom event to Firebase Analytics.
 */
export const logAnalyticsEvent = async (
  eventName: string,
  params: Record<string, any> = {}
): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const instance = getAnalyticsInstance();
    if (!instance) return;

    const sanitizedParams: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        sanitizedParams[key] = val;
      } else if (val !== undefined && val !== null) {
        sanitizedParams[key] = String(val);
      }
    }
    logEvent(instance, eventName as any, sanitizedParams);
  } catch (error) {
    console.warn(`[Analytics] Failed to log event "${eventName}":`, error);
  }
};

/**
 * Log a screen transition view to Firebase Analytics.
 */
export const logScreenView = async (screenName: string, screenClass?: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const instance = getAnalyticsInstance();
    if (!instance) return;

    await fbLogScreenView(instance, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.warn(`[Analytics] Failed to log screen view "${screenName}":`, error);
  }
};

/**
 * Associate the user UID with Firebase Analytics.
 */
export const setAnalyticsUser = async (userId: string | null): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const instance = getAnalyticsInstance();
    if (!instance) return;

    await setUserId(instance, userId);
  } catch (error) {
    console.warn('[Analytics] Failed to set user ID:', error);
  }
};

/**
 * Set user properties in Firebase Analytics.
 */
export const setAnalyticsUserProperty = async (name: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const instance = getAnalyticsInstance();
    if (!instance) return;

    await setUserProperty(instance, name, value);
  } catch (error) {
    console.warn(`[Analytics] Failed to set user property "${name}":`, error);
  }
};

/**
 * Strongly-typed event logging helpers for NoteCalc Pro.
 */
export const AnalyticsEvents = {
  logCalculation: (type: 'notepad' | 'keypad', lineCount: number = 1) =>
    logAnalyticsEvent('calculate_expression', { calc_type: type, line_count: lineCount }),

  logExportNote: (format: 'png' | 'pdf' | 'markdown' | 'text' | 'json') =>
    logAnalyticsEvent('export_note', { format }),

  logAiSummary: (action: 'summary' | 'insights' | 'audit') =>
    logAnalyticsEvent('use_ai_feature', { feature: action }),

  logVoiceDictation: (insertedLength: number) =>
    logAnalyticsEvent('use_voice_dictation', { length: insertedLength }),

  logThemeChange: (themeId: string, isDark: boolean) =>
    logAnalyticsEvent('change_theme', { theme_id: themeId, is_dark: isDark }),

  logCurrencyChange: (currency: string) =>
    logAnalyticsEvent('change_currency', { currency }),

  logAngleUnitChange: (unit: 'deg' | 'rad') =>
    logAnalyticsEvent('change_angle_unit', { unit }),

  logClearHistory: () =>
    logAnalyticsEvent('clear_history', {}),
};
