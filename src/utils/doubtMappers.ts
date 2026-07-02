import { asArray } from './apiData';
import type { DoubtStatus, MockDoubt } from '../mocks/mockDoubtService';

export type DoubtListStats = {
  total: number;
  pending: number;
  resolved: number;
};

function pickString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const key of ['text', 'content', 'body', 'message', 'answer', 'markdown', 'html']) {
      if (typeof o[key] === 'string') return (o[key] as string).trim();
    }
  }
  return '';
}

function pickNestedString(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== 'object') return '';
  const o = obj as Record<string, unknown>;
  for (const key of keys) {
    const v = pickString(o[key]);
    if (v) return v;
  }
  return '';
}

function normalizeLatexText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim();
}

function isJsonLikeString(value: string): boolean {
  const t = value.trim();
  return (
    (t.startsWith('{') && t.includes('"brief"')) ||
    (t.startsWith('{') && t.includes('"detailed"')) ||
    (t.startsWith('{') && t.includes('"final_answer"'))
  );
}

function formatBriefNode(node: Record<string, unknown>): string {
  const answer =
    pickString(node.answer) ||
    pickString(node.text) ||
    pickString(node.content) ||
    pickString(node.summary);
  const nature =
    pickString(node.question_nature) ||
    pickString(node.questionNature) ||
    pickString(node.nature);
  const parts: string[] = [];
  if (answer) parts.push(normalizeLatexText(answer));
  if (nature) parts.push(`**Type:** ${normalizeLatexText(nature)}`);
  return parts.join('\n\n');
}

