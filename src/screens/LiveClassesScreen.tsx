import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Video, PlayCircle, ChevronLeft, VideoIcon, Radio } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function LiveClassesScreen({ onNavigate, embedded = false }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [ongoing, setOngoing] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [schedData, ongoingData] = await Promise.all([
          schoolApi.getScheduledLiveLectures().catch(() => []),
          schoolApi.getActiveLiveLectures().catch(() => [])
        ]);
        
        setScheduled(Array.isArray(schedData) ? schedData : (schedData.data || []));
        setOngoing(Array.isArray(ongoingData) ? ongoingData : (ongoingData.data || []));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Inside the Videos tab the parent supplies the frame and title, so the
  // screen drops its own chrome rather than nesting a second header.
  const Frame: any = embedded ? View : SafeAreaView;

  return (
    <Frame style={styles.container}>
      {!embedded && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
            <ChevronLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Classes</Text>
          <View style={{ width: ms(32) }} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ backgroundColor: theme.background }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <>
            {/* ONGOING LIVE CLASSES */}
            <View style={{ marginTop: vs(16), marginBottom: vs(24) }}>
              <View style={styles.liveSectionHeader}>
                <Radio size={ms(16)} color="#EF4444" style={{marginRight: hs(8)}} />
                <Text style={[styles.liveSectionHeaderText, {color: '#EF4444'}]}>LIVE NOW</Text>
              </View>
              
              {ongoing.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No classes are currently live.</Text></View>
              ) : (
                ongoing.map((item: any, idx: number) => (
                  <View key={`live-${idx}`} style={[styles.liveCard, { borderColor: '#EF4444', borderWidth: 1 }]}>
                    <View style={[styles.liveCardTop, { backgroundColor: '#FEF2F2' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <VideoIcon size={ms(14)} color="#EF4444" style={{ marginRight: hs(6) }} />
                        <Text style={[styles.liveCardTopText, {color: '#EF4444'}]}>BROADCASTING</Text>
                      </View>
                    </View>
                    <View style={styles.liveCardBottom}>
                      <Text style={styles.liveCardTeacher}>{item.teacherName || 'Instructor'}</Text>
                      <Text style={styles.liveCardSubject}>{item.title || item.subjectName}</Text>
                      <TouchableOpacity style={[styles.joinBtn, {backgroundColor: '#EF4444'}]} onPress={() => onNavigate('liveClassRoom', { id: item.id || item.lectureId, title: item.title || item.subjectName })}>
                        <Text style={styles.joinBtnText}>Join Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* SCHEDULED CLASSES */}
            <View>
              <View style={styles.liveSectionHeader}>
                <View style={styles.liveDot} />
                <Text style={styles.liveSectionHeaderText}>SCHEDULED LECTURES</Text>
              </View>
              
              {scheduled.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No upcoming classes scheduled.</Text></View>
              ) : (
                scheduled.map((item: any, idx: number) => (
                  <View key={`sched-${idx}`} style={styles.liveCard}>
                    <View style={styles.liveCardTop}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <VideoIcon size={ms(14)} color={theme.surface} style={{ marginRight: hs(6) }} />
                        <Text style={styles.liveCardTopText}>SCHEDULED</Text>
                      </View>
                      <View style={styles.liveCardDatePill}>
                         <Text style={styles.liveCardDateText}>{new Date(item.scheduledFor).toLocaleString()}</Text>
                      </View>
                    </View>
                    <View style={styles.liveCardBottom}>
                      <Text style={styles.liveCardTeacher}>{item.teacherName}</Text>
                      <Text style={styles.liveCardSubject}>{item.title}</Text>
                      <TouchableOpacity style={styles.joinBtn} onPress={() => Alert.alert('Notice', 'Class hasn\'t started yet.')}>
                        <Text style={styles.joinBtnText}>Set Reminder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Frame>
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
  backBtn: {
    padding: ms(4),
  },
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(18),
    color: theme.text,
  },
  content: {
    padding: ms(16),
  },
  liveSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  liveDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#EF4444',
    marginRight: hs(8),
  },
  liveSectionHeaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(12),
    color: theme.subtext,
    letterSpacing: 1,
  },
  liveCard: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    marginBottom: vs(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05,
    shadowRadius: ms(4),
  },
  liveCardTop: {
    backgroundColor: '#EF4444',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveCardTopText: {
    fontFamily: 'Poppins-SemiBold',
    color: theme.surface,
    fontSize: ms(11),
    letterSpacing: 1,
  },
  liveCardDatePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  liveCardDateText: {
    fontFamily: 'Poppins-Medium',
    color: theme.surface,
    fontSize: ms(11),
  },
  liveCardBottom: {
    padding: ms(16),
  },
  liveCardTeacher: {
    fontFamily: 'Poppins-Medium',
    color: theme.subtext,
    fontSize: ms(12),
  },
  liveCardSubject: {
    fontFamily: 'Poppins-Medium',
    color: theme.text,
    fontSize: ms(16),
    marginTop: vs(4),
    marginBottom: vs(16),
  },
  joinBtn: {
    backgroundColor: theme.primary,
    paddingVertical: vs(12),
    borderRadius: ms(10),
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: 'Poppins-SemiBold',
    color: theme.surface,
    fontSize: ms(14),
  },
  emptyCard: {
    backgroundColor: theme.surface,
    padding: ms(24),
    borderRadius: ms(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    color: theme.subtext,
    fontSize: ms(14),
  },
});
