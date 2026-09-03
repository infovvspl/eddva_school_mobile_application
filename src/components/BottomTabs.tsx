import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';

type TabKey = 'home' | 'timetable' | 'assignments' | 'profile';

export function BottomTabs({
  activeTab,
  onChange,
  theme,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  theme: { background: string; surface: string; primary: string; text: string; subtext: string; primarySoft: string; border: string; accent: string };
}) {
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'home', label: 'Home' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}> 
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && { backgroundColor: theme.primarySoft }]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.tabText, { color: activeTab === tab.key ? theme.primary : theme.subtext }]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: hs(10),
    paddingVertical: vs(8),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: ms(14),
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '700',
    fontSize: ms(13),
  },
});
