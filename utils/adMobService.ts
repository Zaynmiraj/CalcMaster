import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

/**
 * =========================================================================
 * NoteCalc Pro — AdMob Configuration
 * =========================================================================
 * When you are ready for production, replace the placeholder IDs with your
 * real AdMob Unit IDs. For development and testing, Google's official
 * TestIds are used automatically to prevent account suspension.
 */
export const ADMOB_CONFIG = {
  // Uses TestIds in development (__DEV__) to protect your account against invalid traffic,
  // and automatically switches to your real production IDs in release builds!
  IS_TESTING: __DEV__,

  // Your real production AdMob Ad Unit IDs from your AdMob console
  PRODUCTION_IDS: {
    BANNER: 'ca-app-pub-1662853246746272/2129562164',
    INTERSTITIAL: 'ca-app-pub-1662853246746272/3106872960',
    REWARDED: 'ca-app-pub-1662853246746272/9480709624',
  },

  // Helper getters that switch between Test and Production IDs
  get BANNER_ID(): string {
    return this.IS_TESTING ? TestIds.BANNER : this.PRODUCTION_IDS.BANNER;
  },
  get INTERSTITIAL_ID(): string {
    return this.IS_TESTING ? TestIds.INTERSTITIAL : this.PRODUCTION_IDS.INTERSTITIAL;
  },
  get REWARDED_ID(): string {
    return this.IS_TESTING ? TestIds.REWARDED : this.PRODUCTION_IDS.REWARDED;
  },
};

// Frequency capping: 20 seconds in production, 0 in dev for testing
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN_MS = __DEV__ ? 0 : 20 * 1000;

let interstitial: InterstitialAd | null = null;
let isInterstitialLoading = false;

let rewarded: RewardedAd | null = null;
let isRewardedLoading = false;

/**
 * Initialize Google Mobile Ads SDK
 */
export async function initializeAdMob(): Promise<void> {
  try {
    const adapterStatuses = await mobileAds().initialize();
    console.log('[AdMob] Initialized adapter statuses:', adapterStatuses);
    preloadInterstitial();
    preloadRewarded();
  } catch (err) {
    console.warn('[AdMob] Failed to initialize Google Mobile Ads SDK:', err);
  }
}

/**
 * Preload an Interstitial Ad in background
 */
export function preloadInterstitial(): void {
  if (interstitial?.loaded || isInterstitialLoading) return;

  try {
    isInterstitialLoading = true;
    interstitial = InterstitialAd.createForAdRequest(ADMOB_CONFIG.INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoading = false;
      console.log('[AdMob] Interstitial ad loaded.');
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      isInterstitialLoading = false;
      console.warn('[AdMob] Interstitial ad failed to load:', error);
    });

    interstitial.load();
  } catch (e) {
    isInterstitialLoading = false;
  }
}

/**
 * Show an Interstitial Ad (e.g. after Copy, PNG, PDF, Markdown export)
 * Respects cooldown timer in production so users are not overwhelmed.
 */
export function showInterstitialAd(onClosed?: () => void, force: boolean = false): void {
  const now = Date.now();
  const elapsed = now - lastInterstitialTime;

  // Check cooldown
  if (!force && elapsed < INTERSTITIAL_COOLDOWN_MS) {
    console.log(`[AdMob] Interstitial cooldown active (${Math.round((INTERSTITIAL_COOLDOWN_MS - elapsed) / 1000)}s left).`);
    if (onClosed) onClosed();
    return;
  }

  if (interstitial?.loaded) {
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      lastInterstitialTime = Date.now();
      unsubscribeClosed();
      preloadInterstitial(); // preload the next one
      if (onClosed) onClosed();
    });

    interstitial.show().catch((err) => {
      console.warn('[AdMob] Error showing interstitial:', err);
      preloadInterstitial();
      if (onClosed) onClosed();
    });
  } else {
    // Ad was not ready, trigger callback immediately and try loading
    preloadInterstitial();
    if (onClosed) onClosed();
  }
}

/**
 * Preload a Rewarded Ad
 */
export function preloadRewarded(): void {
  if (rewarded?.loaded || isRewardedLoading) return;

  try {
    isRewardedLoading = true;
    rewarded = RewardedAd.createForAdRequest(ADMOB_CONFIG.REWARDED_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoading = false;
      console.log('[AdMob] Rewarded ad loaded.');
    });

    rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      isRewardedLoading = false;
      console.warn('[AdMob] Rewarded ad failed to load:', error);
    });

    rewarded.load();
  } catch (e) {
    isRewardedLoading = false;
  }
}

/**
 * Show a Rewarded Ad to unlock AI insights or export features.
 * Calls onRewarded() only if user watched the ad.
 */
export function showRewardedAd(
  onRewarded: () => void,
  onError?: (err: any) => void
): void {
  if (rewarded?.loaded) {
    let rewardedGranted = false;

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardedGranted = true;
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeEarned();
      unsubscribeClosed();
      preloadRewarded(); // preload next
      if (rewardedGranted) {
        onRewarded();
      }
    });

    rewarded.show().catch((err) => {
      console.warn('[AdMob] Failed to display rewarded ad:', err);
      preloadRewarded();
      if (onError) onError(err);
    });
  } else {
    console.log('[AdMob] Rewarded ad not loaded yet, preloading...');
    preloadRewarded();
    // Allow action as fallback if ad isn't loaded so user isn't permanently blocked
    onRewarded();
  }
}

export { BannerAd, BannerAdSize, TestIds };
