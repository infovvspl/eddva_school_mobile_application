import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDemo } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { USE_MOCK } from '../config/appConfig';
import Icon from './Icon';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

/** Demo toggle — stacked layout so text never clips on narrow phones */
const DemoModeBar: React.FC = () => {
  const { preset, setPreset, hasCourses } = useDemo();
  const { theme } = useTheme();
  const c = theme.colors;

  if (!USE_MOCK) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: `${c.primary}12`, borderColor: `${c.primary}25` }]}>
      <View style={styles.labelRow}>
        <View style={[styles.flaskCircle, { backgroundColor: c.surface }]}>
          <Icon name="flask" size={ms(16)} color={c.primary} solid />
        </View>
        <View style={styles.labelCol}>
          <Text style={[styles.demoTitle, { color: c.text }]}>Demo mode</Text>
          <Text style={[styles.demoSub, { color: c.textMuted }]}>Tap to preview</Text>
        </View>
      </View>

      <View style={[styles.segment, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TouchableOpacity
          style={[styles.segBtn, preset === 'no_courses' && { backgroundColor: c.primary }]}
          onPress={() => setPreset('no_courses')}
          activeOpacity={0.88}
        >
          <Text
            style={[styles.segText, { color: c.primary }, preset === 'no_courses' && styles.segTextActive]}
          >
            New student
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segBtn, preset === 'with_courses' && { backgroundColor: c.primary }]}
          onPress={() => setPreset('with_courses')}
          activeOpacity={0.88}
        >
          <Text
            style={[styles.segText, { color: c.primary }, preset === 'with_courses' && styles.segTextActive]}
          >
            Has courses
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: c.textMuted }]}>
        {hasCourses
          ? 'Showing enrolled batches, progress & continue learning.'
          : 'Showing catalog only — browse & enroll to unlock content.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm + 6,
    borderRadius: ms(16),
    padding: spacing.sm + 6,
    borderWidth: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    marginBottom: vs(10),
  },
  labelCol: { flex: 1 },
  flaskCircle: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: { fontSize: font.body, fontWeight: '800' },
  demoSub: { fontSize: font.caption, marginTop: vs(2) },
  segment: {
    flexDirection: 'row',
    borderRadius: ms(24),
    borderWidth: 1,
    padding: ms(3),
    gap: ms(2),
  },
  segBtn: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: ms(20),
    alignItems: 'center',
  },
  segText: { fontSize: font.caption, fontWeight: '700' },
  segTextActive: { color: '#fff' },
  hint: {
    fontSize: font.micro,
    textAlign: 'center',
    marginTop: vs(10),
    lineHeight: ms(14),
    paddingHorizontal: hs(4),
  },
});

export default DemoModeBar;
