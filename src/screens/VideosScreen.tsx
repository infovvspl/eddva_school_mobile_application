import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Radio, MonitorPlay } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { LiveClassesScreen } from './LiveClassesScreen';
import { RecordedClassesScreen } from './RecordedClassesScreen';

type Tab = 'live' | 'recorded';

/**
 * Tab host for the two video surfaces. Both children render in `embedded`
 * mode so this screen owns the frame, title and tab strip, and they are kept
 * mounted-on-demand rather than duplicated here.
 */
export function VideosScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  // Recorded is the default: there is usually nothing live right now, so the
  // library is the more useful landing view.
  // A resume target always lands on the recorded library.
  const resumeRecordingId = routeParams?.resumeRecordingId ?? null;
  const [tab, setTab] = useState<Tab>('recorded');

  const TabButton = ({ id, label, icon }: { id: Tab; label: string; icon: any }) => {
    const active = tab === id;
    return (
      <TouchableOpacity
        style={[styles.tab, active && styles.tabActive]}
        onPress={() => setTab(id)}
        activeOpacity={0.8}
      >
        {icon(active ? theme.primary : theme.subtext)}
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Videos</Text>
        <Text style={styles.subtitle}>Join a live class or catch up on a recording.</Text>

        <View style={styles.tabs}>
          <TabButton
            id="live"
            label="Live Classes"
            icon={(c: string) => <Radio size={ms(16)} color={c} />}
          />
          <TabButton
            id="recorded"
            label="Recorded"
            icon={(c: string) => <MonitorPlay size={ms(16)} color={c} />}
          />
        </View>
      </View>

      <View style={styles.body}>
        {tab === 'live' ? (
          <LiveClassesScreen onNavigate={onNavigate} embedded />
        ) : (
          <RecordedClassesScreen
            onNavigate={onNavigate}
            embedded
            resumeRecordingId={resumeRecordingId}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.surface,
    // The root SafeAreaView already insets the status bar on both platforms,
    // so this only needs breathing room below it -- not a second status bar.
    paddingTop: vs(12),
    paddingHorizontal: hs(20),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: ms(24),
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    fontSize: ms(13),
    color: theme.subtext,
    marginTop: vs(2),
  },
  tabs: {
    flexDirection: 'row',
    gap: hs(8),
    marginTop: vs(14),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tabActive: {
    backgroundColor: theme.primarySoft ?? '#EFF6FF',
    borderColor: theme.primary,
  },
  tabText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: theme.subtext,
  },
  tabTextActive: {
    color: theme.primary,
  },
  body: {
    flex: 1,
  },
});
