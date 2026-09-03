/**
 * Minimal LaTeX -> Unicode conversion for AI explanations.
 *
 * The explanations contain short inline algebra and set notation ($\mathbb{Z}$,
 * $\frac{a}{b}$, $x^2$, $n \ge 0$), not typeset mathematics. Unicode covers
 * that faithfully with no dependency and no per-card WebView, which a real
 * KaTeX renderer would cost inside a scrolling list. Anything it cannot map is
 * left readable rather than dropped.
 */

const SYMBOLS: Record<string, string> = {
  dots: '…', ldots: '…', cdots: '⋯',
  in: '∈', notin: '∉', ni: '∋',
  ge: '≥', geq: '≥', le: '≤', leq: '≤', ne: '≠', neq: '≠',
  approx: '≈', equiv: '≡', sim: '∼', propto: '∝',
  mid: '|', times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓',
  infty: '∞', partial: '∂', nabla: '∇', sum: '∑', prod: '∏', int: '∫',
  rightarrow: '→', to: '→', leftarrow: '←', leftrightarrow: '↔',
  Rightarrow: '⇒', Leftrightarrow: '⇔', implies: '⇒', iff: '⇔',
  subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
  cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅',
  forall: '∀', exists: '∃', neg: '¬', land: '∧', lor: '∨',
  degree: '°', circ: '∘', angle: '∠', perp: '⊥', parallel: '∥',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ',
  mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
  upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  quad: ' ', qquad: '  ', ',': ' ', ';': ' ', '!': '',
};

const BLACKBOARD: Record<string, string> = {
  N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ', P: 'ℙ', H: 'ℍ',
};

const SUPER: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶',
  '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽',
  ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ',
  k: 'ᵏ', m: 'ᵐ', p: 'ᵖ', t: 'ᵗ',
};

const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆',
  '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍',
  ')': '₎', n: 'ₙ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', m: 'ₘ', x: 'ₓ', a: 'ₐ',
};

/** Read a {...} group starting at `i` (which must point at '{'). */
const readGroup = (src: string, i: number): { body: string; next: number } => {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return { body: src.slice(i + 1, j), next: j + 1 };
    }
  }
  return { body: src.slice(i + 1), next: src.length };
};

const mapRun = (run: string, table: Record<string, string>): string | null => {
  let out = '';
  for (const ch of run) {
    const mapped = table[ch];
    if (!mapped) return null;
    out += mapped;
  }
  return out;
};

/** True when the expression is atomic enough to sit in a fraction unbracketed. */
const isSimple = (s: string) => /^[A-Za-z0-9.°⁰-⁹]+$/.test(s.trim());

export const latexToUnicode = (input: string): string => {
  // Some payloads arrive with \f, \t and \b already collapsed into control
  // characters by an upstream escaping bug ("\frac" -> "\x0crac").
  let src = String(input)
    .replace(/\f/g, '\\f')
    .replace(/\x08/g, '\\b')
    .replace(/\\left|\\right/g, '')
    .replace(/\\!/g, '');

  let out = '';
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) {
        const name = m[1];
        let j = i + m[0].length;

        if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
          while (src[j] === ' ') j++;
          const num = readGroup(src, j);
          let k = num.next;
          while (src[k] === ' ') k++;
          const den = readGroup(src, k);
          const a = latexToUnicode(num.body);
          const b = latexToUnicode(den.body);
          out += `${isSimple(a) ? a : `(${a})`}/${isSimple(b) ? b : `(${b})`}`;
          i = den.next;
          continue;
        }

        if (name === 'sqrt') {
          while (src[j] === ' ') j++;
          const g = readGroup(src, j);
          const body = latexToUnicode(g.body);
          out += `√${isSimple(body) ? body : `(${body})`}`;
          i = g.next;
          continue;
        }

        if (name === 'mathbb') {
          while (src[j] === ' ') j++;
          const g = readGroup(src, j);
          const key = g.body.trim();
          out += BLACKBOARD[key] ?? key;
          i = g.next;
          continue;
        }

        // Wrappers whose braces carry no extra meaning here.
        if (
          name === 'boxed' || name === 'text' || name === 'mathrm' ||
          name === 'mathbf' || name === 'textbf' || name === 'operatorname'
        ) {
          while (src[j] === ' ') j++;
          if (src[j] === '{') {
            const g = readGroup(src, j);
            out += latexToUnicode(g.body);
            i = g.next;
            continue;
          }
          i = j;
          continue;
        }

        if (SYMBOLS[name] !== undefined) {
          out += SYMBOLS[name];
          i = j;
          // A command like "\ge 0" keeps its separating space.
          if (src[i] === ' ') { out += ' '; i++; }
          continue;
        }

        // Unknown command: drop the backslash, keep the word.
        out += name;
        i = j;
        continue;
      }

      // Escaped literal such as \{ or \}
      out += src[i + 1] ?? '';
      i += 2;
      continue;
    }

    if (ch === '^' || ch === '_') {
      const table = ch === '^' ? SUPER : SUB;
      let j = i + 1;
      let run: string;
      if (src[j] === '{') {
        const g = readGroup(src, j);
        run = latexToUnicode(g.body);
        j = g.next;
      } else {
        run = src[j] ?? '';
        j += 1;
      }
      const mapped = mapRun(run, table);
      out += mapped ?? `${ch}${run}`;
      i = j;
      continue;
    }

    out += ch;
    i++;
  }

  return out.replace(/[ \t]{2,}/g, ' ').trim();
};

/**
 * Split a line into plain and math segments. Math is anything between single
 * `$` or `\( \)` delimiters; the returned math segments are already converted.
 */
export const splitMath = (line: string): { text: string; math: boolean }[] => {
  const parts: { text: string; math: boolean }[] = [];
  const re = /\$([^$\n]+)\$|\\\((.+?)\\\)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), math: false });
    parts.push({ text: latexToUnicode(m[1] ?? m[2] ?? ''), math: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), math: false });
  return parts.length ? parts : [{ text: line, math: false }];
};
