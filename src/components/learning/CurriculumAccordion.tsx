import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../Icon';
import IconBadge from '../IconBadge';
import { CurriculumSubject } from '../../utils/buildCurriculum';
import { ThemeColors } from '../../constants/themes';
import { BorderRadius } from '../../constants/theme';
import { font, hs, ms, vs } from '../../utils/responsive';

type Props = {
  subjects: CurriculumSubject[];
  colors: ThemeColors;
  onTopicPress: (topicId: string, topicName: string, subjectName: string) => void;
  onTopicPlay?: (topicId: string, topicName: string, subjectName: string) => void;
};

const CurriculumAccordion: React.FC<Props> = ({ subjects, colors: c, onTopicPress, onTopicPlay }) => {
  const [expandedSubject, setExpandedSubject] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    subjects.forEach((s, i) => {
      init[s.id] = i === 0;
    });
    return init;
  });
  const [expandedChapter, setExpandedChapter] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    subjects[0]?.chapters.forEach((ch, i) => {
      init[ch.id] = i === 0;
    });
    return init;
  });

  return (
    <View style={styles.wrap}>
      {subjects.map(subject => {
        const subOpen = !!expandedSubject[subject.id];
        const pct =
          subject.totalTopics > 0
            ? Math.round((subject.completedTopics / subject.totalTopics) * 100)
            : 0;

        return (
          <View
            key={subject.id}
            style={[styles.subjectCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <TouchableOpacity
              style={styles.subjectHead}
              onPress={() => setExpandedSubject(p => ({ ...p, [subject.id]: !p[subject.id] }))}
            >
              <IconBadge name={subject.icon} color={subject.color} size="md" variant="soft" />
              <View style={styles.flex}>
                <Text style={[styles.subjectTitle, { color: c.text }]}>{subject.name}</Text>
                <Text style={[styles.meta, { color: c.textMuted }]}>
                  {subject.completedTopics}/{subject.totalTopics} topics · {subject.chapters.length}{' '}
                  chapters
                </Text>
              </View>
              <Text style={[styles.pct, { color: c.primary }]}>{pct}%</Text>
              <Icon name={subOpen ? 'chevron-up' : 'chevron-down'} size={ms(12)} color={c.textMuted} solid />
            </TouchableOpacity>

            {subOpen
              ? subject.chapters.map(chapter => {
                  const chOpen = !!expandedChapter[chapter.id];
                  const lectureCount = chapter.topics.reduce((n, t) => n + t.lectureCount, 0);
                  const resCount = chapter.topics.reduce(
                    (n, t) =>
                      n + t.resources.dpp + t.resources.pyq + t.resources.notes + t.resources.mindmaps,
                    0,
                  );

                  return (
                    <View key={chapter.id} style={[styles.chapterBlock, { borderTopColor: c.border }]}>
                      <TouchableOpacity
                        style={styles.chapterHead}
                        onPress={() =>
                          setExpandedChapter(p => ({ ...p, [chapter.id]: !p[chapter.id] }))
                        }
                      >
                        <View style={[styles.chapterIcon, { backgroundColor: `${c.text}12` }]}>
                          <Icon name="book" size={ms(14)} color={c.text} solid />
                        </View>
                        <View style={styles.flex}>
                          <Text style={[styles.chapterTitle, { color: c.text }]}>{chapter.name}</Text>
                          <Text style={[styles.meta, { color: c.textMuted }]}>
                            {chapter.topics.length} topics · {lectureCount} lectures · {resCount} resources
                          </Text>
                        </View>
                        <Icon
                          name={chOpen ? 'chevron-up' : 'chevron-down'}
                          size={ms(11)}
                          color={c.textMuted}
                          solid
                        />
                      </TouchableOpacity>

                      {chOpen
                        ? chapter.topics.map(topic => (
                            <View
                              key={topic.id}
                              style={[styles.topicRow, { borderTopColor: c.borderLight }]}
                            >
                              <TouchableOpacity
                                style={styles.flex}
                                onPress={() => onTopicPress(topic.id, topic.name, subject.name)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.topicTitle, { color: c.text }]}>{topic.name}</Text>
                                <Text style={[styles.meta, { color: c.textMuted }]}>
                                  {topic.durationMinutes}m · 0/{topic.lectureCount} lectures
                                </Text>
                                <View style={styles.pills}>
                                  {topic.resources.dpp > 0 ? (
                                    <View style={[styles.pill, { backgroundColor: '#FFEDD5' }]}>
                                      <Text style={[styles.pillText, { color: '#C2410C' }]}>
                                        {topic.resources.dpp} DPP
                                      </Text>
                                    </View>
                                  ) : null}
                                  {topic.resources.pyq > 0 ? (
                                    <View style={[styles.pill, { backgroundColor: '#EDE9FE' }]}>
                                      <Text style={[styles.pillText, { color: '#6D28D9' }]}>
                                        {topic.resources.pyq} PYQ
                                      </Text>
                                    </View>
                                  ) : null}
                                  {topic.resources.notes > 0 ? (
                                    <View style={[styles.pill, { backgroundColor: '#DBEAFE' }]}>
                                      <Text style={[styles.pillText, { color: '#1D4ED8' }]}>
                                        {topic.resources.notes} Notes
                                      </Text>
                                    </View>
                                  ) : null}
                                  {topic.resources.mindmaps > 0 ? (
                                    <View style={[styles.pill, { backgroundColor: '#D1FAE5' }]}>
                                      <Text style={[styles.pillText, { color: '#047857' }]}>
                                        {topic.resources.mindmaps} Mindmap
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              </TouchableOpacity>
                              <View style={styles.topicActions}>
                                {onTopicPlay ? (
                                  <TouchableOpacity
                                    style={[styles.playBtn, { backgroundColor: c.primary }]}
                                    onPress={() => onTopicPlay(topic.id, topic.name, subject.name)}
                                    hitSlop={8}
                                  >
                                    <Icon name="play" size={ms(10)} color="#fff" solid />
                                  </TouchableOpacity>
                                ) : null}
                                <TouchableOpacity
                                  onPress={() => onTopicPress(topic.id, topic.name, subject.name)}
                                  hitSlop={8}
                                >
                                  <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))
                        : null}
                    </View>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(10) },
  subjectCard: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: ms(14),
  },
  flex: { flex: 1, minWidth: 0 },
  subjectTitle: { fontSize: font.body, fontWeight: '800' },
  meta: { fontSize: font.tiny, marginTop: vs(2), fontWeight: '600' },
  pct: { fontSize: font.caption, fontWeight: '800', marginRight: hs(6) },
  chapterBlock: { borderTopWidth: StyleSheet.hairlineWidth },
  chapterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingHorizontal: ms(14),
    paddingVertical: vs(12),
  },
  chapterIcon: {
    width: hs(36),
    height: hs(36),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterTitle: { fontSize: font.caption, fontWeight: '800' },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(14),
    paddingVertical: vs(12),
    paddingLeft: hs(28),
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: hs(8),
  },
  topicTitle: { fontSize: font.caption, fontWeight: '700' },
  topicActions: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  playBtn: {
    width: hs(32),
    height: hs(32),
    borderRadius: hs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(6), marginTop: vs(6) },
  pill: { paddingHorizontal: hs(8), paddingVertical: vs(3), borderRadius: ms(8) },
  pillText: { fontSize: font.micro, fontWeight: '800' },
});

export default CurriculumAccordion;
