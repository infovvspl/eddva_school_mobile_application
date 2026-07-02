import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { useTheme } from '../../context/ThemeContext';
import type { BattleParticipant } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  participants: BattleParticipant[];
  myStudentId?: string;
  title?: string;
  emptyText?: string;
};

const BattleParticipantsList: React.FC<Props> = ({
  participants,
  myStudentId,
  title = 'In this room',
  emptyText = 'Waiting for someone to join…',
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const others = participants.filter(
    p => !myStudentId || p.studentId !== myStudentId,
  );

  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.head}>
        <View style={styles.liveDot} />
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={[styles.count, { color: c.textMuted }]}>
          {participants.length}/2
        </Text>
      </View>

      {participants.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>{emptyText}</Text>
      ) : (
        participants.map((p, i) => {
          const isMe = myStudentId && p.studentId === myStudentId;
          return (
            <View
              key={p.studentId || `${p.name}-${i}`}
              style={[styles.row, i > 0 && { borderTopColor: c.border, borderTopWidth: 1 }]}
            >
              <View style={[styles.avatar, { backgroundColor: `${c.primary}18` }]}>
                <Text style={[styles.initial, { color: c.primary }]}>
                  {(p.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text }]}>
                  {isMe ? 'You' : p.name}
                  {p.isBot ? ' (Bot)' : ''}
                </Text>
                <Text style={[styles.sub, { color: c.textMuted }]}>
                  {isMe ? 'Host' : p.isBot ? 'Practice opponent' : 'Joined · online'}
                </Text>
              </View>
              {!isMe && !p.isBot ? (
                <View style={styles.onlineChip}>
                  <Icon name="circle" size={6} color="#22C55E" solid />
                  <Text style={styles.onlineText}>Live</Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}

      {participants.length === 1 && others.length === 0 ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>
          Share your room code or keep searching — their name will appear here when they join.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: ms(16),
    borderWidth: 1,
    padding: spacing.md,
    marginTop: vs(12),
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginBottom: vs(10),
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  title: { flex: 1, fontSize: font.caption, fontWeight: '800' },
  count: { fontSize: font.micro, fontWeight: '700' },
  empty: { fontSize: font.caption, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingVertical: vs(10),
  },
  avatar: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: font.subhead, fontWeight: '800' },
  name: { fontSize: font.caption, fontWeight: '700' },
  sub: { fontSize: font.micro, marginTop: vs(2) },
  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(10),
  },
  onlineText: { fontSize: font.micro, fontWeight: '700', color: '#15803D' },
  hint: { fontSize: font.micro, marginTop: vs(8), lineHeight: vs(16) },
});

export default BattleParticipantsList;
