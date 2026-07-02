import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors } from '../constants/theme';

/** Decorative education illustration for auth screens */
const AuthIllustration: React.FC = () => (
  <View style={styles.wrap}>
    <View style={styles.bookStack}>
      <View style={[styles.book, styles.book1]}>
        <Icon name="atom" size={18} color={Colors.primary} solid />
      </View>
      <View style={[styles.book, styles.book2]}>
        <Icon name="flask" size={16} color={Colors.secondary} solid />
      </View>
      <View style={[styles.book, styles.book3]}>
        <Icon name="calculator" size={14} color={Colors.accent} solid />
      </View>
    </View>
    <View style={styles.floatIcons}>
      <View style={[styles.float, styles.f1]}><Icon name="globe" size={14} color={Colors.primaryLight} solid /></View>
      <View style={[styles.float, styles.f2]}><Icon name="lightbulb" size={12} color={Colors.warning} solid /></View>
      <View style={[styles.float, styles.f3]}><Icon name="book" size={12} color={Colors.chemistry} solid /></View>
    </View>
    <View style={styles.person}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { height: 200, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 },
  bookStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 20 },
  book: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  book1: { width: 56, height: 72 },
  book2: { width: 48, height: 60, marginBottom: 8 },
  book3: { width: 40, height: 48, marginBottom: 14 },
  floatIcons: { ...StyleSheet.absoluteFillObject },
  float: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  f1: { top: 20, left: 30 },
  f2: { top: 40, right: 40 },
  f3: { top: 80, left: 50 },
  person: { position: 'absolute', bottom: 0, alignItems: 'center' },
  personHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: -4,
  },
  personBody: {
    width: 48,
    height: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.primaryLight,
  },
});

export default AuthIllustration;
