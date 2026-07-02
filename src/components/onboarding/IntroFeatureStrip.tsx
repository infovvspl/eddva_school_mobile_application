import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { Brand } from '../../constants/brand';
import { font, hs, ms, textFamily, vs } from '../../utils/responsive';

const FEATURES = [
  { icon: 'brain', label: 'Smart Learn' },
  { icon: 'clipboard-list', label: 'Study Plans' },
  { icon: 'clipboard-check', label: 'Mock Tests' },
  { icon: 'chart-line', label: 'Analytics' },
] as const;

type Props = {
  /** Welcome slide — softer row, no heavy card chrome */
  variant?: 'default' | 'welcome';
};

const IntroFeatureStrip: React.FC<Props> = ({ variant = 'default' }) => {
  if (variant === 'welcome') {
    return (
      <View style={styles.rowWelcome}>
        <View style={styles.welcomeIconsRow}>
          {FEATURES.map(item => (
            <View key={item.icon} style={styles.welcomeCol}>
              <View style={styles.iconWrapWelcome}>
                <Icon name={item.icon} size={ms(22)} color={Brand.blue700} solid />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.welcomeLabelsRow}>
          {FEATURES.map(item => (
            <View key={`${item.icon}-label`} style={styles.welcomeCol}>
              <Text
                style={[styles.labelWelcome, textFamily.semibold]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {FEATURES.map((item, index) => (
        <React.Fragment key={item.icon}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={ms(20)} color={Brand.blue700} solid />
            </View>
            <Text style={[styles.label, textFamily.semibold]} numberOfLines={2}>
              {item.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: '#E8EEF4',
    paddingVertical: vs(10),
    paddingHorizontal: hs(6),
  },
  rowWelcome: {
    width: '100%',
    backgroundColor: '#F4F8FC',
    borderRadius: ms(18),
    paddingVertical: vs(14),
    paddingHorizontal: hs(8),
  },
  welcomeIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  welcomeLabelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  welcomeCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: hs(2),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: hs(2),
  },
  divider: {
    width: 1,
    height: vs(36),
    backgroundColor: '#E2E8F0',
  },
  iconWrap: {
    width: hs(36),
    height: hs(36),
    borderRadius: ms(10),
    backgroundColor: `${Brand.blue700}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(6),
  },
  iconWrapWelcome: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: font.micro,
    color: Brand.blue900,
    textAlign: 'center',
    lineHeight: ms(13),
  },
  labelWelcome: {
    fontSize: font.caption - 1,
    color: '#334155',
    lineHeight: ms(15),
  },
});

export default IntroFeatureStrip;
