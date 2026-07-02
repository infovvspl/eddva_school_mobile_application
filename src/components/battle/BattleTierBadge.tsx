import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { getBattleTierMeta } from '../../utils/battleTier';
import { font, hs, ms, vs } from '../../utils/responsive';

type Props = {
  tier?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

const BattleTierBadge: React.FC<Props> = ({ tier, size = 'md', showLabel = true }) => {
  const meta = getBattleTierMeta(tier);
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: meta.bg,
          borderColor: `${meta.color}55`,
          paddingHorizontal: isLg ? hs(14) : isSm ? hs(8) : hs(10),
          paddingVertical: isSm ? vs(3) : vs(5),
        },
      ]}
    >
      <Icon
        name={meta.icon}
        size={isLg ? ms(16) : isSm ? ms(10) : ms(12)}
        color={meta.color}
        solid
      />
      {showLabel ? (
        <Text
          style={[
            styles.label,
            {
              color: meta.color,
              fontSize: isLg ? font.caption : isSm ? font.micro : font.tiny,
            },
          ]}
        >
          {meta.label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    borderRadius: ms(999),
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
});

export default BattleTierBadge;
