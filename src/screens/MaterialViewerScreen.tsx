import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Linking,
} from 'react-native';
import VideoPlayer from 'react-native-video';
import { WebView } from 'react-native-webview';
import { hs, vs, ms } from '../utils/responsive';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Markdown } from '../components/Markdown';

const isPlayable = (url: string) => /\.mp4(\?|$)/i.test(url);

/**
 * Handles the resource shapes StudyMaterialsScreen cannot: an .mp4 (played
 * natively), a real non-PDF file such as .pptx (rendered through Google's
 * public document viewer -- there is no native Office renderer here), or a
 * resource with no file at all, whose content is Markdown in `description`.
 */
export function MaterialViewerScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const item = routeParams?.item;
  // Opened from the student Study Materials list by default, but the teacher's
  // Course Content screen passes its own route so Back returns where it came from.
  const backTo = routeParams?.backTo ?? 'studyMaterials';
  const [webviewLoading, setWebviewLoading] = useState(true);
  // onLoadEnd fires once the viewer's outer page has loaded, not once the
  // document preview inside it has actually rendered -- confirmed live: Google's
  // page returns a valid 200 response and the WebView reports "loaded" while
  // the embedded conversion is still spinning, sometimes indefinitely for a
  // private-bucket URL Google has not seen before. A hard timeout is the only
  // honest way to avoid stranding the reader on a spinner that may never clear.
  const [viewerStuck, setViewerStuck] = useState(false);
  const stuckTimer = useRef<any>(null);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate(backTo)}>
            <ArrowLeft size={ms(22)} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Study Material</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No resource selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const url: string | undefined = item.fileUrl || item.file_url;
  const video = !!url && isPlayable(url);
  // docs.google.com/viewer needs a URL it can fetch, so it does not work
  // against every private storage bucket -- but it is the standard fallback
  // for rendering Office documents with no extra native dependency.
  const viewerUrl = url && !video ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}` : null;

  useEffect(() => {
    if (!viewerUrl) return;
    stuckTimer.current = setTimeout(() => setViewerStuck(true), 14000);
    return () => clearTimeout(stuckTimer.current);
  }, [viewerUrl]);

  const openExternally = () => { if (url) Linking.openURL(url).catch(() => {}); };

  return (
    <SafeAreaView style={[styles.container, video && { backgroundColor: '#000' }]}>
      <View style={[styles.header, video && styles.headerDark]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate(backTo)}>
          <ArrowLeft size={ms(22)} color={video ? '#FFF' : theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, video && { color: '#FFF' }]} numberOfLines={1}>
          {item.title || 'Study Material'}
        </Text>
        {!!url && (
          <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('pdfViewer', { url, title: item.title })}>
            <ExternalLink size={ms(19)} color={video ? '#FFF' : theme.text} />
          </TouchableOpacity>
        )}
      </View>

      {video ? (
        <View style={styles.videoBox}>
          <VideoPlayer
            source={{ uri: url }}
            style={styles.video}
            controls
            resizeMode="contain"
          />
        </View>
      ) : viewerUrl ? (
        <View style={{ flex: 1 }}>
          {webviewLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
          {viewerStuck && (
            <View style={styles.stuckBanner}>
              <AlertTriangle size={ms(15)} color="#B45309" />
              <Text style={styles.stuckText}>This preview is taking a while, or may not render this file.</Text>
              <TouchableOpacity style={styles.stuckBtn} onPress={openExternally}>
                <Text style={styles.stuckBtnText}>Open externally</Text>
              </TouchableOpacity>
            </View>
          )}
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1 }}
            onLoadEnd={() => setWebviewLoading(false)}
            onError={() => { setWebviewLoading(false); setViewerStuck(true); }}
            onHttpError={() => { setWebviewLoading(false); setViewerStuck(true); }}
            startInLoadingState
          />
        </View>
      ) : item.description ? (
        <ScrollView contentContainerStyle={styles.markdownContent}>
          {!!item.uploaded_by_name && <Text style={styles.byline}>By {item.uploaded_by_name}</Text>}
          <Markdown value={item.description} theme={theme} />
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>This resource has no viewable content yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  headerDark: { backgroundColor: '#000', borderBottomColor: '#222' },
  iconBtn: { padding: ms(6) },
  title: { flex: 1, fontSize: ms(16), fontWeight: '700', color: theme.text, marginHorizontal: hs(10) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: ms(24) },
  emptyText: { fontSize: ms(14), color: theme.subtext, textAlign: 'center' },
  videoBox: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  video: { width: '100%', aspectRatio: 16 / 9 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  markdownContent: { padding: ms(18), paddingBottom: vs(60) },
  byline: { fontSize: ms(11.5), color: theme.subtext, marginBottom: vs(12), fontWeight: '600' },
  stuckBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
  },
  stuckText: { flex: 1, fontSize: ms(12), lineHeight: ms(16), color: '#92400E', fontWeight: '600' },
  stuckBtn: {
    backgroundColor: '#B45309',
    borderRadius: ms(8),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
  },
  stuckBtnText: { color: '#FFF', fontSize: ms(11.5), fontWeight: '700' },
});
