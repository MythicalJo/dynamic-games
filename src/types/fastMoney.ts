export const FAST_MONEY_MODULE_ID = 'friend-fast-money';
export const FAST_MONEY_SLOT_COUNT = 5;
export const FAST_MONEY_DEFAULT_SECONDS = 30;

export type FastMoneyRoundNumber = 1 | 2;
export type FastMoneyPhase = 'play' | 'reveal';
export type FastMoneySlotStatus = 'empty' | 'answered' | 'passed';
export type FastMoneyScoreRating = 'exact' | 'close' | 'miss' | null;

export interface FastMoneyQuestionItem {
  question: string;
  playerAAnswer: string;
  playerBAnswer: string;
}

export interface FastMoneyRoundSlot {
  guess: string;
  status: FastMoneySlotStatus;
  guessRevealed: boolean;
  actualRevealed: boolean;
  rating: FastMoneyScoreRating;
  points: number;
}

export interface FastMoneyRoundState {
  slots: FastMoneyRoundSlot[];
  activeSlotIndex: number;
}

export interface FastMoneyTimerState {
  totalSeconds: number;
  remainingMs: number;
  isRunning: boolean;
  startedAt: number | null;
}

export interface FastMoneyTeamSession {
  questions: FastMoneyQuestionItem[];
  rounds: {
    1: FastMoneyRoundState;
    2: FastMoneyRoundState;
  };
}

export interface FastMoneyState {
  selectedTeamId: string | null;
  activeRound: FastMoneyRoundNumber;
  phase: FastMoneyPhase;
  timer: FastMoneyTimerState;
  sessions: Record<string, FastMoneyTeamSession>;
}

export const SAMPLE_FAST_MONEY_QUESTIONS: FastMoneyQuestionItem[] = [
  {
    question: 'Go-to late-night fast food order?',
    playerAAnswer: 'Taco Bell Crunchwrap',
    playerBAnswer: 'Spicy chicken nuggets & fries',
  },
  {
    question: 'Dream vacation destination?',
    playerAAnswer: 'Tokyo, Japan',
    playerBAnswer: 'Amalfi Coast, Italy',
  },
  {
    question: 'Biggest pet peeve?',
    playerAAnswer: 'Loud chewing',
    playerBAnswer: 'People being late without texting',
  },
  {
    question: 'Go-to karaoke song?',
    playerAAnswer: 'Mr. Brightside',
    playerBAnswer: 'Since U Been Gone',
  },
  {
    question: 'Movie they have rewatched the most?',
    playerAAnswer: 'Spider-Man: Into the Spider-Verse',
    playerBAnswer: 'Shrek 2',
  },
];

export function createEmptySlot(): FastMoneyRoundSlot {
  return {
    guess: '',
    status: 'empty',
    guessRevealed: false,
    actualRevealed: false,
    rating: null,
    points: 0,
  };
}

export function createEmptyRoundState(): FastMoneyRoundState {
  return {
    slots: Array.from({ length: FAST_MONEY_SLOT_COUNT }, () => createEmptySlot()),
    activeSlotIndex: 0,
  };
}

export function createDefaultTimerState(): FastMoneyTimerState {
  return {
    totalSeconds: FAST_MONEY_DEFAULT_SECONDS,
    remainingMs: FAST_MONEY_DEFAULT_SECONDS * 1000,
    isRunning: false,
    startedAt: null,
  };
}

export function createDefaultTeamSession(withSample = false): FastMoneyTeamSession {
  const questions: FastMoneyQuestionItem[] = withSample
    ? SAMPLE_FAST_MONEY_QUESTIONS.map((q) => ({ ...q }))
    : Array.from({ length: FAST_MONEY_SLOT_COUNT }, (_, idx) => ({
        question: SAMPLE_FAST_MONEY_QUESTIONS[idx]?.question ?? `Question ${idx + 1}`,
        playerAAnswer: '',
        playerBAnswer: '',
      }));

  return {
    questions,
    rounds: {
      1: createEmptyRoundState(),
      2: createEmptyRoundState(),
    },
  };
}

export function createInitialFastMoneyState(firstTeamId: string | null): FastMoneyState {
  const sessions: Record<string, FastMoneyTeamSession> = {};
  if (firstTeamId) {
    sessions[firstTeamId] = createDefaultTeamSession(true);
  }
  return {
    selectedTeamId: firstTeamId,
    activeRound: 1,
    phase: 'play',
    timer: createDefaultTimerState(),
    sessions,
  };
}

