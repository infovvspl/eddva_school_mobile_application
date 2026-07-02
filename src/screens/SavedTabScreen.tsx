import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { useDemo } from '../context/DemoContext';
import { Shadow } from '../constants/theme';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

/** Saved tab — bookmarks only; course browse lives on Home when not enrolled */
const SavedTabScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { hasCourses } = useDemo();
  const c = theme.colors;

  const goHome = () => {
    navigation.navigate('Dashboard');
  };

  const goMyCourses = () => {
    const stack = navigation.getParent?.() ?? navigation;
    stack.navigate('MyCourses');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>Saved</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>
        {hasCourses
          ? 'Lectures and notes you bookmark will appear here'
          : 'Save items from your courses after you enroll'}
      </Text>

      <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
        <View style={[styles.iconWrap, { backgroundColor: `${c.primary}14` }]}>
          <Icon name="bookmark" size={ms(28)} color={c.primary} solid />
        </View>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Nothing saved yet</Text>
        <Text style={[styles.emptySub, { color: c.textMuted }]}>
          {hasCourses
            ? 'Open a lecture and tap bookmark to save it for later'
            : 'Explore programs on Home first — buying a course unlocks saved content here'}
        </Text>

        {hasCourses ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: c.primary }]}
            onPress={goMyCourses}
            activeOpacity={0.88}
          >
            <Icon name="book-open" size={ms(14)} color="#fff" solid />
            <Text style={styles.btnText}>My Courses</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: c.primary }]}
            onPress={goHome}
            activeOpacity={0.88}
          >
            <Icon name="home" size={ms(14)} color="#fff" solid />
            <Text style={styles.btnText}>Explore on Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  title: { fontSize: font.title + 4, fontWeight: '900', marginTop: vs(8) },
  subtitle: { fontSize: font.caption, marginTop: vs(6), marginBottom: vs(20), lineHeight: ms(20) },
  emptyCard: {
    borderRadius: ms(20),
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: hs(64),
    height: hs(64),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(14),
  },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800', marginBottom: vs(6) },
  emptySub: { fontSize: font.caption, textAlign: 'center', lineHeight: ms(20), marginBottom: vs(18) },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
    borderRadius: ms(14),
  },
  btnText: { fontSize: font.caption, fontWeight: '800', color: '#fff' },
});

export default SavedTabScreen;
