import re

# ================================
# REFACTOR LiveClassesScreen.tsx
# ================================
live_content = """import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Video, PlayCircle, ChevronLeft, VideoIcon, Radio } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function LiveClassesScreen({ onNavigate }: any) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Classes</Text>
        <View style={{ width: ms(32) }} />
      </View>

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
                      <TouchableOpacity style={[styles.joinBtn, {backgroundColor: '#EF4444'}]} onPress={() => Alert.alert('Live Class', 'Joining stream...')}>
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
                      <TouchableOpacity style={styles.joinBtn} onPress={() => Alert.alert('Notice', 'Class hasn\\'t started yet.')}>
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
    </SafeAreaView>
  );
}
"""
with open('src/screens/LiveClassesScreen.tsx', 'r', encoding='utf-8') as f:
    orig_live = f.read()
styles_match = re.search(r'const getStyles.*', orig_live, re.DOTALL)
if styles_match:
    live_content += '\n' + styles_match.group(0)
with open('src/screens/LiveClassesScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(live_content)


# ================================
# REFACTOR RecordedClassesScreen.tsx
# ================================
rec_content = """import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions, Platform, StatusBar, SafeAreaView } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Video, Sparkles, FileText, Loader, Play, Clock, Calendar, ChevronLeft, Search, Bell } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export function RecordedClassesScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const data = await schoolApi.getLiveRecordings();
        let records = [];
        if (Array.isArray(data)) records = data;
        else if (data && Array.isArray(data.data)) records = data.data;
        else if (data && Array.isArray(data.recordings)) records = data.recordings;
        
        setRecordings(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  const renderStatCard = (icon: any, title: string, value: string | number, subtitle: string, bg: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: vs(8) }}>
        {icon}
        <Text style={[styles.statTitle, { color, marginLeft: hs(6) }]}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate && onNavigate('learn')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Recorded Classes</Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.iconBtn}><Search size={ms(20)} color={theme.subtext} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Bell size={ms(20)} color={theme.subtext} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ backgroundColor: theme.background }}>
        
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Recorded Classes</Text>
          <Text style={styles.pageSub}>Watch teacher-uploaded recorded lectures, open transcript, and study from generated notes.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          {renderStatCard(<Video size={ms(16)} color={theme.primary} />, 'LECTURES', recordings.length, 'Recorded lessons available', '#EFF6FF', theme.primary)}
          {renderStatCard(<Sparkles size={ms(16)} color="#10B981" />, 'AI NOTES', 0, 'Ready to read and revise', '#ECFDF5', '#10B981')}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <View style={styles.listContainer}>
            {recordings.map((item, index) => (
              <View key={item.id || index} style={styles.card}>
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnailOverlay}>
                    <Play size={ms(32)} color={theme.surface} fill="#FFF" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{Math.floor(item.duration / 60)} mins</Text>
                  </View>
                  <View style={styles.thumbnailLabel}>
                    <Text style={styles.thumbnailLabelText}>{item.subjectName}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.subjectText}>{item.subjectName}</Text>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.chapterText}>{item.teacherName}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={ms(14)} color={theme.subtext} />
                      <Text style={styles.metaText}>{new Date(item.recordedAt).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.watchBtn}>
                    <Play size={ms(14)} color={theme.surface} fill="#FFF" style={{ marginRight: hs(6) }} />
                    <Text style={styles.watchBtnText}>Watch Video</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
"""
with open('src/screens/RecordedClassesScreen.tsx', 'r', encoding='utf-8') as f:
    orig_rec = f.read()
styles_match = re.search(r'const getStyles.*', orig_rec, re.DOTALL)
if styles_match:
    rec_content += '\n' + styles_match.group(0)
with open('src/screens/RecordedClassesScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(rec_content)

print("Finished refactoring Live and Recorded screens.")
