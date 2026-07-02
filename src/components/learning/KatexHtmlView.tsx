import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMathHtmlDocument } from '../../utils/renderMathHtml';

type Props = {
  children: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

/**
 * Renders mixed text + LaTeX in one WebView using katex.renderToString (web MathText parity).
 */
const KatexHtmlView: React.FC<Props> = ({ children, style, textStyle }) => {
  const [height, setHeight] = useState(48);

  const html = useMemo(
    () =>
      buildMathHtmlDocument(children, {
        fontSize:
          typeof textStyle?.fontSize === 'number' ? textStyle.fontSize : 14,
        color: (textStyle?.color as string) || '#334155',
        lineHeight:
          typeof textStyle?.lineHeight === 'number'
            ? Number(textStyle.lineHeight) / (Number(textStyle.fontSize) || 14)
            : 1.55,
      }),
    [children, textStyle?.color, textStyle?.fontSize, textStyle?.lineHeight],
  );

  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const next = Number(event.nativeEvent.data);
    if (Number.isFinite(next) && next > 0) {
      const clamped = Math.min(Math.ceil(next) + 4, 8000);
      setHeight(prev => (Math.abs(prev - clamped) < 3 ? prev : clamped));
    }
  }, []);

  if (!children.trim()) return null;

  return (
    <View style={[styles.wrap, style, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default KatexHtmlView;
