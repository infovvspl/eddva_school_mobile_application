import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

const PWScreenHeader: React.FC<Props> = ({ title, subtitle, onBack, rightAction }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: c.chipBg }]}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={ms(16)} color={c.text} solid />
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <View style={styles.titles}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction || <View style={styles.backSpacer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: hs(10) },
  backBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  backSpacer: { width: hs(40) },
  titles: { flex: 1, minWidth: 0 },
  title: { fontSize: font.headline, fontWeight: '800' },
  subtitle: { fontSize: font.caption, marginTop: vs(2), fontWeight: '600' },
});

export default PWScreenHeader;
