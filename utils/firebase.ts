import { Platform } from 'react-native';
import { getApps, getApp } from '@react-native-firebase/app';
import type { FirebaseApp } from '@react-native-firebase/app';

/**
 * Checks if native Firebase default app is available and initialized.
 */
export const isFirebaseAvailable = (): boolean => {
  if (Platform.OS === 'web') return false;
  try {
    const apps = getApps();
    return apps.length > 0;
  } catch (err) {
    return false;
  }
};

export const getDefaultApp = (): FirebaseApp | null => {
  if (Platform.OS === 'web') return null;
  try {
    return getApp();
  } catch {
    return null;
  }
};
