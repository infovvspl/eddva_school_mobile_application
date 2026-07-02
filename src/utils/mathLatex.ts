/** Strip delimiters and normalize AI-generated LaTeX before KaTeX render. */
export function cleanAiLatex(tex: string): string {
  let s = tex.trim();
  s = s.replace(/^[\s$]+|[\s$]+$/g, '');
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');
  s = s.replace(/[\u2018\u2019\u201A]/g, "'");
  s = s.replace(/[\u201C\u201D\u201E]/g, '"');
  s = s.replace(/×/g, '\\times ');
  s = s.replace(/÷/g, '\\div ');
  s = s.replace(/±/g, '\\pm ');
  s = s.replace(/≠/g, '\\neq ');
  s = s.replace(/≤/g, '\\leq ');
  s = s.replace(/≥/g, '\\geq ');
  s = s.replace(/∞/g, '\\infty ');
  s = s.replace(/→/g, '\\rightarrow ');
  s = s.replace(/←/g, '\\leftarrow ');
  s = s.replace(/π/g, '\\pi ');
  s = s.replace(/θ/g, '\\theta ');
  s = s.replace(/²/g, '^2');
  s = s.replace(/³/g, '^3');
  s = s.replace(/−/g, '-');
  s = s.replace(/–/g, '-');
  s = s.replace(/—/g, '-');
  s = s.replace(/`/g, '');
  if (/\\\\/.test(s) && !/\\frac|\\sqrt|\\begin/.test(s)) {
    s = s.replace(/\\\\/g, '\\');
  }
  return s.trim();
}

export type MathSegment =
  | { type: 'text'; value: string }
  | { type: 'inline'; value: string }
  | { type: 'block'; value: string };

const MATH_RE =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([^)]+?)\\\)/g;

/** Split text into plain text and LaTeX segments ($$, $, \\[\\], \\(\\)). */
export function parseMathSegments(input: string): MathSegment[] {
  if (!input) return [];
  const segments: MathSegment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  MATH_RE.lastIndex = 0;
  while ((match = MATH_RE.exec(input)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: input.slice(last, match.index) });
    }
    const block = match[1] ?? match[2];
    const inline = match[3] ?? match[4];
    if (block != null) {
      segments.push({ type: 'block', value: block });
    } else if (inline != null) {
      segments.push({ type: 'inline', value: inline });
    }
    last = match.index + match[0].length;
  }

  if (last < input.length) {
    segments.push({ type: 'text', value: input.slice(last) });
  }

  return segments.length ? segments : [{ type: 'text', value: input }];
}

export function hasMathDelimiters(text: string): boolean {
  return /\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([^)]+?\\\)/.test(text);
}

/**
 * Wrap bare API LaTeX (e.g. \int_0^x) in $...$ so KaTeX can render it.
 */
export function prepareMathDelimiters(text: string): string {
  if (!text?.trim() || hasMathDelimiters(text)) return text;

  if (!/\\[a-zA-Z]/.test(text)) return text;

  let out = text;

  out = out.replace(
    /\\int(?:_\{[^}]+\}|_\w|\^[^{}\s]+)*(?:\s*[^.!?\n]{0,80})?/g,
    m => (m.includes('$') ? m : `$${m.trim()}$`),
  );

  out = out.replace(
    /\\(?:frac|sqrt|sum|lim|partial|cdots|ldots|infty|alpha|beta|gamma|theta|pi|sigma|vec|hat|bar|left|right|begin|end|text|mathrm|mathbf|cdot|times|pm|leq|geq|neq|varepsilon|lambda|mu|omega|Phi|Delta)(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|_[^{}\s]|\^[^{}\s]|\\[a-zA-Z]+|[0-9.]+|\s*[+\-=])*/g,
    m => {
      const t = m.trim();
      if (!t || t.includes('$') || t.length < 2) return m;
      return `$${t}$`;
    },
  );

  return out;
}

/** True when text likely contains math (delimiters or common LaTeX / unicode symbols). */
export function needsMathRendering(text: string): boolean {
  if (!text?.trim()) return false;
  if (hasMathDelimiters(text)) return true;
  return /\\frac|\\sqrt|\\int|\\sum|\\lim|[∫∑√±²³⁰¹²³₄₅πθΔλμΩ]|e\^\{|_\{/.test(text);
}