function formatDetailedNode(node: Record<string, unknown>): string {
  const solution =
    pickString(node.solution) ||
    pickString(node.text) ||
    pickString(node.content) ||
    pickString(node.body) ||
    pickString(node.markdown);
  if (solution) return normalizeLatexText(solution);

  const steps = node.steps ?? node.solutionSteps;
  if (Array.isArray(steps)) {
    return steps
      .map((s, i) => {
        const line = pickString(s) || pickString((s as Record<string, unknown>)?.text);
        return line ? `${i + 1}. ${normalizeLatexText(line)}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

/** Parse API AI payload — object, JSON string, or plain markdown. */
export function parseAiPayload(input: unknown): { brief: string; detailed: string } {
  if (input == null) return { brief: '', detailed: '' };

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return { brief: '', detailed: '' };
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return parseAiPayload(JSON.parse(trimmed));
      } catch {
        if (isJsonLikeString(trimmed)) {
          return { brief: '', detailed: '' };
        }
      }
    }
    const plain = normalizeLatexText(trimmed);
    return { brief: plain, detailed: plain };
  }

  if (typeof input !== 'object' || Array.isArray(input)) {
    return { brief: '', detailed: '' };
  }

  const o = input as Record<string, unknown>;
  let brief = '';
  let detailed = '';

  const briefNode = o.brief ?? o.short ?? o.summary;
  const detailedNode = o.detailed ?? o.long ?? o.full;

  if (briefNode && typeof briefNode === 'object') {
    brief = formatBriefNode(briefNode as Record<string, unknown>);
  } else if (briefNode) {
    brief = normalizeLatexText(pickString(briefNode));
  }

  if (detailedNode && typeof detailedNode === 'object') {
    detailed = formatDetailedNode(detailedNode as Record<string, unknown>);
  } else if (detailedNode) {
    detailed = normalizeLatexText(pickString(detailedNode));
  }

  const finalAnswer =
    pickString(o.final_answer) ||
    pickString(o.finalAnswer) ||
    pickString(o.answer);
  const verification = pickString(o.verification);
  const keyConcept = pickString(o.key_concept) || pickString(o.keyConcept);

  if (!brief && finalAnswer) {
    brief = `**Answer:** ${normalizeLatexText(finalAnswer)}`;
  }

  if (!detailed) {
    const parts: string[] = [];
    if (detailedNode && typeof detailedNode === 'string') {
      parts.push(normalizeLatexText(detailedNode));
    }
    if (finalAnswer) parts.push(`**Final answer:** ${normalizeLatexText(finalAnswer)}`);
    if (verification) parts.push(`**Verification:** ${normalizeLatexText(verification)}`);
    if (keyConcept) parts.push(`**Key concept:** ${normalizeLatexText(keyConcept)}`);
    detailed = parts.filter(Boolean).join('\n\n');
  }

  if (brief && !detailed) detailed = brief;
  if (!brief && detailed) brief = detailed;

  return { brief, detailed };
}

/** Extract brief + detailed AI answers from API shapes (flat, nested, or JSON string). */
function pickAiAnswers(raw: Record<string, unknown>): {
  brief: string;
  detailed: string;
} {
  const candidates = [
    raw.aiAnswer,
    raw.aiExplanation,
    raw.aiResponse,
    raw.ai,
    raw.response,
    raw.explanation,
    raw.answers,
    raw.aiAnswerBrief,
    raw.aiAnswerDetailed,
    raw.aiAnswerMarkdown,
  ];

  let brief = '';
  let detailed = '';

  for (const field of candidates) {
    if (field == null) continue;
    const parsed = parseAiPayload(field);
    if (parsed.brief && !brief) brief = parsed.brief;
    if (parsed.detailed && !detailed) detailed = parsed.detailed;
    if (brief && detailed && brief !== detailed) break;
  }

  if (!brief) {
    brief =
      pickString(raw.aiAnswerShort) ||
      pickString(raw.shortAnswer) ||
      pickString(raw.shortExplanation) ||
      pickNestedString(raw.aiResponse, ['brief', 'short', 'summary']) ||
      '';
  }

  if (!detailed) {
    detailed =
      pickString(raw.detailedAnswer) ||
      pickString(raw.detailedExplanation) ||
      pickString(raw.longAnswer) ||
      pickNestedString(raw.aiResponse, ['detailed', 'long', 'solution']) ||
      '';
  }

  if (brief && isJsonLikeString(brief)) {
    const p = parseAiPayload(brief);
    brief = p.brief;
    if (!detailed) detailed = p.detailed;
  }
  if (detailed && isJsonLikeString(detailed)) {
    const p = parseAiPayload(detailed);
    if (!brief) brief = p.brief;
    detailed = p.detailed;
  }

  const explanations = raw.explanations ?? raw.aiExplanations;
  if (Array.isArray(explanations)) {
    for (const item of explanations) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const kind = String(row.type ?? row.mode ?? row.kind ?? '').toLowerCase();
      const text = pickString(row.text) || pickString(row.content) || pickString(row.body);
      if (!text) continue;
      if (/short|brief|summary/.test(kind) && !brief) brief = normalizeLatexText(text);
      else if (/detail|long|full/.test(kind) && !detailed) detailed = normalizeLatexText(text);
    }
  }

  return { brief, detailed: detailed || brief };
}

/** Map API status → UI filter status. */
export function normalizeDoubtStatus(raw?: unknown): DoubtStatus {
  const s = String(raw || 'pending')
    .toLowerCase()
    .replace(/-/g, '_');

  if (s === 'open' || s === 'pending' || s === 'waiting') return 'waiting';
  if (s === 'escalated' || s === 'queued' || s === 'in_queue') return 'queued';
  if (s === 'ai_resolved' || s === 'ai_answered' || s === 'resolved_by_ai') {
    return 'ai_resolved';
  }
  if (
    s === 'teacher_resolved' ||
    s === 'resolved' ||
    s === 'closed' ||
    s === 'answered'
  ) {
    return 'resolved';
  }
  return 'pending';
}

export function normalizeDoubt(raw: Record<string, unknown>): MockDoubt {
  const question =
    pickString(raw.questionText) ||
    pickString(raw.question) ||
    pickString(raw.userQuestion) ||
    pickString(raw.title) ||
    'Doubt';

  const { brief: aiAnswerBrief, detailed: aiAnswerDetailedRaw } = pickAiAnswers(raw);
  const aiAnswerDetailed = aiAnswerDetailedRaw || aiAnswerBrief;

  const teacherResponse =
    pickString(raw.teacherResponse) ||
    pickString(raw.teacherAnswer) ||
    pickString(raw.facultyResponse) ||
    undefined;

  const status = normalizeDoubtStatus(raw.status);
  const hasAi = Boolean(aiAnswerBrief || aiAnswerDetailed);
  const hasTeacher = Boolean(teacherResponse);

  let answeredBy: 'AI' | 'Teacher' = 'AI';
  if (hasTeacher && !hasAi) answeredBy = 'Teacher';
  if (status === 'resolved' && hasTeacher) answeredBy = 'Teacher';

  const helpfulRaw = raw.helpfulRating ?? raw.isHelpful ?? raw.wasHelpful;
  let helpfulRating: boolean | null = null;
  if (typeof helpfulRaw === 'boolean') helpfulRating = helpfulRaw;

  const subject =
    pickString(raw.subject) ||
    pickString(raw.subjectName) ||
    (raw.subject && typeof raw.subject === 'object'
      ? pickString((raw.subject as Record<string, unknown>).name)
      : '') ||
    'General';

  const skipAi = Boolean(raw.skipAI ?? raw.skipAi);
  const channel: 'ai' | 'teacher' =
    skipAi || (status === 'queued' && !hasAi && !hasTeacher) ? 'teacher' : 'ai';

  return {
    id: String(raw.id ?? raw._id ?? `d-${Date.now()}`),
    question,
    userQuestion:
      pickString(raw.userQuestion) || pickString(raw.questionText) || question,
    aiAnswerBrief,
    aiAnswerDetailed,
    teacherResponse,
    status,
    subject,
    answeredBy,
    channel,
    helpfulRating,
    createdAt:
      pickString(raw.createdAt) ||
      pickString(raw.created_at) ||
      new Date().toISOString(),
  };
}

export function computeDoubtStats(doubts: MockDoubt[]): DoubtListStats {
  const pending = doubts.filter(
    d => d.status === 'waiting' || d.status === 'queued' || d.status === 'pending',
  ).length;
  const resolved = doubts.filter(
    d => d.status === 'ai_resolved' || d.status === 'resolved',
  ).length;
  return { total: doubts.length, pending, resolved };
}

/** Parse list payload from GET /doubts (array or wrapped). */
/** Unwrap GET /doubts/:id (or create) response body. */
export function unwrapDoubtPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.doubt ?? obj.data ?? obj.item ?? obj.record;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return obj;
}

export function parseDoubtsResponse(data: unknown): {
  doubts: MockDoubt[];
  stats: DoubtListStats;
} {
  if (!data) {
    return { doubts: [], stats: { total: 0, pending: 0, resolved: 0 } };
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const doubts = asArray<Record<string, unknown>>(obj, [
      'doubts',
      'items',
      'data',
      'records',
      'results',
      'rows',
    ]).map(normalizeDoubt);

    const apiStats = obj.stats as Record<string, unknown> | undefined;
    const stats: DoubtListStats = apiStats
      ? {
          total: Number(apiStats.total ?? doubts.length) || doubts.length,
          pending: Number(apiStats.pending ?? apiStats.open ?? 0) || computeDoubtStats(doubts).pending,
          resolved:
            Number(apiStats.resolved ?? apiStats.completed ?? 0) ||
            computeDoubtStats(doubts).resolved,
        }
      : computeDoubtStats(doubts);

    return { doubts, stats };
  }

  const doubts = asArray<Record<string, unknown>>(data).map(normalizeDoubt);
  return { doubts, stats: computeDoubtStats(doubts) };
}
