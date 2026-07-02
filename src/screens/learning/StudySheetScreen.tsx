import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import RichText from '../../components/learning/RichText';
import { buildStudySheetPayload, type SheetBlock } from '../../utils/studySheetContent';
import type { StudyResource } from '../../utils/topicResources';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StudySheet'>;

const SHEET = {
  backdrop: 'rgba(15, 23, 42, 0.72)',
  headerBg: '#FFF9F0',
  headerBorder: '#F3E8D8',
  orange: '#EA580C',
  orangeSoft: '#FFEDD5',
  navy: '#0F172A',
  muted: '#64748B',
  divider: '#D6B98A',
  purple: '#6D28D9',
  blue: '#2563EB',
  paper: '#FFFFFF',
  paperBorder: '#E2E8F0',
  rule: '#F1F5F9',
};

const BlockView: React.FC<{ block: SheetBlock }> = ({ block }) => {
  if (block.type === 'banner') {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{block.title}</Text>
      </View>
    );
  }
  if (block.type === 'heading') {
    return <RichText textStyle={styles.heading}>{block.text}</RichText>;
  }
  if (block.type === 'paragraph') {
    return <RichText textStyle={styles.paragraph}>{block.text}</RichText>;
  }
  if (block.type === 'bullets') {
    return (
      <View style={styles.bulletList}>
        {block.items.map(item => (
          <View key={item} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <RichText textStyle={styles.bulletText}>{item}</RichText>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.mcqBlock}>
      <View style={styles.mcqQuestionRow}>
        <Text style={styles.mcqNum}>{block.number}. </Text>
        <RichText textStyle={styles.mcqQuestion}>{block.question}</RichText>
      </View>
      {block.options.map(opt => (
        <RichText key={opt} textStyle={styles.mcqOption}>
          {opt}
        </RichText>
      ))}
    </View>
  );
};

const StudySheetScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const resource = route.params.resource as StudyResource;
  const sheet = useMemo(() => buildStudySheetPayload(resource), [resource]);

  const cardWidth = expanded ? width : Math.min(width - hs(24), hs(520));
  const cardMaxHeight = expanded ? height : height * 0.88;

  const onPrint = () => {
    Alert.alert('Print', `${sheet.headerTitle} will be sent to your print queue when connected.`);
  };

  return (
    <View style={[styles.root, { backgroundColor: SHEET.backdrop }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View
        style={[
          styles.shell,
          {
            paddingTop: insets.top + vs(8),
            paddingBottom: insets.bottom + vs(8),
            paddingHorizontal: expanded ? 0 : hs(12),
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              maxHeight: cardMaxHeight,
              flex: 1,
              borderRadius: expanded ? 0 : ms(16),
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: SHEET.headerBorder }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.docIcon, { backgroundColor: SHEET.orangeSoft }]}>
                <Icon name="file-alt" size={ms(14)} color={SHEET.orange} solid />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {sheet.headerTitle}
                </Text>
                <View style={[styles.tag, { backgroundColor: SHEET.orangeSoft }]}>
                  <Text style={[styles.tagText, { color: SHEET.orange }]}>{sheet.tagLabel}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setExpanded(v => !v)}
                accessibilityLabel={expanded ? 'Exit full screen' : 'Full screen'}
              >
                <Icon name={expanded ? 'compress' : 'expand'} size={ms(14)} color={SHEET.navy} solid />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onPrint} accessibilityLabel="Print">
                <Icon name="print" size={ms(14)} color={SHEET.navy} solid />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Close"
              >
                <Icon name="times" size={ms(15)} color={SHEET.navy} solid />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            <Text style={styles.docTitle}>{sheet.documentTitle}</Text>
            <View style={styles.divider} />
            <Text style={styles.meta}>{sheet.metaLine}</Text>

            {sheet.blocks.map((block, idx) => (
              <View key={`${block.type}-${idx}`}>
                <BlockView block={block} />
                {block.type === 'mcq' && idx < sheet.blocks.length - 1 ? (
                  <View style={styles.questionRule} />
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: SHEET.paper,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SHEET.paperBorder,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: hs(8),
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    backgroundColor: SHEET.headerBg,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1, flexDirection: 'row', gap: hs(10), minWidth: 0 },
  docIcon: {
    width: hs(36),
    height: hs(36),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: { flex: 1, minWidth: 0, gap: vs(6) },
  headerTitle: { fontSize: font.caption, fontWeight: '800', color: SHEET.navy, lineHeight: ms(18) },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: hs(8),
    paddingVertical: vs(2),
    borderRadius: ms(6),
  },
  tagText: { fontSize: font.micro, fontWeight: '800', letterSpacing: 0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: hs(4) },
  iconBtn: {
    width: hs(34),
    height: hs(34),
    borderRadius: hs(17),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SHEET.headerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyScroll: { flex: 1 },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
    paddingBottom: vs(28),
  },
  docTitle: {
    fontSize: font.title + 2,
    fontWeight: '900',
    color: SHEET.navy,
    lineHeight: ms(30),
  },
  divider: {
    height: 2,
    backgroundColor: SHEET.divider,
    marginTop: vs(12),
    marginBottom: vs(10),
    borderRadius: 1,
  },
  meta: { fontSize: font.caption, color: SHEET.muted, fontWeight: '600', marginBottom: vs(18) },
  banner: {
    backgroundColor: SHEET.purple,
    borderRadius: ms(10),
    paddingVertical: vs(10),
    paddingHorizontal: hs(14),
    marginBottom: vs(16),
  },
  bannerText: { color: '#FFFFFF', fontSize: font.caption, fontWeight: '800', textAlign: 'center' },
  heading: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: SHEET.navy,
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  paragraph: {
    fontSize: font.caption,
    lineHeight: ms(22),
    color: SHEET.navy,
    marginBottom: vs(12),
    fontWeight: '500',
  },
  bulletList: { gap: vs(8), marginBottom: vs(14) },
  bulletRow: { flexDirection: 'row', gap: hs(8), alignItems: 'flex-start' },
  bulletDot: { fontSize: font.caption, color: SHEET.blue, fontWeight: '800', lineHeight: ms(22) },
  bulletText: {
    flex: 1,
    fontSize: font.caption,
    lineHeight: ms(22),
    color: SHEET.navy,
    fontWeight: '500',
  },
  mcqBlock: { marginBottom: vs(18) },
  mcqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(10),
    gap: hs(4),
  },
  mcqQuestion: {
    flex: 1,
    fontSize: font.caption,
    lineHeight: ms(22),
    color: SHEET.navy,
    fontWeight: '600',
  },
  mcqNum: { color: SHEET.blue, fontWeight: '800', lineHeight: ms(22) },
  mcqOption: {
    fontSize: font.caption,
    color: SHEET.navy,
    lineHeight: ms(22),
    marginBottom: vs(4),
    paddingLeft: hs(4),
    fontWeight: '500',
  },
  questionRule: {
    height: 1,
    backgroundColor: SHEET.rule,
    marginBottom: vs(14),
  },
});

export default StudySheetScreen;
