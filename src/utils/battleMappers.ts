import { asArray } from './apiData';

export type BattleQuestion = {
  id: string;
  text: string;
  options: string[];
  /** Correct option index (0-based) when known */
  answerIndex: number;
};

export type BattleElo = {
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  battleXp: number;
  tier: string;
  battlesPlayed: number;
  winRate: number;
};

export type BattleLeaderboardEntry = {
  rank: number;
  studentId: string;
  name: string;
  score: number;
  tier: string;
  avatarUrl?: string;
};

export type BattleHistoryItem = {
  id: string;
  result: string;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  topic?: string;
  xpEarned: number;
};

export type BattleDaily = {
  battleId?: string;
  roomCode?: string;
  status: string;
  title: string;
  description: string;
  topicId?: string;
  totalRounds?: number;
  secondsPerRound?: number;
};

export type BattleParticipant = {
  studentId?: string;
  name: string;
  avatarUrl?: string;
  isBot?: boolean;
  roundsWon?: number;
};

export type BattleRoomState = {
  id: string;
  roomCode: string;
  status: string;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  playerCount: number;
  participants: BattleParticipant[];
  opponentFound: boolean;
  totalRounds: number;
  secondsPerRound: number;
  won?: boolean;
  eloDelta?: number;
  finished: boolean;
  readyToPlay: boolean;
};

const FINISHED = ['finished', 'completed', 'ended', 'done', 'abandoned'];
const ACTIVE = ['active', 'in_progress', 'live', 'started', 'playing'];

function resolveAnswerIndex(q: Record<string, unknown>, optionCount: number): number {
  const raw =
    q.correctIndex ??
    q.correctOptionIndex ??
    q.answerIndex ??
    q.correctAnswerIndex;
  if (typeof raw === 'number' && raw >= 0 && raw < optionCount) return raw;

  const letter = String(q.correctOption ?? q.answer ?? q.correctAnswer ?? '').trim().toUpperCase();
  if (/^[A-D]$/.test(letter)) return letter.charCodeAt(0) - 65;
  if (/^[1-4]$/.test(letter)) return Number(letter) - 1;
  return 0;
}

export function mapBattleElo(data: unknown): BattleElo | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const played = Number(d.battlesPlayed ?? 0);
  const won = Number(d.battlesWon ?? d.wins ?? 0);
  const losses = Number(d.battlesLost ?? d.losses ?? Math.max(0, played - won));
  return {
    elo: Number(d.eloRating ?? d.elo ?? d.rating ?? 1000),
    wins: won,
    losses,
    streak: Number(d.winStreak ?? d.streak ?? 0),
    battleXp: Number(d.battleXp ?? d.xpPoints ?? d.xp ?? 0),
    tier: String(d.tier ?? d.eloTier ?? 'iron'),
    battlesPlayed: played,
    winRate: played > 0 ? Math.round((won / played) * 100) : 0,
  };
}

export function mapBattleLeaderboard(data: unknown): BattleLeaderboardEntry[] {
  return asArray(data, ['leaderboard', 'entries']).map((e: Record<string, unknown>, i) => ({
    rank: Number(e.rank ?? i + 1),
    studentId: String(e.studentId ?? e.userId ?? e.id ?? ''),
    name: String(e.name ?? e.displayName ?? 'Player'),
    score: Number(e.score ?? e.battleXp ?? e.xp ?? 0),
    tier: String(e.eloTier ?? e.tier ?? ''),
    avatarUrl: e.avatarUrl ? String(e.avatarUrl) : undefined,
  }));
}

export function mapBattleHistory(data: unknown): BattleHistoryItem[] {
  return asArray(data, ['battles', 'history']).map((b: Record<string, unknown>, i) => {
    const opponent = (b.opponent as Record<string, unknown>) ?? {};
    const scoreStr = String(b.score ?? '');
    const parts = scoreStr.split(/[-–]/).map(s => s.trim());
    return {
      id: String(b.id ?? b.battleId ?? `h-${i}`),
      result: String(b.result ?? b.outcome ?? 'pending').toLowerCase(),
      opponentName: String(
        b.opponentName ?? opponent.name ?? b.opponent ?? 'Opponent',
      ),
      myScore: Number(b.myScore ?? parts[0] ?? 0),
      opponentScore: Number(b.opponentScore ?? parts[1] ?? 0),
      topic: String(b.topic ?? b.subject ?? b.topicName ?? ''),
      xpEarned: Number(b.xpEarned ?? b.xp ?? 0),
    };
  });
}

const INACTIVE_DAILY = new Set([
  'abandoned',
  'completed',
  'cancelled',
  'ended',
  'done',
  'expired',
]);

/** Daily battle card should not show stale / finished rooms from the API. */
export function isActiveDailyBattle(daily: BattleDaily | null): boolean {
  if (!daily) return false;
  return !INACTIVE_DAILY.has(daily.status.toLowerCase());
}

