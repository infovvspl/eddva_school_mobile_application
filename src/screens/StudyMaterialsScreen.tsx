import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import EDDVAScreenHeader from '../components/EDDVAScreenHeader';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studyMaterialsService } from '../services/studyMaterials.service';
import { asArray } from '../utils/apiData';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

const StudyMaterialsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [busyId, setBusyId] = useState<string | null>(null);

  const materialsQuery = useApi(() => studyMaterialsService.getMaterials(), []);
  const accessQuery = useApi(() => studyMaterialsService.getAccessStatus(), []);

  const materials = asArray(materialsQuery.data, ['materials', 'items', 'studyMaterials']);
  const enrolled = Boolean((accessQuery.data as any)?.enrolled ?? (accessQuery.data as any)?.canDownload);

  const onRefresh = () => {
    materialsQuery.refetch();
    accessQuery.refetch();
  };

  const openPreview = (id: string) => {
    const url = studyMaterialsService.getPreviewUrl(id);
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open preview'));
  };

  const handleDownload = async (id: string, title: string) => {
    if (!enrolled) {
      Alert.alert('Enrollment required', 'Buy or enroll in a course to download full PDFs.', [
        { text: 'Browse courses', onPress: () => navigation.navigate('Courses') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setBusyId(id);
    try {
      const { data } = await studyMaterialsService.getDownloadMeta(id);
      const url = (data as any)?.downloadUrl || (data as any)?.url;
      if (!url) {
        Alert.alert('Download', 'Download link not available yet.');
        return;
      }
      await Linking.openURL(url);
    } catch (err: any) {
      Alert.alert('Download failed', err?.message || `Could not download ${title}`);
    } finally {
      setBusyId(null);
    }
  };

  const loading = materialsQuery.loading && materials.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader
        title="Study Materials"
        subtitle="Preview books and download when enrolled"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={materialsQuery.loading || accessQuery.loading}
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : materials.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="book" size={ms(36)} color={c.textMuted} solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No materials yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Study books will appear here when published by your institute.
            </Text>
          </View>
        ) : (
          materials.map((m: any) => {
            const id = String(m.id || m.materialId);
            const title = String(m.title || m.name || 'Study material');
            return (
              <View
                key={id}
                style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
              >
                <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                  {title}
                </Text>
                {m.subject ? (
                  <Text style={[styles.cardSub, { color: c.textMuted }]}>{m.subject}</Text>
                ) : null}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: `${c.primary}15` }]}
                    onPress={() => openPreview(id)}
                  >
                    <Icon name="eye" size={ms(12)} color={c.primary} solid />
                    <Text style={[styles.btnText, { color: c.primary }]}>Preview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: enrolled ? c.primary : c.chipBg }]}
                    onPress={() => handleDownload(id, title)}
                    disabled={busyId === id}
                  >
                    {busyId === id ? (
                      <ActivityIndicator color={enrolled ? '#fff' : c.primary} size="small" />
                    ) : (
                      <>
                        <Icon
                          name="download"
                          size={ms(12)}
                          color={enrolled ? '#fff' : c.textMuted}
                          solid
                        />
                        <Text style={[styles.btnText, { color: enrolled ? '#fff' : c.textMuted }]}>
                          {enrolled ? 'Download' : 'Buy Course'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: vs(40) },
  empty: { alignItems: 'center', paddingVertical: vs(48), gap: vs(8) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center', lineHeight: ms(22) },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  cardTitle: { fontSize: font.body, fontWeight: '800', marginBottom: vs(4) },
  cardSub: { fontSize: font.tiny, marginBottom: vs(12) },
  actions: { flexDirection: 'row', gap: hs(10) },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
  },
  btnText: { fontSize: font.tiny, fontWeight: '800' },
});

export default StudyMaterialsScreen;
