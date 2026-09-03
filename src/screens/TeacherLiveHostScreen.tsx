import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { ArrowLeft, Video, Mic, StopCircle, BarChart2 } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function TeacherLiveHostScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [isLive, setIsLive] = useState(false);

  const toggleStream = async () => {
    if (isLive) {
      try {
        Alert.alert('Ending Stream', 'Closing the live session.');
        await schoolApi.teacher.endLiveLecture('stream-id-123');
        setIsLive(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        Alert.alert('Going Live', 'Starting the live session.');
        await schoolApi.teacher.startLiveLecture({ subject: 'Math', title: 'Algebra Live' });
        setIsLive(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const createPoll = async () => {
    if (!isLive) {
      Alert.alert('Not Live', 'You must be broadcasting to send a poll.');
      return;
    }
    try {
      Alert.alert('Poll', 'Sending pop quiz to students.');
      await schoolApi.teacher.createLivePoll('stream-id-123', { question: 'Is x=2 a solution?' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fake Video Preview Background */}
      <View style={styles.videoPreview}>
        <Text style={styles.videoPlaceholderText}>{isLive ? 'Live Camera Feed Active' : 'Camera Preview'}</Text>
      </View>

      <View style={styles.overlayContainer}>
        {/* Header Overlay */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={styles.iconBtn}>
            <ArrowLeft size={ms(24)} color="#fff" />
          </TouchableOpacity>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Controls Overlay */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isLive ? '#EF4444' : '#10B981' }]} onPress={toggleStream}>
            {isLive ? <StopCircle size={ms(28)} color="#fff" /> : <Video size={ms(28)} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn}>
            <Mic size={ms(24)} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#3B82F6' }]} onPress={createPoll}>
            <BarChart2 size={ms(24)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  videoPlaceholderText: { color: '#94a3b8', fontSize: ms(16), fontWeight: '600' },
  overlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: hs(20) },
  iconBtn: { padding: ms(8), backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: ms(20) },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(20) },
  liveDot: { width: hs(8), height: vs(8), borderRadius: ms(4), backgroundColor: '#fff', marginRight: hs(6) },
  liveText: { color: '#fff', fontWeight: 'bold', fontSize: ms(12) },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: ms(20) },
  controlBtn: { width: hs(64), height: vs(64), borderRadius: ms(32), backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
});