/** Room code from /battles/daily is only valid while the battle is still open. */
export function isJoinableDailyBattle(daily: BattleDaily | null): boolean {
  if (!isActiveDailyBattle(daily) || !daily?.battleId || !daily.roomCode) return false;
  const status = daily.status.toLowerCase();
  return ['waiting', 'active', 'open', 'pending', 'live', 'started'].includes(status);
}

export function mapBattleDaily(data: unknown): BattleDaily | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const rounds = Number(d.totalRounds ?? 10);
  const secs = Number(d.secondsPerRound ?? 30);
  const status = String(d.status ?? 'open').toLowerCase();
  const topicName = d.topicName ? String(d.topicName).trim() : '';
  return {
    battleId: d.battleId ? String(d.battleId) : undefined,
    roomCode: d.roomCode ? String(d.roomCode) : undefined,
    status,
    title: topicName || "Today's Battle",
    description: String(
      d.description ?? `${rounds} rounds · ${secs}s per round`,
    ),
    topicId: d.topicId ? String(d.topicId) : undefined,
    totalRounds: rounds,
    secondsPerRound: secs,
  };
}

export function mapBattleQuestions(data: unknown): BattleQuestion[] {
  const raw = asArray(data, ['questions', 'items', 'data']);
  return raw.map((q: Record<string, unknown>, i: number) => {
    const opts = asArray(q, ['options', 'choices']);
    const options =
      opts.length > 0
        ? opts.map((o: unknown) => {
            if (typeof o === 'string') return o;
            const obj = o as Record<string, unknown>;
            return String(obj.text ?? obj.label ?? obj.option ?? o);
          })
        : ['A', 'B', 'C', 'D'].map((l, j) =>
            String(q[`option${j + 1}`] ?? q[`option_${j + 1}`] ?? l),
          );

    return {
      id: String(q.id ?? q.questionId ?? `q-${i + 1}`),
      text: String(q.text ?? q.question ?? q.stem ?? `Question ${i + 1}`),
      options,
      answerIndex: resolveAnswerIndex(q, options.length),
    };
  });
}

function mapParticipant(p: Record<string, unknown>): BattleParticipant {
  return {
    studentId: p.studentId ? String(p.studentId) : undefined,
    name: String(p.name ?? p.displayName ?? 'Player'),
    avatarUrl: p.avatarUrl ? String(p.avatarUrl) : undefined,
    isBot: Boolean(p.isBot),
    roundsWon: Number(p.roundsWon ?? 0),
  };
}

export function mapBattleRoom(data: unknown, myStudentId?: string): BattleRoomState | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const participants = asArray<Record<string, unknown>>(r, [
    'participants',
    'players',
  ]).map(mapParticipant);

  const me =
    participants.find(p => myStudentId && p.studentId === myStudentId) ||
    participants.find((_, i) => i === 0);
  const others = participants.filter(
    p => !myStudentId || p.studentId !== myStudentId,
  );
  const opponent =
    others.find(p => !p.isBot) || others[0];

  const status = String(r.status ?? r.state ?? 'waiting').toLowerCase();
  const playerCount = Number(
    r.participantCount ?? r.playerCount ?? participants.length ?? 0,
  );
  const opponentFound =
    playerCount >= 2 ||
    others.length >= 1 ||
    ACTIVE.includes(status);

  return {
    id: String(r.battleId ?? r.id ?? ''),
    roomCode: String(r.roomCode ?? r.code ?? ''),
    status,
    opponentName: opponent?.name ?? 'Searching…',
    myScore: Number(me?.roundsWon ?? r.myScore ?? r.playerScore ?? 0),
    opponentScore: Number(
      opponent?.roundsWon ?? r.opponentScore ?? r.rivalScore ?? 0,
    ),
    playerCount,
    participants,
    opponentFound,
    totalRounds: Number(r.totalRounds ?? 5),
    secondsPerRound: Number(r.secondsPerRound ?? 30),
    won: r.won as boolean | undefined,
    eloDelta: r.eloDelta != null ? Number(r.eloDelta) : undefined,
    finished: FINISHED.includes(status),
    readyToPlay: opponentFound && !FINISHED.includes(status),
  };
}

export function pickScopeFromDaily(daily: unknown): { scope: 'subject' | 'chapter' | 'topic'; scopeId: string } | null {
  if (!daily || typeof daily !== 'object') return null;
  const d = daily as Record<string, unknown>;
  if (d.topicId) return { scope: 'topic', scopeId: String(d.topicId) };
  if (d.chapterId) return { scope: 'chapter', scopeId: String(d.chapterId) };
  if (d.subjectId) return { scope: 'subject', scopeId: String(d.subjectId) };
  return null;
}
