import React, { useMemo } from 'react';
import { Text, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';
import { parseMathSegments, prepareMathDelimiters } from '../../utils/mathLatex';
import { shouldUseKatex } from '../../utils/renderMathHtml';
import KatexHtmlView from './KatexHtmlView';

function BoldText({ text, style }: { text: string; style?: TextStyle }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) {
          return (
            <Text key={i} style={styles.bold}>
              {bold[1]}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

type Props = {
  children: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const MathText: React.FC<Props> = ({ children, style, textStyle }) => {
  const prepared = useMemo(() => prepareMathDelimiters(children), [children]);
  const useKatex = useMemo(() => shouldUseKatex(prepared), [prepared]);

  if (!children.trim()) return null;

  if (useKatex) {
    return (
      <KatexHtmlView style={style} textStyle={textStyle}>
        {prepared}
      </KatexHtmlView>
    );
  }

  const segments = parseMathSegments(prepared);
  const onlyText = segments.every(s => s.type === 'text');

  if (onlyText) {
    return (
      <Text style={textStyle}>
        <BoldText text={prepared} style={textStyle} />
      </Text>
    );
  }

  return (
    <KatexHtmlView style={style} textStyle={textStyle}>
      {prepared}
    </KatexHtmlView>
  );
};

const styles = StyleSheet.create({
  bold: { fontWeight: '800', color: Colors.text },
});

export default MathText;
