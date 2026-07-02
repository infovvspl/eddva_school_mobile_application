import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { font, hs, ms, vs } from '../../utils/responsive';

export type BattleArenaTab = 'play' | 'leaderboard' | 'history';

type Props = {
  active: BattleArenaTab;
  onChange: (tab: BattleArenaTab) => void;
};

const TABS: { id: BattleArenaTab; label: string }[] = [
  { id: 'play', label: 'Arena' },
  { id: 'leaderboard', label: 'Ranks' },
  { id: 'history', label: 'History' },
];

const BattleArenaTabs: React.FC<Props> = ({ active, onChange }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}>
      {TABS.map(tab => {
        const on = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, on && { backgroundColor: c.primary }]}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.tabText,
                { color: on ? '#fff' : c.textMuted },
              ]}
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
  row: {
    flexDirection: 'row',
    marginHorizontal: hs(16),
    marginBottom: vs(12),
    padding: vs(4),
    borderRadius: ms(14),
    borderWidth: 1,
    gap: hs(4),
  },
  tab: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: ms(10),
    alignItems: 'center',
  },
  tabText: { fontSize: font.caption, fontWeight: '800' },
});

export default BattleArenaTabs;
