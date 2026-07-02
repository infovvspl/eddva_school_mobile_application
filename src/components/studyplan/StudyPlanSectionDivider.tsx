import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/themes';
import { vs } from '../../utils/responsive';

type Props = { colors: ThemeColors };

/** Visual break between hub header and tab content */
const StudyPlanSectionDivider: React.FC<Props> = ({ colors: c }) => (
  <View style={styles.wrap}>
    <View style={[styles.line, { backgroundColor: c.border }]} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingVertical: vs(10) },
  line: { height: 1, opacity: 0.9 },
});

export default StudyPlanSectionDivider;
