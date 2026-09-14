import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

/**
 * Robust cross-platform clipboard reader supporting Web, iOS, and Android
 */
export const getClipboardString = async (): Promise<string> => {
  try {
    if (typeof Clipboard.getStringAsync === 'function') {
      const text = await Clipboard.getStringAsync();
      if (text) return text;
    }
    if ((Platform.OS as string) === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
  }
  return '';
};

/**
 * Robust cross-platform clipboard writer supporting Web, iOS, and Android
 */
export const setClipboardString = async (text: string): Promise<boolean> => {
  try {
    if (typeof Clipboard.setStringAsync === 'function') {
      await Clipboard.setStringAsync(text);
      return true;
    }
    if ((Platform.OS as string) === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write error:', err);
  }
  return false;
};
