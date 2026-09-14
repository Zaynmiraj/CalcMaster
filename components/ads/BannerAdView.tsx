import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../../utils/adMobService';

interface BannerAdViewProps {
  style?: any;
}

export const BannerAdView: React.FC<BannerAdViewProps> = ({ style }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  // If ad failed to load (or offline), don't render empty white space
  if (adFailed) {
    return null;
  }

  return (
    <View style={[styles.container, style, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={ADMOB_CONFIG.BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
          setAdFailed(false);
        }}
        onAdFailedToLoad={(error) => {
          console.warn('[AdMob Banner] Failed to load:', error);
          setAdFailed(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});

export default BannerAdView;
