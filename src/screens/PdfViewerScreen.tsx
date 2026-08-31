import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { useAppTheme } from '../context/ThemeContext';
import { ArrowLeft, Share2, Download } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export function PdfViewerScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  
  // URL to PDF file, mock if none provided
  const source = { 
    uri: routeParams?.url || 'http://samples.leanpub.com/thereactnativebook-sample.pdf', 
    cache: true 
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('studyMaterials')}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {routeParams?.title || 'Study Material'}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Download size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Share2 size={20} color={theme.text} />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
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
