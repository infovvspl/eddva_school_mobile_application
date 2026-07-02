import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import IconBadge from './IconBadge';
import { ThemeColors } from '../constants/themes';
import { getSubjectMeta } from '../utils/subjectMeta';

export type TopicItem = {
  id: string;
  name?: string;
  topicName?: string;
  title?: string;
  durationMinutes?: number;
};

export type SubjectGroup = {
  id: string;
  displayName: string;
  topics: TopicItem[];
};

type Props = {
  subjects: SubjectGroup[];
  colors: ThemeColors;
  isEnrolled: boolean;
  onTopicPress: (topic: TopicItem, subjectName: string) => void;
  onLockedPress: () => void;
};

const SubjectTopicTree: React.FC<Props> = ({
  subjects,
  colors: c,
  isEnrolled,
  onTopicPress,
  onLockedPress,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    subjects.forEach((s, i) => {
      init[s.id] = i === 0;
    });
    return init;
  });

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (subjects.length === 0) {
    return (
      <Text style={[styles.empty, { color: c.textMuted }]}>
        Lessons will appear here once available.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {subjects.map(subject => {
        const meta = getSubjectMeta(subject.displayName);
        const open = !!expanded[subject.id];
        const topicCount = subject.topics.length;

        return (
          <View
            key={subject.id}
            style={[styles.subjectCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <TouchableOpacity
              style={styles.subjectHead}
              onPress={() => toggle(subject.id)}
              activeOpacity={0.85}
            >
              <IconBadge name={meta.icon} color={meta.color} size="md" variant="soft" />
              <View style={styles.subjectText}>
                <Text style={[styles.subjectName, { color: c.text }]}>{subject.displayName}</Text>
                <Text style={[styles.subjectMeta, { color: c.textMuted }]}>
                  {topicCount} topic{topicCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Icon
                name={open ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={c.textMuted}
                solid
              />
            </TouchableOpacity>

            {open &&
              subject.topics.map((topic, idx) => {
                const label = topic.name || topic.topicName || topic.title || `Topic ${idx + 1}`;
                const mins = topic.durationMinutes || 21;
                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicRow,
                      { borderTopColor: c.border },
                      idx === subject.topics.length - 1 && styles.topicRowLast,
                    ]}
                    activeOpacity={isEnrolled ? 0.85 : 1}
                    onPress={() => {
                      if (isEnrolled) onTopicPress(topic, subject.displayName);
                      else onLockedPress();
                    }}
                  >
                    <View style={[styles.topicNum, { backgroundColor: `${meta.color}18` }]}>
                      <Text style={[styles.topicNumText, { color: meta.color }]}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.topicTitle, { color: isEnrolled ? c.text : c.textMuted }]}
                        numberOfLines={2}
                      >
                        {label}
                      </Text>
                      <View style={styles.topicMeta}>
                        <Icon name="clock" size={10} color={c.textMuted} solid />
                        <Text style={[styles.topicDur, { color: c.textMuted }]}>{mins} min</Text>
                        {!isEnrolled ? (
                          <Text style={[styles.lockedTag, { color: c.textMuted }]}> · Locked</Text>
                        ) : null}
                      </View>
                    </View>
                    <IconBadge
                      name={isEnrolled ? 'play' : 'lock'}
                      color={isEnrolled ? meta.color : c.textMuted}
                      size="sm"
                      variant={isEnrolled ? 'gradient' : 'soft'}
                    />
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  subjectCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  subjectText: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '800' },
  subjectMeta: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  topicRowLast: { paddingBottom: 14 },
  topicNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicNumText: { fontSize: 12, fontWeight: '800' },
  topicTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topicDur: { fontSize: 11, fontWeight: '600' },
  lockedTag: { fontSize: 11, fontWeight: '600' },
});

export default SubjectTopicTree;
