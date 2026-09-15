import {
  getMessaging,
  requestPermission as fbRequestPermission,
  getToken as fbGetToken,
  onTokenRefresh as fbOnTokenRefresh,
  onMessage as fbOnMessage,
  onNotificationOpenedApp as fbOnNotificationOpenedApp,
  setBackgroundMessageHandler as fbSetBackgroundMessageHandler,
  getInitialNotification as fbGetInitialNotification,
  subscribeToTopic as fbSubscribeToTopic,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type { Messaging, RemoteMessage } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logAnalyticsEvent } from './analyticsService';
import { isFirebaseAvailable } from './firebase';

const FCM_TOKEN_STORAGE_KEY = '@notecalc_fcm_token';

let messagingInstance: Messaging | null = null;

const getMessagingInstance = (): Messaging | null => {
  if (Platform.OS === 'web') return null;
  if (!messagingInstance) {
    try {
      if (isFirebaseAvailable()) {
        messagingInstance = getMessaging();
      }
    } catch (e) {
      console.warn('[FCM] Failed to get Messaging instance:', e);
    }
  }
  return messagingInstance;
};

/**
 * Top-level background message handler for FCM.
 * Must be registered early in the application lifecycle outside of React components.
 */
export const registerBackgroundMessageHandler = () => {
  if (Platform.OS === 'web') return;
  try {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    fbSetBackgroundMessageHandler(messaging, async (remoteMessage: RemoteMessage) => {
      console.log('[FCM Background] Message received in background/quit state:', remoteMessage.messageId);
    });
  } catch (error) {
    console.warn('[FCM Background] Failed to register background message handler:', error);
  }
};

/**
 * Requests push notification permissions from the user (iOS & Android 13+).
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    const messaging = getMessagingInstance();
    if (!messaging) return false;

    const authStatus = await fbRequestPermission(messaging);
    const isAuthorized =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log('[FCM] Permission status:', authStatus, 'Authorized:', isAuthorized);
    await logAnalyticsEvent('notification_permission_result', { authorized: isAuthorized });
    return isAuthorized;
  } catch (error) {
    console.warn('[FCM] Permission request failed:', error);
    return false;
  }
};

/**
 * Retrieves the device's FCM push token.
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  try {
    const messaging = getMessagingInstance();
    if (!messaging) return null;

    const token = await fbGetToken(messaging);
    if (token) {
      console.log('[FCM Token]:', token);
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    }
    return null;
  } catch (error) {
    console.warn('[FCM] Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Initializes push notification handlers and topic subscriptions.
 */
export const initializePushNotifications = async (
  onNotificationReceived?: (message: RemoteMessage) => void
): Promise<(() => void) | void> => {
  if (Platform.OS === 'web') return;

  try {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    // 1. Request permission
    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
      // 2. Fetch and store token
      await getFCMToken();

      // 3. Subscribe to general broadcast topic
      try {
        await fbSubscribeToTopic(messaging, 'notecalc_users');
        console.log('[FCM] Subscribed to topic: notecalc_users');
      } catch (err) {
        console.warn('[FCM] Topic subscription warning:', err);
      }
    }

    // 4. Listen for token refreshes
    const unsubscribeTokenRefresh = fbOnTokenRefresh(messaging, async (newToken: string) => {
      console.log('[FCM] Token refreshed:', newToken);
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
    });

    // 5. Handle foreground notifications
    const unsubscribeForeground = fbOnMessage(messaging, async (remoteMessage: RemoteMessage) => {
      console.log('[FCM Foreground] Received message:', remoteMessage);

      await logAnalyticsEvent('notification_received_foreground', {
        title: remoteMessage.notification?.title || '',
      });

      if (onNotificationReceived) {
        onNotificationReceived(remoteMessage);
      } else if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'NoteCalc Pro',
          remoteMessage.notification.body || ''
        );
      }
    });

    // 6. Handle notification click when app was backgrounded
    const unsubscribeNotificationOpened = fbOnNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
      console.log('[FCM Opened App] Notification opened from background:', remoteMessage);
      logAnalyticsEvent('notification_opened', {
        title: remoteMessage.notification?.title || '',
      });
    });

    // 7. Check if app was opened from quit state via notification
    const initialNotification = await fbGetInitialNotification(messaging);
    if (initialNotification) {
      console.log('[FCM Initial] App opened from quit state via notification:', initialNotification);
      await logAnalyticsEvent('notification_opened_from_quit', {
        title: initialNotification.notification?.title || '',
      });
    }

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  } catch (error) {
    console.warn('[FCM] Initialization failed:', error);
  }
};

export type { RemoteMessage };
