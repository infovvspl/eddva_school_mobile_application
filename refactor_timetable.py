import re

filepath = 'src/screens/TimetableScreen.tsx'

content = """import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function TimetableScreen() {
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
      <Text style={[styles.title, { color: theme.text }]}>Weekly timetable</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Your classes for the week</Text>

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
"""

with open(filepath, 'r', encoding='utf-8') as f:
    orig = f.read()
    
# Extract styles
styles_match = re.search(r'const getStyles.*', orig, re.DOTALL)
if styles_match:
    content += '\n' + styles_match.group(0)
    
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("TimetableScreen refactored.")
