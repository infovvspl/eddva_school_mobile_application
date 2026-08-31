import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions, Platform, StatusBar, SafeAreaView } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Video, Sparkles, FileText, Loader, Play, Clock, Calendar, ChevronLeft, Search, Bell, X } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';
import VideoPlayer from 'react-native-video';

const { width, height } = Dimensions.get('window');

export function RecordedClassesScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

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

  const handlePlayVideo = (item: any) => {
    setIsVideoLoading(true);
    setActiveVideo(item);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setIsVideoLoading(false);
  };

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

  if (activeVideo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={styles.videoHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={closeVideo}>
            <ChevronLeft size={ms(24)} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: '#FFF' }]}>{activeVideo.title}</Text>
        </View>
        <View style={styles.fullScreenVideoContainer}>
          {isVideoLoading && (
            <View style={styles.videoLoader}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
          <VideoPlayer
            source={{ uri: activeVideo.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4' }}
            style={styles.fullScreenVideo}
            controls={true}
            resizeMode="contain"
            onLoad={() => setIsVideoLoading(false)}
            onError={(e) => {
              console.error("Video error:", e);
              setIsVideoLoading(false);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

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

                  <TouchableOpacity style={styles.watchBtn} onPress={() => handlePlayVideo(item)}>
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.surfaceAlt,
  },
  backBtn: {
    padding: hs(4),
  },
  navTitle: {
    flex: 1,
    fontSize: ms(18),
    fontWeight: '600',
    color: theme.text,
    marginLeft: hs(12),
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
  },
  iconBtn: {
    padding: hs(4),
  },
  content: {
    padding: hs(20),
    paddingBottom: vs(40),
  },
  header: {
    marginBottom: vs(24),
  },
  pageTitle: {
    fontSize: ms(24),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(8),
  },
  pageSub: {
    fontSize: ms(14),
    color: theme.subtext,
    lineHeight: ms(20),
  },
  statsContainer: {
    flexDirection: 'row',
    gap: hs(12),
    marginBottom: vs(32),
  },
  statCard: {
    width: width * 0.4,
    padding: hs(16),
    borderRadius: ms(16),
    marginRight: hs(12),
  },
  statTitle: {
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: ms(28),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  statSubtitle: {
    fontSize: ms(12),
    color: theme.subtext,
    lineHeight: ms(16),
  },
  listContainer: {
    gap: vs(16),
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    padding: hs(16),
    flexDirection: 'column',
    gap: vs(16),
    borderWidth: 1,
    borderColor: theme.surfaceAlt,
    ...Platform.select({
      ios: {
        shadowColor: theme.subtext,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  thumbnailContainer: {
    width: '100%',
    height: vs(160),
    backgroundColor: theme.text, // Dark gradient placeholder
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailOverlay: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: hs(12),
    right: hs(12),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
  },
  durationText: {
    color: theme.surface,
    fontSize: ms(11),
    fontWeight: '600',
  },
  thumbnailLabel: {
    position: 'absolute',
    top: hs(12),
    left: hs(12),
    backgroundColor: theme.primary,
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(4),
  },
  thumbnailLabelText: {
    color: theme.surface,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
  },
  subjectText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: theme.subtext,
    letterSpacing: 1,
    marginBottom: vs(4),
  },
  titleText: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  chapterText: {
    fontSize: ms(14),
    color: theme.subtext,
    marginBottom: vs(12),
  },
  aiNotesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    marginBottom: vs(16),
  },
  aiNotesText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#10B981',
    marginLeft: hs(6),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
    marginBottom: vs(16),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: ms(12),
    color: theme.subtext,
    marginLeft: hs(6),
  },
  notesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  notesPillText: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#10B981',
    marginLeft: hs(4),
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: vs(12),
    borderRadius: ms(24),
    marginTop: vs(8),
  },
  watchBtnText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: theme.surface,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  fullScreenVideoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -ms(20) }, { translateY: -vs(20) }],
    zIndex: 1,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  }
});
