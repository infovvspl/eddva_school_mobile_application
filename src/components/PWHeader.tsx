import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import ProfileAvatar from './ProfileAvatar';

type Props = {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  onNotificationPress?: () => void;
  rightElement?: React.ReactNode;
};

const PWHeader: React.FC<Props> = ({
  name,
  subtitle = 'Welcome back,',
  avatarUrl,
  onNotificationPress,
  rightElement,
}) => {
  return (
  <View style={styles.wrap}>
    <View style={styles.left}>
      <ProfileAvatar
        uri={avatarUrl}
        name={name}
        size={48}
        borderColor={Colors.primary}
        style={styles.avatarRing}
      />
      <View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </View>
    </View>
    {rightElement || (
      <TouchableOpacity style={styles.notifBtn} onPress={onNotificationPress} activeOpacity={0.8}>
        <Icon name="bell" size={18} color={Colors.text} solid />
      </TouchableOpacity>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: `${Colors.primary}30`,
    padding: 2,
  },
  subtitle: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  name: { fontSize: 17, fontWeight: '800', color: Colors.text },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
});

export default PWHeader;
