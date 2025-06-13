import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useCalculator } from '@/context/CalculatorContext';
import { useHistory } from '@/context/HistoryContext';
import { Moon, Sun, Clock, Trash2, Paintbrush } from 'lucide-react-native';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleDarkMode, selectedTheme, setSelectedTheme } = useTheme();
  const { isScientificMode, toggleScientificMode, totalUsageTime } = useCalculator();
  const { historyRetentionDays, setHistoryRetentionDays } = useHistory();

  const retentionOptions = [
    { label: '1 day', value: 1 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: 'Forever', value: 0 },
  ];

  // Format total usage time
  const formatUsageTime = () => {
    const hours = Math.floor(totalUsageTime / 60);
    const minutes = totalUsageTime % 60;
    
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header,{backgroundColor: theme.backgroundColor}]}>
        <Text style={[styles.title, { color: theme.textColor }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Paintbrush size={20} color={theme.accentColor} />
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Appearance</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textColor }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.secondaryTextColor }]}>
                Switch between light and dark mode
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Sun size={16} color={theme.textColor} style={{ opacity: isDarkMode ? 0.5 : 1 }} />
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: theme.accentColor }}
                thumbColor={'#f4f3f4'}
                style={{ marginHorizontal: 8 }}
              />
              <Moon size={16} color={theme.textColor} style={{ opacity: isDarkMode ? 1 : 0.5 }} />
            </View>
          </View>

          <ThemeSelector />
        </View>

        <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={theme.accentColor} />
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>History</Text>
          </View>

          <Text style={[styles.settingLabel, { color: theme.textColor }]}>
            Keep History For
          </Text>
          <View style={styles.optionsContainer}>
            {retentionOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  historyRetentionDays === option.value && {
                    backgroundColor: theme.accentColor,
                  },
                ]}
                onPress={() => setHistoryRetentionDays(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: historyRetentionDays === option.value ? '#fff' : theme.textColor },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={theme.accentColor} />
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Calculator</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textColor }]}>Scientific Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.secondaryTextColor }]}>
                Show advanced scientific functions
              </Text>
            </View>
            <Switch
              value={isScientificMode}
              onValueChange={toggleScientificMode}
              trackColor={{ false: '#767577', true: theme.accentColor }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={theme.accentColor} />
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Usage Statistics</Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>
              Total Usage Time
            </Text>
            <Text style={[styles.statValue, { color: theme.textColor }]}>
              {formatUsageTime()}
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
backgroundColor: '#f4f3f4',
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Medium',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  statsContainer: {
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});