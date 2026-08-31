import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function TimetableScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [timetableData, setTimetableData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await schoolApi.getTimetable();
        
        // Convert the map {'2026-07-08': [classes]} into an array suitable for UI rendering
        const formattedData = Object.keys(data).map(dateKey => {
          const classes = data[dateKey];
          // Get a short day name from dateKey (e.g. 'Mon')
          const dayName = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' });
          return {
            day: dayName,
            periods: classes.map((c: any) => c.title)
          };
        });

        setTimetableData(formattedData);
      } catch (err) {
        console.error('Error fetching timetable:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.subtext }}>Loading timetable...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Weekly timetable</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Your classes for the week</Text>
        </View>
      </View>

      {timetableData.length > 0 ? timetableData.map((day, idx) => (
        <View key={idx} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={styles.day}>{day.day}</Text>
          {day.periods.map((period: string, index: number) => (
            <View key={`${idx}-${index}`} style={styles.periodRow}>
              <Text style={styles.periodNumber}>{index + 1}</Text>
              <Text style={styles.periodTitle}>{period}</Text>
            </View>
          ))}
        </View>
      )) : (
        <Text style={[styles.subtitle, { color: theme.subtext, textAlign: 'center', marginTop: 40 }]}>
          No classes scheduled.
        </Text>
      )}
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: theme.text },
  subtitle: { fontSize: 14, color: theme.subtext, marginTop: 4, marginBottom: 14 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: theme.subtext,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  day: { fontSize: 16, fontWeight: '800', color: theme.primary, marginBottom: 8 },
  periodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  periodNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    color: theme.primary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    marginRight: 10,
  },
  periodTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
});
