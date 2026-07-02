import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { calendarService } from '../services/calendar.service';
import { mergeCalendarEvents } from '../utils/apiData';
import { font, hs, layout, ms, pagePadding, spacing, vs } from '../utils/responsive';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_COLORS: Record<string, string> = {
  live_class: '#6366f1',
  holiday: '#f43f5e',
  exam: '#ef4444',
  event: '#f59e0b',
  reminder: '#10b981',
};

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Calendar'>>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(
    route.params?.selectedDate ?? today.toISOString().split('T')[0],
  );

  useEffect(() => {
    const d = route.params?.selectedDate;
    if (d) {
      setSelectedDate(d);
      const [y, m] = d.split('-').map(Number);
      if (y && m) setCurrentDate(new Date(y, m - 1, 1));
    }
  }, [route.params?.selectedDate]);

  const monthParam = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const { data: feed, loading, refetch } = useApi(
    () => calendarService.getFeed(monthParam),
    [monthParam],
  );

  const events: any[] = useMemo(() => mergeCalendarEvents(feed), [feed]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    events.forEach(ev => {
      const date = (ev.date || ev.startDate || ev.scheduledAt || '').split('T')[0];
      if (date) {
        if (!map[date]) map[date] = [];
        map[date].push(ev);
      }
    });
    return map;
  }, [events]);

  const selectedEvents = eventsByDate[selectedDate] || [];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const goMonth = (dir: number) => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  };

  const todayStr = today.toISOString().split('T')[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Calendar</Text>
        <TouchableOpacity onPress={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}>
          <Text style={[styles.todayBtn, { color: c.primary }]}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={c.primary} />}
      >
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => goMonth(-1)} style={[styles.navArrow, { backgroundColor: c.card }]}>
            <Icon name="chevron-left" size={16} color={c.text} solid />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: c.text }]}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
          <TouchableOpacity onPress={() => goMonth(1)} style={[styles.navArrow, { backgroundColor: c.card }]}>
            <Icon name="chevron-right" size={16} color={c.text} solid />
          </TouchableOpacity>
        </View>

        <View style={[styles.calendar, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.dayHeaders}>
            {DAYS.map(d => (
              <Text key={d} style={[styles.dayHeader, { color: c.textMuted }]}>{d}</Text>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator color={c.primary} style={{ marginVertical: 32 }} />
          ) : (
            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvents = !!eventsByDate[dateStr];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dayEvents = eventsByDate[dateStr] || [];

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: c.primary },
                      isToday && !isSelected && { backgroundColor: `${c.primary}15` },
                    ]}
                    onPress={() => setSelectedDate(dateStr)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNum,
                      { color: c.text },
                      isSelected && { color: '#fff', fontWeight: '800' },
                      isToday && !isSelected && { color: c.primary, fontWeight: '800' },
                    ]}>
                      {day}
                    </Text>
                    {hasEvents && (
                      <View style={styles.dotsRow}>
                        {dayEvents.slice(0, 3).map((ev: any, idx: number) => (
                          <View key={idx} style={[styles.eventDot, { backgroundColor: EVENT_COLORS[ev.type] || c.primary }]} />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.eventsSection}>
          <Text style={[styles.eventsTitle, { color: c.text }]}>
            {selectedDate === todayStr ? "Today's Events" : `Events on ${selectedDate}`}
          </Text>
          {selectedEvents.length === 0 ? (
            <View style={[styles.noEvents, { backgroundColor: c.card, borderColor: c.border }]}>
              <IconBadge name="calendar-times" color={c.primary} size="lg" variant="soft" />
              <Text style={[styles.noEventsText, { color: c.textMuted }]}>No events on this date</Text>
            </View>
          ) : (
            selectedEvents.map((ev: any) => (
              <TouchableOpacity
                key={ev.id}
                style={[styles.eventCard, { backgroundColor: c.card, borderColor: c.border }]}
                activeOpacity={0.85}
                onPress={() => {
                  if (ev.type === 'live_class' || ev.lectureId) {
                    navigation.navigate('LiveClass', {
                      lectureId: ev.lectureId || ev.id,
                      title: ev.title,
                      teacherName: ev.teacherName,
                    });
                  }
                }}
              >
                <View style={[styles.eventBar, { backgroundColor: EVENT_COLORS[ev.type] || c.primary }]} />
                <View style={styles.eventBody}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, { color: c.text }]}>{ev.title}</Text>
                    <View style={[styles.eventTypeBadge, { backgroundColor: `${EVENT_COLORS[ev.type] || c.primary}20` }]}>
                      <Text style={[styles.eventTypeText, { color: EVENT_COLORS[ev.type] || c.primary }]}>
                        {(ev.type || 'event').replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  {ev.description && <Text style={[styles.eventDesc, { color: c.textMuted }]} numberOfLines={2}>{ev.description}</Text>}
                  {(ev.startTime || ev.scheduledAt) && (
                    <View style={styles.eventMeta}>
                      <Icon name="clock" size={12} color={c.textMuted} solid />
                      <Text style={[styles.eventMetaText, { color: c.textMuted }]}>
                        {ev.startTime || new Date(ev.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {ev.endTime ? ` - ${ev.endTime}` : ''}
                      </Text>
                    </View>
                  )}
                  {ev.batchName && (
                    <View style={styles.eventMeta}>
                      <Icon name="users" size={12} color={c.textMuted} solid />
                      <Text style={[styles.eventMetaText, { color: c.textMuted }]}>{ev.batchName}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {events.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={[styles.eventsTitle, { color: c.text }]}>All Events This Month</Text>
            {events.map((ev: any) => {
              const date = (ev.date || ev.startDate || ev.scheduledAt || '').split('T')[0];
              return (
                <TouchableOpacity
                  key={ev.id}
                  style={[styles.eventListItem, { backgroundColor: c.card, borderColor: c.border }]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.eventListDot, { backgroundColor: EVENT_COLORS[ev.type] || c.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eventListTitle, { color: c.text }]}>{ev.title}</Text>
                    <Text style={[styles.eventListDate, { color: c.textMuted }]}>{date}</Text>
                  </View>
                  <View style={[styles.eventTypeBadge, { backgroundColor: `${EVENT_COLORS[ev.type] || c.primary}20` }]}>
                    <Text style={[styles.eventTypeText, { color: EVENT_COLORS[ev.type] || c.primary }]}>
                      {(ev.type || 'event').replace('_', ' ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: pagePadding, paddingVertical: spacing.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: font.headline, fontWeight: '800' },
  todayBtn: { fontSize: font.caption, fontWeight: '700' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: pagePadding, marginBottom: spacing.sm, marginTop: spacing.sm },
  navArrow: { width: hs(36), height: hs(36), borderRadius: ms(18), alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
  monthTitle: { fontSize: font.title, fontWeight: '800' },
  calendar: { marginHorizontal: pagePadding, borderRadius: BorderRadius.xl, padding: spacing.md, borderWidth: 1, marginBottom: spacing.md, ...Shadow.soft },
  dayHeaders: { flexDirection: 'row', marginBottom: spacing.sm },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: font.tiny, fontWeight: '700' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: vs(6), borderRadius: ms(8) },
  dayNum: { fontSize: font.subhead, fontWeight: '600', marginBottom: vs(2) },
  dotsRow: { flexDirection: 'row', gap: vs(2), marginTop: vs(1) },
  eventDot: { width: ms(5), height: ms(5), borderRadius: ms(2.5) },
  eventsSection: { marginHorizontal: pagePadding, marginBottom: vs(20) },
  eventsTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.md },
  noEvents: { alignItems: 'center', gap: vs(10), padding: spacing.xl, borderRadius: BorderRadius.lg, borderWidth: 1, ...Shadow.soft },
  noEventsText: { fontSize: font.subhead },
  eventCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, marginBottom: vs(10), overflow: 'hidden', borderWidth: 1, ...Shadow.soft },
  eventBar: { width: hs(4) },
  eventBody: { flex: 1, padding: vs(14) },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xs },
  eventTitle: { flex: 1, fontSize: font.subhead, fontWeight: '700', marginRight: spacing.sm },
  eventTypeBadge: { paddingHorizontal: spacing.sm, paddingVertical: vs(3), borderRadius: ms(10) },
  eventTypeText: { fontSize: font.micro, fontWeight: '700', textTransform: 'uppercase' },
  eventDesc: { fontSize: font.caption, marginBottom: vs(6) },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: vs(5), marginTop: spacing.xs },
  eventMetaText: { fontSize: font.caption },
  eventListItem: { flexDirection: 'row', alignItems: 'center', gap: vs(10), padding: spacing.md, borderRadius: BorderRadius.md, marginBottom: spacing.sm, borderWidth: 1, ...Shadow.soft },
  eventListDot: { width: layout.dot, height: layout.dot, borderRadius: ms(5) },
  eventListTitle: { fontSize: font.caption, fontWeight: '600' },
  eventListDate: { fontSize: font.tiny, marginTop: vs(2) },
});

export default CalendarScreen;
