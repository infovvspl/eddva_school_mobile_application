import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Brand } from '../constants/brand';
import { font, ms, textFamily, vs } from '../utils/responsive';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
};

const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  loading,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isDisabled = Boolean(loading || disabled);

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.outline, style, isDisabled && styles.disabled]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color={Brand.blue700} />
        ) : (
          <Text style={[styles.outlineText, textFamily.bold]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      style={[style, isDisabled && styles.disabled]}
    >
      <LinearGradient
        colors={[...Brand.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.label, textFamily.bold]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: vs(14),
    paddingHorizontal: ms(20),
    borderRadius: ms(16),
    alignItems: 'center',
    shadowColor: Brand.blue700,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { color: '#fff', fontSize: font.body },
  outline: {
    paddingVertical: vs(13),
    borderRadius: ms(16),
    borderWidth: 1.5,
    borderColor: Brand.blue700,
    alignItems: 'center',
  },
  outlineText: { color: Brand.blue900, fontSize: font.body },
  disabled: { opacity: 0.45 },
});

export default PrimaryButton;
