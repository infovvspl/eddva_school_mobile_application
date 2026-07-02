import React from 'react';
import { View, type TextStyle, type ViewStyle } from 'react-native';
import MarkdownNotes from './MarkdownNotes';

/**
 * Shared markdown + KaTeX renderer (mirrors web MarkdownRenderer / rehype-katex).
 * Use for AI study content, doubts, notes, quiz explanations, and long-form answers.
 */
type Props = {
  /** Primary content string (markdown and/or $...$ / $$...$$ math). */
  content?: string;
  /** Alias for `content` (web parity). */
  markdown?: string;
  paragraphStyle?: TextStyle;
  style?: ViewStyle;
  /** When false, math delimiters render as styled text (no WebView). */
  enableKatex?: boolean;
};

const MarkdownRenderer: React.FC<Props> = ({
  content,
  markdown,
  paragraphStyle,
  style,
  enableKatex = true,
}) => {
  const src = (content ?? markdown ?? '').trim();
  if (!src) return null;

  return (
    <View style={style}>
      <MarkdownNotes content={src} paragraphStyle={paragraphStyle} enableKatex={enableKatex} />
    </View>
  );
};

export default MarkdownRenderer;
