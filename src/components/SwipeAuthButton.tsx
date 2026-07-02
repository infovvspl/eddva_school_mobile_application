import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { Brand } from '../constants/brand';
import { font, hs, ms, textFamily, vs } from '../utils/responsive';

type Props = {
  label: string;
  icon: string;
  onComplete: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HANDLE_SIZE = hs(44);
const HORIZONTAL_PAD = hs(6);

const SwipeAuthButton: React.FC<Props> = ({
  label,
  icon,
  onComplete,
  loading = false,
  disabled = false,
  style,
}) => {
  const dragX = useRef(new Animated.Value(0)).current;
  const onCompleteRef = useRef(onComplete);
  const [width, setWidth] = useState(0);
  const isDisabled = loading || disabled;
  const maxTravel = Math.max(0, width - HANDLE_SIZE - HORIZONTAL_PAD * 2);

  onCompleteRef.current = onComplete;

  const reset = () => {
    Animated.spring(dragX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  const complete = () => {
    Animated.timing(dragX, {
      toValue: maxTravel,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      onCompleteRef.current();
      setTimeout(reset, 250);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isDisabled && maxTravel > 0,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !isDisabled && maxTravel > 0 && Math.abs(gesture.dx) > 4,
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, Math.min(maxTravel, gesture.dx));
          dragX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const next = Math.max(0, Math.min(maxTravel, gesture.dx));
          if (next > maxTravel * 0.68) complete();
          else reset();
        },
        onPanResponderTerminate: reset,
      }),
    [dragX, isDisabled, maxTravel],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.wrap, style, isDisabled && styles.disabled]} onLayout={onLayout}>
      <LinearGradient
        colors={[Brand.blue900, Brand.blue700, Brand.blue400]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pill}
      >
        <Text style={[styles.label, textFamily.bold]}>{label}</Text>
        <View style={styles.chevrons}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Icon name="angle-double-right" size={ms(18)} color="#FFFFFF" solid />
          )}
        </View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.handle, { transform: [{ translateX: dragX }] }]}
        >
          <Icon name={icon} size={ms(18)} color={Brand.blue700} solid />
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  pill: {
    height: vs(54),
    borderRadius: ms(28),
    paddingHorizontal: HORIZONTAL_PAD,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Brand.blue700,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  handle: {
    position: 'absolute',
    left: HORIZONTAL_PAD,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: font.body,
  },
  chevrons: {
    position: 'absolute',
    right: hs(14),
    width: hs(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.55 },
});

export default SwipeAuthButton;
