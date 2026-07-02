export type VideoQuizOption = {
  label: string;
  text: string;
};

export type VideoQuizCheckpoint = {
  id: string;
  questionText: string;
  options: VideoQuizOption[];
  correctOption: string;
  explanation?: string;
  triggerAtPercent: number;
  segmentTitle?: string;
};

export function normalizeQuizCheckpoints(raw: unknown): VideoQuizCheckpoint[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((q: any, i: number) => ({
      id: String(q?.id ?? `quiz-${i}`),
      questionText: String(q?.questionText ?? q?.question ?? q?.text ?? '').trim(),
      options: (Array.isArray(q?.options) ? q.options : []).map((o: any, j: number) => ({
        label: String(o?.label ?? String.fromCharCode(65 + j)),
        text: String(o?.text ?? o?.option ?? o?.value ?? '').trim(),
      })),
      correctOption: String(q?.correctOption ?? q?.correctAnswer ?? '').trim(),
      explanation: q?.explanation ? String(q.explanation) : undefined,
      triggerAtPercent: Math.min(
        100,
        Math.max(0, Number(q?.triggerAtPercent ?? q?.triggerPercent ?? 0)),
      ),
      segmentTitle: q?.segmentTitle ? String(q.segmentTitle) : undefined,
    }))
    .filter(q => q.questionText && q.options.length >= 2)
    .sort((a, b) => a.triggerAtPercent - b.triggerAtPercent);
}

export function checkpointTriggerSeconds(
  checkpoint: VideoQuizCheckpoint,
  durationSeconds: number,
): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return (checkpoint.triggerAtPercent / 100) * durationSeconds;
}
