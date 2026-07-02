import type { StudyResource } from './topicResources';

export type McqBlock = {
  type: 'mcq';
  number: number;
  question: string;
  options: [string, string, string, string];
};

export type SheetBlock =
  | { type: 'banner'; title: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | McqBlock;

export type StudySheetPayload = {
  kind: 'dpp' | 'notes';
  headerTitle: string;
  tagLabel: string;
  documentTitle: string;
  metaLine: string;
  blocks: SheetBlock[];
};

const formatDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

function dppBlocks(topicName: string, count: number): SheetBlock[] {
  const base = topicName.trim() || 'this topic';
  const questions: Omit<McqBlock, 'type' | 'number'>[] = [ 
    {
      question: `Which of the following best describes the core concept of "${base}"?`,
      options: [
        'A process driven only by passive diffusion',
        'A regulated pathway central to this chapter',
        'An unrelated historical observation',
        'A purely theoretical construct with no experiments',
      ],
    },
    {
      question: `In "${base}", which factor most directly limits the rate under normal conditions?`,
      options: [
        'Availability of the primary reactant or substrate',
        'Colour of the surrounding medium',
        'Room temperature alone without any biology',
        'Number of pages in the textbook',
      ],
    },
    {
      question: `Which statement about "${base}" is correct?`,
      options: [
        'It never requires energy input in living systems',
        'It can be studied using labelled tracers and assays',
        'It is identical in all organisms without variation',
        'It cannot be measured in laboratory settings',
      ],
    },
    {
      question: `Which pair is most relevant when revising "${base}"?`,
      options: [
        'Definitions, diagrams, and NCERT examples',
        'Only memorising dates of discoveries',
        'Ignoring PYQ patterns for this chapter',
        'Skipping numericals entirely',
      ],
    },
    {
      question: `For exam-style questions on "${base}", you should first:`,
      options: [
        'Read the stem carefully and list given data',
        'Pick option A without reading',
        'Leave all OMR bubbles blank',
        'Change your answer on every guess',
      ],
    },
  ];

  const extra = Math.min(Math.max(count - 15, 0), 3);
  for (let i = 0; i < extra; i += 1) {
    questions.push({
      question: `Application ${i + 6}: A standard problem on "${base}" asks you to identify the correct graph. What do you check first?`,
      options: [
        'Axes labels, units, and direction of change',
        'Font size of the diagram only',
        'Whether the figure is coloured',
        'The page number of the book',
      ],
    });
  }

  return [
    { type: 'banner', title: 'Section A — Multiple Choice (1 mark each)' },
    ...questions.map((q, idx) => ({
      type: 'mcq' as const,
      number: idx + 1,
      question: q.question,
      options: q.options,
    })),
  ];
}

function notesBlocks(topicName: string): SheetBlock[] {
  const base = topicName.trim() || 'this topic';
  return [
    { type: 'banner', title: 'Key Concepts' },
    {
      type: 'paragraph',
      text: `${base} is one of the high-yield areas in this chapter. Focus on definitions, labelled diagrams, and the logical flow from observation to conclusion.`,
    },
    { type: 'heading', text: 'Must-know points' },
    {
      type: 'bullets',
      items: [
        `Revise the standard definition and one-line memory hook for ${base}.`,
        'Link each formula or pathway step to a physical meaning (not rote symbols).',
        'Practice 2–3 NCERT in-text and end-exercise questions daily.',
        'Maintain a small error log for silly mistakes in units and signs.',
      ],
    },
    { type: 'banner', title: 'Exam orientation' },
    {
      type: 'paragraph',
      text: 'Previous-year papers often combine this topic with an adjacent subtopic. When revising, write a 5-minute summary without looking at notes, then verify against your sheet.',
    },
    { type: 'heading', text: 'Quick checklist before tests' },
    {
      type: 'bullets',
      items: [
        'Can you draw the main diagram from memory?',
        'Can you explain the topic to a friend in under 90 seconds?',
        'Have you solved at least one DPP set for this topic?',
      ],
    },
  ];
}

export function buildStudySheetPayload(resource: StudyResource): StudySheetPayload {
  const topic = resource.topicName || 'Topic';
  const subject = resource.subjectName || 'Subject';
  const chapter = resource.chapterName || 'Chapter';
  const dateStr = formatDate();

  if (resource.kind === 'dpp') {
    const shortTitle = resource.title.includes('—')
      ? resource.title.split('—').pop()?.trim() || topic
      : topic;
    return {
      kind: 'dpp',
      headerTitle: resource.title,
      tagLabel: 'DPP',
      documentTitle: `DPP — ${shortTitle}`,
      metaLine: `Subject: ${subject} | Chapter: ${chapter} | Date: ${dateStr}`,
      blocks: dppBlocks(topic, resource.questionCount ?? 15),
    };
  }

  return {
    kind: 'notes',
    headerTitle: resource.title,
    tagLabel: 'Notes',
    documentTitle: `Study Notes — ${topic}`,
    metaLine: `Subject: ${subject} | Chapter: ${chapter} | Date: ${dateStr}`,
    blocks: notesBlocks(topic),
  };
}