export function normalizeFastMoneyState(
  raw: unknown,
  fallbackTeamId: string | null
): FastMoneyState {
  if (!raw || typeof raw !== 'object') {
    return createInitialFastMoneyState(fallbackTeamId);
  }

  const obj = raw as Partial<FastMoneyState>;
  const selectedTeamId =
    typeof obj.selectedTeamId === 'string' && obj.selectedTeamId.trim()
      ? obj.selectedTeamId
      : fallbackTeamId;

  const activeRound: FastMoneyRoundNumber = obj.activeRound === 2 ? 2 : 1;
  const phase: FastMoneyPhase = obj.phase === 'reveal' ? 'reveal' : 'play';

  const rawTimer = obj.timer;
  const timer: FastMoneyTimerState =
    rawTimer && typeof rawTimer === 'object'
      ? {
          totalSeconds:
            typeof rawTimer.totalSeconds === 'number' && rawTimer.totalSeconds > 0
              ? rawTimer.totalSeconds
              : FAST_MONEY_DEFAULT_SECONDS,
          remainingMs:
            typeof rawTimer.remainingMs === 'number' && rawTimer.remainingMs >= 0
              ? rawTimer.remainingMs
              : FAST_MONEY_DEFAULT_SECONDS * 1000,
          isRunning: Boolean(rawTimer.isRunning),
          startedAt: typeof rawTimer.startedAt === 'number' ? rawTimer.startedAt : null,
        }
      : createDefaultTimerState();

  const sessions: Record<string, FastMoneyTeamSession> = {};
  if (obj.sessions && typeof obj.sessions === 'object') {
    for (const [teamId, sessionVal] of Object.entries(obj.sessions)) {
      if (!sessionVal || typeof sessionVal !== 'object') continue;
      const rawSession = sessionVal as Partial<FastMoneyTeamSession>;
      const rawQuestions = Array.isArray(rawSession.questions) ? rawSession.questions : [];
      const questions: FastMoneyQuestionItem[] = Array.from(
        { length: FAST_MONEY_SLOT_COUNT },
        (_, idx) => {
          const item = rawQuestions[idx];
          return {
            question: typeof item?.question === 'string' ? item.question : '',
            playerAAnswer: typeof item?.playerAAnswer === 'string' ? item.playerAAnswer : '',
            playerBAnswer: typeof item?.playerBAnswer === 'string' ? item.playerBAnswer : '',
          };
        }
      );

      const normalizeRound = (r: Partial<FastMoneyRoundState> | undefined): FastMoneyRoundState => {
        const rawSlots = Array.isArray(r?.slots) ? r.slots : [];
        const slots: FastMoneyRoundSlot[] = Array.from(
          { length: FAST_MONEY_SLOT_COUNT },
          (_, idx) => {
            const s = rawSlots[idx];
            const status: FastMoneySlotStatus =
              s?.status === 'answered' || s?.status === 'passed' ? s.status : 'empty';
            const rating: FastMoneyScoreRating =
              s?.rating === 'exact' || s?.rating === 'close' || s?.rating === 'miss'
                ? s.rating
                : null;
            return {
              guess: typeof s?.guess === 'string' ? s.guess : '',
              status,
              guessRevealed: Boolean(s?.guessRevealed),
              actualRevealed: Boolean(s?.actualRevealed),
              rating,
              points: typeof s?.points === 'number' && Number.isFinite(s.points) ? s.points : 0,
            };
          }
        );
        const activeSlotIndex =
          typeof r?.activeSlotIndex === 'number' &&
          r.activeSlotIndex >= 0 &&
          r.activeSlotIndex < FAST_MONEY_SLOT_COUNT
            ? r.activeSlotIndex
            : 0;
        return { slots, activeSlotIndex };
      };

      sessions[teamId] = {
        questions,
        rounds: {
          1: normalizeRound(rawSession.rounds?.[1]),
          2: normalizeRound(rawSession.rounds?.[2]),
        },
      };
    }
  }

  return {
    selectedTeamId,
    activeRound,
    phase,
    timer,
    sessions,
  };
}

export function getLiveRemainingMs(timer: FastMoneyTimerState, now = Date.now()): number {
  if (!timer.isRunning || timer.startedAt === null) {
    return Math.max(0, timer.remainingMs);
  }
  return Math.max(0, timer.remainingMs - (now - timer.startedAt));
}

export function getRoundPointsTotal(round: FastMoneyRoundState): number {
  return round.slots.reduce((sum, s) => sum + s.points, 0);
}

export function ratingToPoints(rating: Exclude<FastMoneyScoreRating, null>): number {
  if (rating === 'exact') return 20;
  if (rating === 'close') return 10;
  return 0;
}
