import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import ProfileAvatar from './ProfileAvatar';
import { Colors, Spacing, FontSize, FontWeight, Shadow } from '../constants/theme';
import { hs, layout, ms, vs } from '../utils/responsive';

interface AppHeaderProps {
  name?: string;
  showBack?: boolean;
  title?: string;
  rightIcon?: string;
  rightIconSolid?: boolean;
  showDot?: boolean;
  avatarUrl?: string;
  onBack?: () => void;
  onRightPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  name = 'Katrin Yan',
  showBack = false,
  title,
  rightIcon = 'bell',
  rightIconSolid = false,
  showDot = false,
  avatarUrl,
  onBack,
  onRightPress,
}) => {
  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-left" size={16} color={Colors.textMain} solid />
        </TouchableOpacity>
      ) : (
        <View style={styles.profile}>
          <ProfileAvatar
            uri={avatarUrl}
            name={name}
            size={hs(48)}
            borderColor={Colors.primary}
            style={styles.avatarWrapper}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{name}</Text>
          </View>
        </View>
      )}

      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}

      <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}>
        <Icon name={rightIcon} size={18} color={Colors.textMain} solid={rightIconSolid} />
        {showDot && <View style={styles.dot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    width: hs(48),
    height: hs(48),
    borderRadius: hs(24),
    borderWidth: 2,
    borderColor: `${Colors.primary}33`,
    padding: ms(2),
    overflow: 'hidden',
  },
  welcomeText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  nameText: {
    fontSize: FontSize.lg,
    color: Colors.textMain,
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textMain,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: layout.touchTarget / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  dot: {
    position: 'absolute',
    top: vs(8),
    right: hs(8),
    width: layout.dot,
    height: layout.dot,
    borderRadius: layout.dot / 2,
    backgroundColor: Colors.accentPink,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
});

export default AppHeader;
