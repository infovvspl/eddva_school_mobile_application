import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Rocket,
  CalendarDays,
  Gamepad2,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { MainTabParamList } from '../types/navigation';
import { Shadow } from '../constants/theme';
import { hs, ms, tabBar, textFamily, vs } from '../utils/responsive';

type TabKey = keyof MainTabParamList;

const TABS: {
  name: TabKey;
  label: string;
  Icon: LucideIcon;
}[] = [
  { name: 'Dashboard', label: 'Home', Icon: Home },
  { name: 'Learn', label: 'Learn', Icon: Rocket },
  { name: 'StudyPlan', label: 'Study', Icon: CalendarDays },
  { name: 'Battle', label: 'Arena', Icon: Gamepad2 },
  { name: 'Help', label: 'AI Doubt', Icon: MessageCircle },
];

const ICON_SIZE = ms(24);

/** Bottom tabs — Lucide icons, EDDVA blue active state */
const EDDVATabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, vs(10)),
          backgroundColor: c.surface,
          borderTopColor: c.border,
        },
      ]}
    >
      {TABS.map(tab => {
        const routeIndex = state.routes.findIndex(r => r.name === tab.name);
        if (routeIndex < 0) return null;
        const isFocused = state.index === routeIndex;
        const route = state.routes[routeIndex];
        const TabIcon = tab.Icon;
        const iconColor = isFocused ? c.primary : c.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (event.defaultPrevented) return;

          if (tab.name === 'Battle') {
            navigation.navigate('Battle', { screen: 'BattleLobby' });
            return;
          }
          if (!isFocused) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
          >
            <View
              style={[
                styles.iconBox,
                isFocused && {
                  backgroundColor: `${c.primary}18`,
                  borderColor: `${c.primary}30`,
                },
              ]}
            >
              <TabIcon
                size={ICON_SIZE}
                color={iconColor}
                strokeWidth={isFocused ? 2.75 : 2}
              />
            </View>
            <Text
              style={[
                styles.label,
                textFamily.medium,
                { color: c.textMuted },
                isFocused && { color: c.primary, ...textFamily.bold },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: vs(8),
    minHeight: vs(56),
    ...Shadow.nav,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(4),
    gap: vs(2),
  },
  iconBox: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: tabBar.labelSize,
    marginTop: vs(3),
  },
});

export default EDDVATabBar;
