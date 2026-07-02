import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type TextStyle } from 'react-native';
import { Colors } from '../../constants/theme';
import { normalizeNotesContent } from '../../utils/formatNotes';
import { hasMathDelimiters } from '../../utils/mathLatex';
import { shouldUseKatex } from '../../utils/renderMathHtml';
import { font, vs } from '../../utils/responsive';
import MathText from './MathText';

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!list || list.items.length === 0) return;
    blocks.push({ type: list.ordered ? 'ol' : 'ul', items: [...list.items] });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const type = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      blocks.push({ type, text: heading[2].trim() });
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1].trim());
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1].trim());
      continue;
    }

    flushList();
    blocks.push({ type: 'p', text: line });
  }

  flushList();
  return blocks;
}

function InlineText({
  text,
  style,
  enableKatex,
}: {
  text: string;
  style?: object;
  enableKatex: boolean;
}) {
  if (shouldUseKatex(text, enableKatex)) {
    return <MathText textStyle={style}>{text}</MathText>;
  }
  if (hasMathDelimiters(text)) {
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g);
    return (
      <Text style={style}>
        {parts.map((part, i) => {
          const blockMath = part.match(/^\$\$([\s\S]+)\$\$$/);
          if (blockMath) {
            return (
              <Text key={i} style={styles.mathBlock}>
                {blockMath[1].trim()}
              </Text>
            );
          }
          const inlineMath = part.match(/^\$([^$\n]+)\$$/);
          if (inlineMath) {
            return (
              <Text key={i} style={styles.mathInline}>
                {inlineMath[1].trim()}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  }
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
  content: string;
  paragraphStyle?: TextStyle;
  enableKatex?: boolean;
};

const MarkdownNotes: React.FC<Props> = ({ content, paragraphStyle, enableKatex = true }) => {
  const normalized = useMemo(() => normalizeNotesContent(content), [content]);
  const blocks = useMemo(() => parseBlocks(normalized), [normalized]);
  const paragraphTextStyle = useMemo(
    () => (paragraphStyle ? [styles.paragraph, paragraphStyle] : styles.paragraph),
    [paragraphStyle],
  );
  const listTextStyle = useMemo(
    () => (paragraphStyle ? [styles.listText, paragraphStyle] : styles.listText),
    [paragraphStyle],
  );

  if (!content.trim()) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return shouldUseKatex(block.text, enableKatex) ? (
            <MathText key={index} textStyle={styles.h1}>
              {block.text}
            </MathText>
          ) : (
            <Text key={index} style={styles.h1}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'h2') {
          return shouldUseKatex(block.text, enableKatex) ? (
            <MathText key={index} textStyle={styles.h2}>
              {block.text}
            </MathText>
          ) : (
            <Text key={index} style={styles.h2}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'h3') {
          return shouldUseKatex(block.text, enableKatex) ? (
            <MathText key={index} textStyle={styles.h3}>
              {block.text}
            </MathText>
          ) : (
            <Text key={index} style={styles.h3}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'ul' || block.type === 'ol') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, i) => (
                <View key={i} style={styles.listRow}>
                  <Text style={styles.bullet}>
                    {block.type === 'ol' ? `${i + 1}.` : '•'}
                  </Text>
                  <InlineText text={item} style={listTextStyle} enableKatex={enableKatex} />
                </View>
              ))}
            </View>
          );
        }
        return (
          <InlineText
            key={index}
            text={block.text}
            style={paragraphTextStyle}
            enableKatex={enableKatex}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(8) },
  h1: {
    fontSize: font.title,
    fontWeight: '800',
    color: Colors.text,
    marginTop: vs(4),
    marginBottom: vs(6),
  },
  h2: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: Colors.text,
    marginTop: vs(10),
    marginBottom: vs(4),
  },
  h3: {
    fontSize: font.body,
    fontWeight: '800',
    color: Colors.text,
    marginTop: vs(8),
    marginBottom: vs(2),
  },
  paragraph: {
    fontSize: font.tiny,
    lineHeight: vs(20),
    color: Colors.textSecondary,
    marginBottom: vs(4),
  },
  bold: { fontWeight: '800', color: Colors.text },
  mathInline: {
    fontFamily: 'monospace',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  mathBlock: {
    fontFamily: 'monospace',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    lineHeight: vs(22),
  },
  list: { marginBottom: vs(6), gap: vs(4) },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: vs(20),
    minWidth: 16,
  },
  listText: {
    flex: 1,
    fontSize: font.tiny,
    lineHeight: vs(20),
    color: Colors.textSecondary,
  },
});

export default MarkdownNotes;
