import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Bell, BellDot, Check, BookOpen, Calendar, Settings, ShieldAlert, Circle, ArrowLeft } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const TABS = ['All', 'Academic', 'Event', 'System'];

const getTypeConfig = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'academic': return { icon: BookOpen, bg: '#ECFDF5', color: '#10B981' };
    case 'event': return { icon: Calendar, bg: '#FFFBEB', color: '#F59E0B' };
    case 'system': return { icon: Settings, bg: '#EFF6FF', color: '#2563EB' };
    default: return { icon: Bell, bg: '#F8FAFC', color: '#64748B' };
  }
};

export function NotificationsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const {} = useAppTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const notifs = await schoolApi.getNotifications();
        let records = [];
        if (Array.isArray(notifs)) records = notifs;
        else if (notifs && Array.isArray(notifs.data)) records = notifs.data;
        else if (notifs && Array.isArray(notifs.notifications)) records = notifs.notifications;
        else if (notifs && Array.isArray(notifs.results)) records = notifs.results;
        
        setNotifications(records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await schoolApi.markNotificationRead(id);
      setNotifications((prev) => 
        prev.map((n: any) => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n: any) => !n.read);
      await Promise.all(unread.map((n: any) => schoolApi.markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n: any) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = activeTab === 'All' 
    ? notifications 
    : notifications.filter((n: any) => n.type?.toLowerCase() === activeTab.toLowerCase());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: hs(12) }}>
              <ArrowLeft size={ms(24)} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Activity Center</Text>
          </View>
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
            <Check size={ms(16)} color="#2563EB" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: vs(40) }} />
        ) : filteredNotifs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <ShieldAlert size={ms(48)} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySub}>No new notifications in this category.</Text>
          </View>
        ) : (
          filteredNotifs.map((item: any, idx: number) => {
            const { icon: Icon, bg, color } = getTypeConfig(item.type);
            return (
              <TouchableOpacity 
                key={item.id || idx} 
                style={[styles.card, !item.read && styles.cardUnread]} 
                onPress={() => handleMarkAsRead(item.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <Icon size={ms(22)} color={color} />
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, !item.read && { color: '#0F172A', fontFamily: 'Poppins-SemiBold' }]}>
                    {item.title || 'Update'}
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.message}</Text>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>

                {!item.read && (
                  <View style={styles.unreadIndicator}>
                    <Circle size={ms(10)} color="#2563EB" fill="#2563EB" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  header: { backgroundColor: theme.surface, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: hs(16), marginBottom: vs(16) },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(24), color: theme.text },
  
  markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primarySoft, paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(20), borderWidth: 1, borderColor: theme.border },
  markAllText: { color: theme.primary, fontFamily: 'Poppins-Medium', fontSize: ms(12), marginLeft: hs(4) },
  
  tabsContainer: { paddingHorizontal: hs(16), paddingBottom: vs(12), gap: ms(8) },
  tab: { paddingHorizontal: hs(16), paddingVertical: vs(8), borderRadius: ms(20), backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border },
  tabActive: { backgroundColor: theme.primary, borderColor: theme.primary, shadowColor: theme.primary, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.2, shadowRadius: ms(8), elevation: 4 },
  tabText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  tabTextActive: { color: '#FFF' },

  content: { padding: ms(16), paddingBottom: vs(40) },
  
  card: { backgroundColor: theme.card, padding: ms(16), borderRadius: ms(20), flexDirection: 'row', alignItems: 'flex-start', marginBottom: vs(12), borderWidth: 1, borderColor: theme.cardBorder, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  cardUnread: { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  
  iconBox: { width: hs(44), height: vs(44), borderRadius: ms(16), justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: hs(16), marginRight: hs(8) },
  cardTitle: { fontFamily: 'Poppins-Medium', fontSize: ms(15), color: theme.subtext, marginBottom: vs(2) },
  cardDesc: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, lineHeight: ms(20) },
  cardTime: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.subtext, marginTop: vs(8) },
  
  unreadIndicator: { justifyContent: 'center', alignItems: 'center', height: vs(44), width: hs(24) },

  emptyContainer: { alignItems: 'center', marginTop: vs(80), backgroundColor: theme.card, padding: ms(32), borderRadius: ms(24), borderWidth: 1, borderColor: theme.cardBorder },
  emptyIconBox: { width: hs(80), height: vs(80), borderRadius: ms(40), backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', marginBottom: vs(16) },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(4) },
  emptySub: { fontSize: ms(14), color: theme.subtext, fontFamily: 'Poppins-Regular', textAlign: 'center' },
});
