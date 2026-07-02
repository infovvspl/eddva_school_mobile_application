import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'AeroRoadmap'>;

const DAYS = [
  { day: 1, title: 'Electrostatics baseline', priority: 'high' as const },
  { day: 2, title: 'Organic nomenclature', priority: 'medium' as const },
  { day: 3, title: 'Calculus — limits drill', priority: 'low' as const },
];

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

const AeroRoadmapScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader title="30-Day Aero Roadmap" subtitle="Aero Synthesis plan" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={['#004499', '#0066cc']} style={styles.banner}>
          <Text style={styles.bannerTitle}>Day 4 of 30</Text>
          <Text style={styles.bannerSub}>3 tasks · 2 milestones unlocked</Text>
        </LinearGradient>
        {DAYS.map(d => (
          <TouchableOpacity
            key={d.day}
            style={[styles.task, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate('AIStudyRoom' as any, { title: d.title })}
            activeOpacity={0.9}
          >
            <View style={[styles.badge, { backgroundColor: `${PRIORITY_COLOR[d.priority]}22` }]}>
              <Text style={[styles.badgeText, { color: PRIORITY_COLOR[d.priority] }]}>
                {d.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.taskTitle, { color: c.text }]}>Day {d.day}: {d.title}</Text>
            <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: vs(32) },
  banner: { borderRadius: ms(18), padding: spacing.lg, marginBottom: vs(16) },
  bannerTitle: { fontSize: font.title, fontWeight: '900', color: '#fff' },
  bannerSub: { fontSize: font.caption, color: 'rgba(255,255,255,0.8)', marginTop: vs(4) },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
    marginBottom: vs(10),
  },
  badge: { paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(8) },
  badgeText: { fontSize: font.micro, fontWeight: '800' },
  taskTitle: { flex: 1, fontSize: font.caption, fontWeight: '700' },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1.5,
    marginTop: vs(8),
  },
  flashText: { fontSize: font.caption, fontWeight: '800' },
});

export default AeroRoadmapScreen;
