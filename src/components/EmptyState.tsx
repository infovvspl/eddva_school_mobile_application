import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

interface EmptyStateProps {
  iconName?: string;
  iconColor?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'folder-open',
  iconColor = Colors.accentPurple,
  title = 'No Enrolled Courses',
  description = "You haven't started any new courses yet. Explore our catalog to find your next adventure.",
  ctaLabel = 'Browse Catalog',
  onCta,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Icon name={iconName} size={40} color={iconColor} solid />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity style={styles.cta} onPress={onCta} activeOpacity={0.8}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.soft,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.soft,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.slate600,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  cta: {
    backgroundColor: Colors.textMain,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});

export default EmptyState;
