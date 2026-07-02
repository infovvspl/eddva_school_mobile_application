import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from '../Icon';
import RichText from './RichText';
import { Brand } from '../../constants/brand';
import { Colors, BorderRadius } from '../../constants/theme';
import type { VideoQuizCheckpoint } from '../../utils/videoQuizCheckpoints';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  visible: boolean;
  checkpoint: VideoQuizCheckpoint | null;
  onSubmit: (correct: boolean) => void;
  onSkip?: () => void;
};

const VideoQuizOverlay: React.FC<Props> = ({ visible, checkpoint, onSubmit, onSkip }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  React.useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [checkpoint?.id, visible]);

  if (!checkpoint) return null;

  const correct = selected === checkpoint.correctOption;

  const handleCheck = () => {
    if (!selected) return;
    setRevealed(true);
  };

  const handleContinue = () => {
    onSubmit(correct);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Icon name="lightbulb" size={ms(12)} color="#fff" solid />
              <Text style={styles.badgeText}>In-video quiz</Text>
            </View>
            {checkpoint.segmentTitle ? (
              <Text style={styles.segment}>{checkpoint.segmentTitle}</Text>
            ) : null}
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <RichText textStyle={styles.question}>{checkpoint.questionText}</RichText>

            {checkpoint.options.map(opt => {
              const isSelected = selected === opt.label;
              const isCorrect = opt.label === checkpoint.correctOption;
              let optionStyle = styles.option;
              if (revealed && isCorrect) optionStyle = { ...styles.option, ...styles.optionCorrect };
              else if (revealed && isSelected && !isCorrect) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
              } else if (isSelected) optionStyle = { ...styles.option, ...styles.optionSelected };

              return (
                <TouchableOpacity
                  key={opt.label}
                  style={optionStyle}
                  activeOpacity={revealed ? 1 : 0.85}
                  disabled={revealed}
                  onPress={() => setSelected(opt.label)}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <RichText textStyle={styles.optionText}>{opt.text}</RichText>
                  {revealed && isCorrect ? (
                    <Icon name="check-circle" size={ms(16)} color="#16A34A" solid />
                  ) : null}
                  {revealed && isSelected && !isCorrect ? (
                    <Icon name="times-circle" size={ms(16)} color="#DC2626" solid />
                  ) : null}
                </TouchableOpacity>
              );
            })}

            {revealed && checkpoint.explanation ? (
              <View style={styles.explainBox}>
                <Text style={styles.explainTitle}>Explanation</Text>
                <RichText textStyle={styles.explainText}>{checkpoint.explanation}</RichText>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            {!revealed ? (
              <>
                {onSkip ? (
                  <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
                  onPress={handleCheck}
                  disabled={!selected}
                >
                  <Text style={styles.primaryBtnText}>Check answer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
                <Text style={styles.primaryBtnText}>
                  {correct ? 'Continue watching' : 'Got it — continue'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: vs(6),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: hs(6),
    backgroundColor: Brand.blue900,
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  badgeText: { color: '#fff', fontSize: font.micro, fontWeight: '800' },
  segment: { fontSize: font.tiny, color: Colors.textMuted, fontWeight: '600' },
  body: { padding: spacing.md, maxHeight: vs(360) },
  question: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: vs(14),
    lineHeight: vs(22),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: vs(10),
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  optionCorrect: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  optionWrong: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  optionLabel: {
    width: hs(24),
    fontSize: font.tiny,
    fontWeight: '800',
    color: Colors.primary,
  },
  optionText: { flex: 1, fontSize: font.tiny, color: Colors.text, fontWeight: '600' },
  explainBox: {
    marginTop: vs(8),
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
  },
  explainTitle: { fontSize: font.tiny, fontWeight: '800', color: Colors.text, marginBottom: vs(4) },
  explainText: { fontSize: font.tiny, color: Colors.textSecondary, lineHeight: vs(18) },
  actions: {
    flexDirection: 'row',
    gap: hs(10),
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  skipBtn: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    justifyContent: 'center',
  },
  skipText: { fontSize: font.tiny, fontWeight: '700', color: Colors.textMuted },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: vs(12),
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontSize: font.body, fontWeight: '800' },
});

export default VideoQuizOverlay;
