import React from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { shouldUseKatex } from '../../utils/renderMathHtml';
import MarkdownRenderer from './MarkdownRenderer';
import MathText from './MathText';

/** True when content looks like markdown (headings, lists, bold blocks). */
export function looksLikeMarkdown(text: string): boolean {
  return (
    /^#{1,3}\s/m.test(text) ||
    /^[-*•]\s/m.test(text) ||
    /^\d+[.)]\s/m.test(text) ||
    (/\*\*[^*]+\*\*/.test(text) && text.includes('\n')) ||
    text.split('\n').filter(l => l.trim()).length > 2
  );
}

type Props = {
  children: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** auto: markdown blocks → MarkdownRenderer; inline math → MathText; else Text */
  mode?: 'auto' | 'markdown' | 'math' | 'plain';
  enableKatex?: boolean;
};

/**
 * Renders student-facing text with KaTeX when needed (web MathText / MarkdownRenderer parity).
 */
const RichText: React.FC<Props> = ({
  children,
  style,
  textStyle,
  mode = 'auto',
  enableKatex = true,
}) => {
  const text = (children ?? '').trim();
  if (!text) return null;

  if (mode === 'markdown' || (mode === 'auto' && looksLikeMarkdown(text))) {
    return (
      <MarkdownRenderer
        content={text}
        paragraphStyle={textStyle}
        style={style}
        enableKatex={enableKatex}
      />
    );
  }

  if (mode === 'math' || (mode === 'auto' && shouldUseKatex(text, enableKatex))) {
    return (
      <MathText textStyle={textStyle} style={style}>
        {text}
      </MathText>
    );
  }

  return <Text style={textStyle}>{text}</Text>;
};

export default RichText;
