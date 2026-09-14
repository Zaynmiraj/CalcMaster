import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.cardSubtle }]}>
        {icon}
      </View>

      <Text style={[styles.title, { color: theme.textColor }]}>{title}</Text>

      <Text style={[styles.message, { color: theme.secondaryTextColor }]}>{message}</Text>

      <View style={styles.buttonGroup}>
        {actionLabel && onAction && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accentColor }]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : theme.cardSubtle,
                borderColor: theme.glassBorder,
              },
            ]}
            onPress={onSecondaryAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accentColor }]}>
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 280,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
});