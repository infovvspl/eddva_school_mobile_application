import katex from 'katex';
import {
  cleanAiLatex,
  hasMathDelimiters,
  parseMathSegments,
  prepareMathDelimiters,
} from './mathLatex';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain text segment → HTML with **bold** and line breaks. */
function formatTextSegment(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(cleanAiLatex(tex), {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return `<span class="latex-fallback">${escapeHtml(tex)}</span>`;
  }
}

/** Build inner HTML body from markdown-ish text with math. */
export function buildMathHtmlBody(content: string): string {
  const prepared = prepareMathDelimiters(content);
  const segments = parseMathSegments(prepared);

  return segments
    .map(seg => {
      if (seg.type === 'text') return formatTextSegment(seg.value);
      if (seg.type === 'block') {
        return `<div class="math-block">${renderLatex(seg.value, true)}</div>`;
      }
      return `<span class="math-inline">${renderLatex(seg.value, false)}</span>`;
    })
    .join('');
}

export function shouldUseKatex(text: string, enableKatex = true): boolean {
  if (!enableKatex || !text?.trim()) return false;
  if (hasMathDelimiters(text)) return true;
  return /\\(?:frac|int|sqrt|sum|lim|partial|cdot|times|alpha|beta|theta|pi|sigma|left|right|begin|end|mathbf|mathrm|vec|hat|infty|leq|geq|neq|pm)/.test(
    text,
  );
}

type DocOptions = {
  fontSize?: number;
  color?: string;
  lineHeight?: number;
};

/** Full HTML page for WebView (KaTeX CSS via CDN). */
export function buildMathHtmlDocument(content: string, opts: DocOptions = {}): string {
  const fontSize = opts.fontSize ?? 14;
  const color = opts.color ?? '#334155';
  const lineHeight = opts.lineHeight ?? 1.55;
  const body = buildMathHtmlBody(content);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"/>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow-x: hidden;
  }
  body {
    padding: 4px 2px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: ${fontSize}px;
    line-height: ${lineHeight};
    color: ${color};
    word-wrap: break-word;
  }
  strong { font-weight: 700; color: ${color}; }
  .math-block {
    display: block;
    margin: 8px 0;
    padding: 8px;
    background: #EFF6FF;
    border-radius: 8px;
    overflow-x: auto;
    text-align: center;
  }
  .math-inline { display: inline; vertical-align: middle; }
  .latex-fallback {
    font-family: monospace;
    background: #EFF6FF;
    color: #1D4ED8;
    padding: 2px 4px;
    border-radius: 4px;
  }
  .katex { font-size: 1.05em; color: #1D4ED8; }
  .katex-display { margin: 0; }
</style>
</head>
<body><div id="root">${body}</div>
<script>
  (function() {
    function sendHeight() {
      var h = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.getElementById('root').scrollHeight
      );
      window.ReactNativeWebView.postMessage(String(Math.ceil(h)));
    }
    sendHeight();
    setTimeout(sendHeight, 100);
    setTimeout(sendHeight, 350);
  })();
</script>
</body>
</html>`;
}
