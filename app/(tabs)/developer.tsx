import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import {
  Heart,
  Github,
  Twitter,
  ExternalLink,
  Code,
  Calculator,
  Facebook,
  FacebookIcon,
} from 'lucide-react-native';
import Constants from 'expo-constants';

export default function DeveloperScreen() {
  const { theme } = useTheme();
  const { totalCalculations, totalUsageTime } = useCalculator();

  const version = Constants.expoConfig?.version || '1.0.0';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Format total usage time
  const formatUsageTime = () => {
    const hours = Math.floor(totalUsageTime / 60);
    const minutes = totalUsageTime % 60;

    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${
        minutes === 1 ? '' : 's'
      }`;
    }
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>
          Developer
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.appInfoContainer}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.accentColor },
            ]}
          >
            <Calculator size={60} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.textColor }]}>
            CalcMaster
          </Text>
          <Text
            style={[styles.appVersion, { color: theme.secondaryTextColor }]}
          >
            Version {version}
          </Text>
        </View>

        <View
          style={[styles.section, { borderBottomColor: theme.borderColor }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            App Statistics
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textColor }]}>
                {totalCalculations}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.secondaryTextColor }]}
              >
                Calculations
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textColor }]}>
                {formatUsageTime()}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.secondaryTextColor }]}
              >
                Usage Time
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.section, { borderBottomColor: theme.borderColor }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Technologies
          </Text>

          <View style={styles.techList}>
            <View
              style={[styles.techItem, { backgroundColor: theme.cardColor }]}
            >
              <Text style={[styles.techName, { color: theme.textColor }]}>
                React Native
              </Text>
              <Text
                style={[
                  styles.techDescription,
                  { color: theme.secondaryTextColor },
                ]}
              >
                Framework
              </Text>
            </View>

            <View
              style={[styles.techItem, { backgroundColor: theme.cardColor }]}
            >
              <Text style={[styles.techName, { color: theme.textColor }]}>
                Expo
              </Text>
              <Text
                style={[
                  styles.techDescription,
                  { color: theme.secondaryTextColor },
                ]}
              >
                SDK & Tools
              </Text>
            </View>

            <View
              style={[styles.techItem, { backgroundColor: theme.cardColor }]}
            >
              <Text style={[styles.techName, { color: theme.textColor }]}>
                TypeScript
              </Text>
              <Text
                style={[
                  styles.techDescription,
                  { color: theme.secondaryTextColor },
                ]}
              >
                Language
              </Text>
            </View>

            <View
              style={[styles.techItem, { backgroundColor: theme.cardColor }]}
            >
              <Text style={[styles.techName, { color: theme.textColor }]}>
                Expo Router
              </Text>
              <Text
                style={[
                  styles.techDescription,
                  { color: theme.secondaryTextColor },
                ]}
              >
                Navigation
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Connect
          </Text>

          <View style={styles.connectButtons}>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: '#24292e' }]}
              onPress={() => openLink('https://github.com/zaynmiraj')}
            >
              <Github size={20} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>GitHub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: '#24292e' }]}
              onPress={() => openLink('https://facebook.com/fedumiraj')}
            >
              <FacebookIcon size={20} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => openLink('https://instagram.com/zynmiraj')}
            >
              <Twitter size={20} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>Twitter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.madeWithLove}>
            <Text
              style={[styles.madeWithText, { color: theme.secondaryTextColor }]}
            >
              Made with
            </Text>
            <Heart
              size={16}
              color={theme.dangerColor}
              style={{ marginHorizontal: 4 }}
            />
            <Text
              style={[styles.madeWithText, { color: theme.secondaryTextColor }]}
            >
              by ZaYn Miraj
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
  },
  scrollView: {
    flex: 1,
  },
  appInfoContainer: {
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Medium',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  techName: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  connectButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Medium',
    marginLeft: 8,
  },
  madeWithLove: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  madeWithText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
});
