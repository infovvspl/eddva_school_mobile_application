import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from '../Icon';
import { ThemeColors } from '../../constants/themes';
import { BorderRadius, Shadow } from '../../constants/theme';
import type { FaqItem, StudyResource } from '../../utils/topicResources';
import { RESOURCE_META } from '../../utils/topicResources';
import { font, hs, ms, vs } from '../../utils/responsive';

type Props = {
  items: StudyResource[];
  colors: ThemeColors;
  onOpen?: (item: StudyResource) => void;
  onDownload?: (item: StudyResource) => void;
  emptyLabel?: string;
};

export const StudyResourceList: React.FC<Props> = ({
  items,
  colors: c,
  onOpen,
  onDownload,
  emptyLabel = 'No resources in this section yet.',
}) => {
  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
        <Icon name="folder-open" size={ms(28)} color={c.textMuted} solid />
        <Text style={[styles.emptyText, { color: c.textMuted }]}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map(item => {
        const meta = RESOURCE_META[item.kind];
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
            onPress={() => onOpen?.(item)}
            activeOpacity={0.88}
          >
            <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
              <Icon name={meta.icon} size={ms(18)} color={meta.color} solid />
            </View>
            <View style={styles.body}>
              <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.sub, { color: c.textMuted }]} numberOfLines={1}>
                {item.subtitle}
              </Text>
              {item.questionCount ? (
                <Text style={[styles.meta, { color: meta.color }]}>
                  {item.questionCount} questions
                </Text>
              ) : null}
              {item.pageCount ? (
                <Text style={[styles.meta, { color: meta.color }]}>{item.pageCount} pages</Text>
              ) : null}
            </View>
            <TouchableOpacity
              hitSlop={10}
              onPress={() => {
                if (onDownload) onDownload(item);
                else
                  Alert.alert('Download', `${item.title} will be saved for offline access.`);
              }}
            >
              <Icon
                name={item.kind === 'lecture' ? 'play-circle' : 'download'}
                size={ms(18)}
                color={c.primary}
                solid
              />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

type FaqProps = {
  items: FaqItem[];
  colors: ThemeColors;
};

export const FaqList: React.FC<FaqProps> = ({ items, colors: c }) => (
  <View style={styles.list}>
    {items.map(f => (
      <View
        key={f.id}
        style={[styles.faqCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
      >
        <View style={styles.faqQ}>
          <Icon name="question-circle" size={ms(14)} color={c.primary} solid />
          <Text style={[styles.faqQuestion, { color: c.text }]}>{f.question}</Text>
        </View>
        <Text style={[styles.faqAnswer, { color: c.textMuted }]}>{f.answer}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: vs(10) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: ms(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: font.caption, fontWeight: '800' },
  sub: { fontSize: font.tiny, marginTop: vs(2), fontWeight: '600' },
  meta: { fontSize: font.micro, fontWeight: '700', marginTop: vs(4) },
  empty: {
    alignItems: 'center',
    padding: ms(24),
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: vs(10),
  },
  emptyText: { fontSize: font.caption, textAlign: 'center' },
  faqCard: {
    padding: ms(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: vs(8),
  },
  faqQ: { flexDirection: 'row', alignItems: 'flex-start', gap: hs(8) },
  faqQuestion: { flex: 1, fontSize: font.caption, fontWeight: '800', lineHeight: ms(20) },
  faqAnswer: { fontSize: font.caption, lineHeight: ms(20), paddingLeft: hs(22) },
});

export default StudyResourceList;
