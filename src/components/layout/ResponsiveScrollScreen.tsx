import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vs } from '../../utils/responsive';

type Props = ScrollViewProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Merged into contentContainerStyle */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Full-height scroll area with bottom safe padding — use on screens that overflow on small phones.
 */
const ResponsiveScrollScreen: React.FC<Props> = ({
  children,
  style,
  contentStyle,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  ...rest
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + vs(20) },
        contentStyle,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});

export default ResponsiveScrollScreen;
