import { mockDelay } from './delay';
import { hasAnyEnrollment } from './mockStore';

export type DoubtStatus = 'waiting' | 'queued' | 'ai_resolved' | 'resolved' | 'pending';

export type DoubtChannel = 'ai' | 'teacher';

export type MockDoubt = {
  id: string;
  question: string;
  userQuestion: string;
  aiAnswerBrief: string;
  aiAnswerDetailed: string;
  teacherResponse?: string;
  status: DoubtStatus;
  subject: string;
  answeredBy: 'AI' | 'Teacher';
  channel?: DoubtChannel;
  helpfulRating?: boolean | null;
  createdAt: string;
};

const SAMPLE_DOUBTS: MockDoubt[] = [
  {
    id: 'd1',
    question:
      "Let $f(x)$ be differentiable with $f(x) = x^2 + \\int_0^x e^{-t} f(x-t)\\,dt$. Find $f'(0)$.",
    userQuestion:
      "Let $f(x)$ be differentiable with $f(x) = x^2 + \\int_0^x e^{-t} f(x-t)\\,dt$. Find $f'(0)$.",
    aiAnswerBrief:
      '**Step 1:** Substitute $u = x - t$.\n**Step 2:** Differentiate (Leibniz rule).\n**Step 3:** At $x = 0$, $f(0) = 0$ so $f\'(0) = 1$.',
    aiAnswerDetailed:
      'This is a Volterra integral equation.\n\n$$f(x) = x^2 + \\int_0^x e^{-t} f(x-t)\\,dt$$\n\nAfter substitution and differentiation, $f\'(0) = 1$.',
    status: 'ai_resolved',
    subject: 'Math - Numerical',
    answeredBy: 'AI',
    helpfulRating: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd2',
    question:
      'Which hormone is secreted by the beta cells of the islets of Langerhans in the pancreas?',
    userQuestion:
      'Which hormone is secreted by the beta cells of the islets of Langerhans in the pancreas?',
    aiAnswerBrief: 'Beta cells secrete insulin, which lowers blood glucose levels.',
    aiAnswerDetailed:
      'The islets of Langerhans contain alpha (glucagon), beta (insulin), delta (somatostatin), and PP cells. Beta cells respond to high blood glucose by releasing insulin, promoting glycogenesis and cellular uptake of glucose.',
    status: 'ai_resolved',
    subject: 'Biology - Zoology',
    answeredBy: 'AI',
    helpfulRating: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'd3',
    question: 'Why does SN2 reaction show inversion of configuration?',
    userQuestion: 'Why does SN2 reaction show inversion of configuration?',
    aiAnswerBrief:
      'The nucleophile attacks from the backside, causing a Walden inversion of stereochemistry.',
    aiAnswerDetailed:
      'In SN2, the nucleophile approaches 180° opposite the leaving group. The transition state is pentacoordinate, and the product has inverted configuration relative to the substrate (Walden inversion).',
    status: 'ai_resolved',
    subject: 'Chemistry - Organic',
    answeredBy: 'AI',
    helpfulRating: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'd4',
    question: 'Find the electric field at the centre of a uniformly charged ring.',
    userQuestion: 'Find the electric field at the centre of a uniformly charged ring.',
    status: 'waiting',
    subject: 'Physics - Electrostatics',
    answeredBy: 'AI',
    aiAnswerBrief: '',
    aiAnswerDetailed: '',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'd5',
    question: 'What is the hybridisation of carbon in ethene (C₂H₄)?',
    userQuestion: 'What is the hybridisation of carbon in ethene (C₂H₄)?',
    status: 'queued',
    subject: 'Chemistry - Organic',
    answeredBy: 'AI',
    aiAnswerBrief: '',
    aiAnswerDetailed: '',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'd6',
    question: 'Integration of $\\int x e^x\\,dx$ using parts?',
    userQuestion: 'Integration of $\\int x e^x\\,dx$ using parts?',
    aiAnswerBrief: 'Use $\\int u\\,dv = uv - \\int v\\,du$ with $u=x$, $dv=e^x dx$. Answer: $e^x(x-1)+C$.',
    aiAnswerDetailed:
      'Let $u = x$, $dv = e^x\\,dx$. Then $du = dx$, $v = e^x$.\n\n$$\\int x e^x\\,dx = x e^x - \\int e^x\\,dx = e^x(x-1)+C$$',
    status: 'resolved',
    subject: 'Math - Calculus',
    answeredBy: 'Teacher',
    teacherResponse:
      'Good attempt. Always write +C for indefinite integrals. Full solution uploaded in class notes.',
    helpfulRating: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

let doubtsStore = [...SAMPLE_DOUBTS];

function stats(list: MockDoubt[]) {
  const pending = list.filter(d => d.status === 'waiting' || d.status === 'queued' || d.status === 'pending').length;
  const resolved = list.filter(d => d.status === 'ai_resolved' || d.status === 'resolved').length;
  return { total: list.length, pending, resolved };
}

export const mockDoubtService = {
  list: async () => {
    await mockDelay();
    const doubts = hasAnyEnrollment() ? doubtsStore : [];
    return { data: { doubts, stats: stats(doubts) } };
  },

  getById: async (id: string) => {
    await mockDelay();
    const doubt = doubtsStore.find(d => d.id === id);
    if (!doubt) {
      throw new Error('Doubt not found');
    }
    return { data: doubt };
  },

  create: async ({
    question,
    target = 'ai',
  }: {
    question: string;
    target?: DoubtChannel;
  }) => {
    await mockDelay();
    const entry: MockDoubt =
      target === 'teacher'
        ? {
            id: `d-${Date.now()}`,
            question,
            userQuestion: question,
            aiAnswerBrief: '',
            aiAnswerDetailed: '',
            status: 'queued',
            subject: 'General',
            answeredBy: 'Teacher',
            channel: 'teacher',
            helpfulRating: null,
            createdAt: new Date().toISOString(),
          }
        : {
            id: `d-${Date.now()}`,
            question,
            userQuestion: question,
            aiAnswerBrief: `Quick steps for your question:\n1. Identify the given data.\n2. Apply the relevant formula.\n3. Substitute values and simplify.\n\n(Demo answer for: "${question.slice(0, 60)}…")`,
            aiAnswerDetailed: `Detailed solution:\nYour question "${question}" can be solved by breaking it into smaller parts. First, recall the core concept from your NCERT chapter. Then apply the standard method used in JEE/NEET PYQs. Practice similar problems from your DPP sheet.`,
            status: 'ai_resolved',
            subject: 'General',
            answeredBy: 'AI',
            channel: 'ai',
            helpfulRating: null,
            createdAt: new Date().toISOString(),
          };
    doubtsStore = [entry, ...doubtsStore];
    return { data: entry };
  },

  reopen: async (id: string, reason?: string) => {
    await mockDelay();
    doubtsStore = doubtsStore.map(d =>
      d.id === id
        ? {
            ...d,
            status: 'queued',
            channel: 'teacher',
            answeredBy: 'Teacher',
            teacherResponse: d.teacherResponse,
          }
        : d,
    );
    return { data: { success: true, reason } };
  },

  markHelpful: async (id: string, helpful: boolean) => {
    await mockDelay();
    doubtsStore = doubtsStore.map(d => (d.id === id ? { ...d, helpfulRating: helpful } : d));
    return { data: { success: true } };
  },
};
