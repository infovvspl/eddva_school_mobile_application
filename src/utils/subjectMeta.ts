/** Icon + accent color for subject chips (course detail, study plan) */

export type SubjectMeta = { icon: string; color: string };

const BY_KEYWORD: { keys: string[]; meta: SubjectMeta }[] = [
  { keys: ['physics', 'mechanic', 'electro', 'modern'], meta: { icon: 'atom', color: '#6366F1' } },
  { keys: ['chem', 'organic', 'inorganic', 'goc'], meta: { icon: 'flask', color: '#0066cc' } },
  { keys: ['math', 'algebra', 'trig', 'coordinate'], meta: { icon: 'square-root-alt', color: '#2563EB' } },
  { keys: ['bio', 'botany', 'zoology', 'cell'], meta: { icon: 'dna', color: '#10B981' } },
];

export function getSubjectMeta(name?: string): SubjectMeta {
  const n = (name || '').toLowerCase();
  for (const row of BY_KEYWORD) {
    if (row.keys.some(k => n.includes(k))) return row.meta;
  }
  return { icon: 'book-open', color: '#0066cc' };
}

export function groupTopicsBySubject(
  subjects: { id: string; name: string; subjectName?: string }[],
  topics: { id: string; subjectId?: string; name?: string; topicName?: string; title?: string; durationMinutes?: number }[],
) {
  const list = subjects.map(s => ({
    ...s,
    displayName: s.name || s.subjectName || 'Subject',
    topics: topics.filter(t => t.subjectId === s.id),
  }));
  const assigned = new Set(list.flatMap(s => s.topics.map(t => t.id)));
  const orphans = topics.filter(t => !assigned.has(t.id));
  if (orphans.length > 0 && list.length > 0) {
    list[0] = { ...list[0], topics: [...list[0].topics, ...orphans] };
  } else if (orphans.length > 0 && list.length === 0) {
    list.push({
      id: 'general',
      name: 'Lessons',
      displayName: 'Lessons',
      topics: orphans,
    });
  }
  return list;
}
