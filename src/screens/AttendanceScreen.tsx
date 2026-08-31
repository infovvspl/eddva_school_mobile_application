import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ChevronLeft, UserCheck } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

export function AttendanceScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: ms(32) }} />
      </View>
      <View style={styles.content}>
        <UserCheck size={ms(48)} color={theme.subtext} />
        <Text style={styles.emptyText}>Attendance features coming soon</Text>
      </View>
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
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: ms(18), color: theme.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  emptyText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext, marginTop: vs(16) }
});
