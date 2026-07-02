import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from '../Icon';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import { hs, ms, spacing, type as t, vs } from '../../utils/responsive';

type Course = {
  courseId: string;
  courseName: string;
  examType?: string;
  startsOn?: string;
};

type Props = {
  courses: Course[];
  colors: ThemeColors;
  onSelect: (courseId: string) => void;
};

const StudyPlanCoursePicker: React.FC<Props> = ({ courses, colors: c, onSelect }) => (
  <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
    <View style={[styles.welcome, { backgroundColor: `${Brand.blue700}18` }]}>
      <Icon name="star" size={ms(12)} color={Brand.blue700} solid />
      <Text style={[styles.welcomeText, { color: Brand.blue700 }]}>Welcome to Edva Learning Hub</Text>
    </View>
    <Text style={[styles.title, { color: c.text }]}>Select Your Course</Text>
    <Text style={[styles.sub, { color: c.textMuted }]}>
      Choose a curriculum to access your personalized study plan, backlogs, and AI revision tools.
    </Text>
    {courses.map(co => (
      <TouchableOpacity
        key={co.courseId}
        style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
        onPress={() => onSelect(co.courseId)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconBox, { backgroundColor: `${Brand.blue700}22` }]}>
          <Icon name="book-open" size={ms(22)} color={Brand.blue700} solid />
        </View>
        <Text style={[styles.cardTitle, { color: c.text }]}>{co.courseName}</Text>
        <View style={styles.metaRow}>
          <Icon name="bullseye" size={ms(11)} color={c.textMuted} solid />
          <Text style={[styles.meta, { color: c.textMuted }]}>{co.examType || 'JEE'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="clock" size={ms(11)} color={c.textMuted} solid />
          <Text style={[styles.meta, { color: c.textMuted }]}>
            {co.startsOn || co.examType || 'Enrolled batch'}
          </Text>
        </View>
        <View style={[styles.btn, { backgroundColor: Brand.blue900 }]}>
          <Text style={styles.btnText}>Enter Dashboard</Text>
          <Icon name="chevron-right" size={ms(12)} color="#fff" solid />
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: vs(40) },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: hs(6),
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    marginBottom: vs(16),
  },
  welcomeText: { ...t.captionBold },
  title: { ...t.headline, textAlign: 'center', marginBottom: vs(8) },
  sub: {
    ...t.body,
    textAlign: 'center',
    lineHeight: ms(24),
    marginBottom: vs(24),
    paddingHorizontal: hs(8),
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(14),
  },
  iconBox: {
    width: hs(48),
    height: hs(48),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  cardTitle: { ...t.subheadBold, marginBottom: vs(10) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6), marginBottom: vs(4) },
  meta: { ...t.captionBold },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    marginTop: vs(14),
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
  },
  btnText: { ...t.bodyBold, color: '#fff' },
});

export default StudyPlanCoursePicker;
