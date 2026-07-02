import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';
import {
  EXAM_PREFERENCES,
  ExamPreferenceId,
} from '../constants/examPreferences';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  visible: boolean;
  selectedId: ExamPreferenceId;
  onSelect: (id: ExamPreferenceId) => void;
  onClose: () => void;
};

const GoalPreferenceModal: React.FC<Props> = ({ visible, selectedId, onSelect, onClose }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: c.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: c.surface }]}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <Text style={[styles.title, { color: c.text }]}>Change your goal</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>We’ll show programs for your exam</Text>

          {EXAM_PREFERENCES.map(pref => {
            const active = pref.id === selectedId;
            return (
              <TouchableOpacity
                key={pref.id}
                style={[
                  styles.option,
                  { backgroundColor: c.chipBg, borderColor: c.borderLight },
                  active && { borderColor: c.primary, backgroundColor: c.chipActiveBg },
                ]}
                onPress={() => {
                  onSelect(pref.id);
                  onClose();
                }}
                activeOpacity={0.88}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: c.chipActiveBg },
                    active && { backgroundColor: c.primary },
                  ]}
                >
                  <Icon
                    name={pref.examFilter === 'NEET' ? 'dna' : 'atom'}
                    size={18}
                    color={active ? '#fff' : c.primary}
                    solid
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: c.text }, active && { color: c.primary }]}>
                    {pref.label}
                  </Text>
                  <Text style={[styles.optionSub, { color: c.textMuted }]}>{pref.subtitle}</Text>
                </View>
                {active ? (
                  <Icon name="check-circle" size={20} color={c.primary} solid />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default GoalPreferenceModal;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    ...Shadow.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: 10,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { fontSize: 15, fontWeight: '800' },
  optionSub: { fontSize: 11, marginTop: 2 },
});
