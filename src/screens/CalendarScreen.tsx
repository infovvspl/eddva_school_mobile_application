import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

type EventItem = {
  id?: string;
  title?: string;
  description?: string | null;
  category?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string | null;
};

// The API returns either a bare array or an enveloped { data: [...] }.
const unwrapList = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.events)) return res.events;
  if (Array.isArray(res?.data?.events)) return res.data.events;
  return [];
};

export function CalendarScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await schoolApi.getEvents();
      const list = unwrapList(res);
      // Soonest first; undated entries sink to the bottom.
      list.sort((a, b) => {
        const da = new Date(a.startTime || 0).getTime() || Infinity;
        const db = new Date(b.startTime || 0).getTime() || Infinity;
        return da - db;
      });
      setEvents(list);
    } catch (err: any) {
      console.error('[calendar] load failed', err);
      setError(err?.message || 'Could not load events. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Events carry startTime/endTime as ISO strings; all-day events ignore the clock.
  const formatWhen = (e: EventItem) => {
    if (!e.startTime) return '';
    const start = new Date(e.startTime);
    if (isNaN(start.getTime())) return String(e.startTime);
    const day = start.toDateString();
    if (e.isAllDay) return `${day} • All day`;
    const time = (d: Date) =>
      d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const end = e.endTime ? new Date(e.endTime) : null;
    return end && !isNaN(end.getTime())
      ? `${day} • ${time(start)} – ${time(end)}`
      : `${day} • ${time(start)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={{ width: ms(32) }} />
      </View>
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={events.length === 0 ? styles.content : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {error ? (
            <>
              <Calendar size={ms(48)} color={theme.subtext} />
              <Text style={styles.emptyText}>{error}</Text>
            </>
          ) : events.length === 0 ? (
            <>
              <Calendar size={ms(48)} color={theme.subtext} />
              <Text style={styles.emptyText}>No upcoming events.</Text>
            </>
          ) : (
            events.map((e, i) => (
              <View key={e.id || i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{e.title || 'Event'}</Text>
                  {!!e.category && <Text style={styles.cardTag}>{e.category}</Text>}
                </View>
                {!!formatWhen(e) && <Text style={styles.cardDate}>{formatWhen(e)}</Text>}
                {!!e.location && <Text style={styles.cardDesc}>📍 {e.location}</Text>}
                {!!e.description && <Text style={styles.cardDesc}>{e.description}</Text>}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface
  },
  backBtn: { padding: ms(4) },
  headerTitle: { fontFamily: 'Poppins-Medium', fontSize: ms(18), color: theme.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  emptyText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext, marginTop: vs(16), textAlign: 'center', paddingHorizontal: hs(32) },
  listContent: { padding: hs(16), paddingBottom: vs(32), backgroundColor: theme.background },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, flex: 1, paddingRight: hs(8) },
  cardTag: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(11),
    color: theme.primary,
    textTransform: 'uppercase',
  },
  cardDate: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.primary, marginTop: vs(6) },
  cardDesc: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, marginTop: vs(8), lineHeight: ms(19) }
});
