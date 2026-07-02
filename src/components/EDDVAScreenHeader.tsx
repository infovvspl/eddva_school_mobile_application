import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

const EDDVAScreenHeader: React.FC<Props> = ({ title, subtitle, onBack, rightAction }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: c.chipBg, borderColor: c.border }]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Icon name="arrow-left" size={ms(16)} color={c.text} solid />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.center}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAction ?? <View style={styles.backPlaceholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(10),
    gap: hs(10),
  },
  backBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: ms(20),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: { width: hs(40) },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: font.subhead, fontWeight: '800' },
  subtitle: { fontSize: font.tiny, marginTop: vs(2), fontWeight: '600' },
});

export default EDDVAScreenHeader;
