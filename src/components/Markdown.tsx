import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { splitMath } from '../utils/latex';

/**
 * Small Markdown renderer for AI-generated content (lecture notes, doubt
 * explanations). Covers what the backend actually emits — headings, bullets,
 * inline bold, images and `$math$` — rather than pulling in a full parser.
 * Math spans are extracted before emphasis so `a_1` is never read as Markdown.
 */
export function Markdown({
  value,
  theme,
  compact = false,
}: {
  value: string;
  theme: any;
  compact?: boolean;
}) {
  const styles = getStyles(theme, compact);
  const lines = String(value ?? '').replace(/\r\n/g, '\n').split('\n');

  // **bold** and *italic* in one pass, so a single asterisk is never left
  // rendering literally the way a bold-only split leaves it.
  const emphasise = (text: string, key: string) =>
    text
      .split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
      .filter(Boolean)
      .map((tok, i) => {
        if (tok.startsWith('**') && tok.endsWith('**')) {
          return (
            <Text key={`${key}-b${i}`} style={styles.bold}>{tok.slice(2, -2)}</Text>
          );
        }
        if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
          return (
            <Text key={`${key}-i${i}`} style={styles.italic}>{tok.slice(1, -1)}</Text>
          );
        }
        return <Text key={`${key}-t${i}`}>{tok}</Text>;
      });

  const inline = (text: string, key: string) =>
    splitMath(text).flatMap((seg, s) => {
      if (seg.math) {
        return [<Text key={`${key}-m${s}`} style={styles.math}>{seg.text}</Text>];
      }
      return emphasise(seg.text, `${key}-${s}`);
    });

  let lastAlt = '';

  return (
    <View>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <View key={`sp${i}`} style={styles.spacer} />;

        // The generator repeats each figure's alt text as an italic caption
        // directly beneath it; render it once.
        const italicOnly = line.match(/^\*(.+)\*$/);
        if (italicOnly && italicOnly[1].trim() === lastAlt.trim()) {
          return null;
        }

        // ![alt](url) on its own line -> figure with caption
        const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
        if (img) {
          lastAlt = img[1] ?? '';
          return (
            <View key={`img${i}`} style={styles.figure}>
              <Image source={{ uri: img[2] }} style={styles.image} resizeMode="contain" />
              {!!img[1] && <Text style={styles.caption}>{img[1]}</Text>}
            </View>
          );
        }

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
          const big = heading[1].length <= 2;
          return (
            <Text key={`h${i}`} style={[styles.heading, big && styles.headingBig]}>
              {heading[2].replace(/\*+/g, '')}
            </Text>
          );
        }

        const bullet = line.match(/^\s*([•\-*])\s+(.*)$/);
        if (bullet) {
          return (
            <View key={`li${i}`} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.body}>{inline(bullet[2], `li${i}`)}</Text>
            </View>
          );
        }

        return <Text key={`p${i}`} style={styles.body}>{inline(line, `p${i}`)}</Text>;
      })}
    </View>
  );
}

const getStyles = (theme: any, compact: boolean) =>
  StyleSheet.create({
    body: {
      fontSize: ms(compact ? 13 : 14),
      lineHeight: ms(compact ? 20 : 22),
      color: theme.text,
    },
    bold: { fontWeight: '700', color: theme.text },
    italic: { fontStyle: 'italic', color: theme.subtext },
    math: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: ms(compact ? 12.5 : 13.5),
      color: theme.primary,
    },
    heading: {
      fontSize: ms(compact ? 13 : 15),
      lineHeight: ms(compact ? 20 : 22),
      fontWeight: '700',
      color: theme.text,
      marginTop: vs(10),
      marginBottom: vs(4),
    },
    headingBig: { fontSize: ms(compact ? 15 : 17) },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: hs(6),
      paddingRight: hs(10),
    },
    bulletDot: {
      fontSize: ms(compact ? 13 : 14),
      lineHeight: ms(compact ? 20 : 22),
      color: theme.primary,
    },
    spacer: { height: vs(6) },
    figure: { marginVertical: vs(10) },
    image: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: ms(10),
      backgroundColor: theme.background,
    },
    caption: {
      fontSize: ms(11),
      lineHeight: ms(16),
      color: theme.subtext,
      marginTop: vs(6),
    },
  });
