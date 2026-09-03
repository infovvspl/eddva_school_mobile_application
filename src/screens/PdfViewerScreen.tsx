import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import Pdf from 'react-native-pdf';
import { useAppTheme } from '../context/ThemeContext';
import { ArrowLeft, Share2, Download } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export function PdfViewerScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  
  const url: string | undefined = routeParams?.url;
  const source = { uri: url as string, cache: true };

  // Opening the viewer without a document used to show an unrelated sample book.
  if (!url) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('studyMaterials')}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {routeParams?.title || 'Study Material'}
          </Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            No document selected. Open a file from Study Materials.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('studyMaterials')}>
          <ArrowLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {routeParams?.title || 'Study Material'}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Download size={ms(20)} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Share2 size={ms(20)} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pdfContainer}>
        <Pdf
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log('PDF Error:', error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
          renderActivityIndicator={() => <ActivityIndicator size="large" color={theme.primary} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: ms(24) },
  emptyText: { fontSize: ms(15), textAlign: 'center', lineHeight: ms(22) },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: ms(8),
  },
  title: {
    flex: 1,
    fontSize: ms(18),
    fontWeight: '600',
    marginHorizontal: hs(16),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfContainer: {
    flex: 1,
    width: width,
    height: height,
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  }
});
