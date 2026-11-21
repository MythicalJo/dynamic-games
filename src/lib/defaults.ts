import { ACCENT_ORDER, type PreparedQuestion, type ShowState, type Team, type TeamAccent } from '../types/show';
import { createInitialFastMoneyState, FAST_MONEY_MODULE_ID } from '../types/fastMoney';
import {
  CONFIDENCE_AUCTION_MODULE_ID,
  createInitialConfidenceAuctionState,
} from '../types/confidenceAuction';
import { createInitialMentalSyncState, MENTAL_SYNC_MODULE_ID } from '../types/mentalSync';
import { createInitialPolygraphState, POLYGRAPH_MODULE_ID } from '../types/polygraph';

export const DEFAULT_MODULE_ID = FAST_MONEY_MODULE_ID;

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const SAMPLE_TEAMS: Team[] = [
  {
    id: 'team_neon_duos',
    name: 'CHAOS THEORY',
    playerA: 'Maya',
    playerB: 'Lucas',
    score: 1450,
    accent: 'gold',
  },
  {
    id: 'team_ride_or_die',
    name: 'RIDE OR DIE',
    playerA: 'Sofía',
    playerB: 'Mateo',
    score: 1200,
    accent: 'cyan',
  },
  {
    id: 'team_late_night',
    name: 'MIDNIGHT CREW',
    playerA: 'Jordan',
    playerB: 'Devon',
    score: 950,
    accent: 'magenta',
  },
  {
    id: 'team_clutch_kings',
    name: 'CLUTCH MODE',
    playerA: 'Elena',
    playerB: 'Noah',
    score: 800,
    accent: 'emerald',
  },
];

export const SAMPLE_QUESTIONS: PreparedQuestion[] = [
  {
    id: 'q_warmup_1',
    category: 'BESTIE TELEPATHY',
    prompt: 'If your teammate won $10,000 tonight, what is the VERY FIRST ridiculous thing they would buy?',
    answer: 'Matching answers score full points — Bonus +100 for exact brand or item!',
    points: 250,
    hostNote: 'Have both teammates write their answer simultaneously on mini whiteboards.',
  },
  {
    id: 'q_warmup_2',
    category: 'SURVEY SAYS',
    prompt: 'Name the #1 excuse a friend uses when they are 25 minutes late to dinner.',
    answer: '"Just leaving now!" / "Traffic is crazy!"',
    points: 300,
    hostNote: 'Let the audience vote if the answer is close enough!',
  },
  {
    id: 'q_warmup_3',
    category: 'HOT SEAT',
    prompt: 'Which friend in this pair is more likely to survive a zombie apocalypse — and why?',
    answer: 'Both players point on 3... 2... 1! Matching vote earns points.',
    points: 200,
    hostNote: 'Give 15 seconds for dramatic defense speeches.',
  },
  {
    id: 'q_warmup_4',
    category: 'LIGHTNING ROUND',
    prompt: 'Name 3 songs everyone in this room knows every single word to — in 10 seconds!',
    answer: 'Host awards +500 if all 3 are crowd-approved bangers.',
    points: 500,
    hostNote: 'Start the countdown right as you finish reading.',
  },
];

export function createInitialShowState(updatedAt = 0): ShowState {
  return {
    schemaVersion: 1,
    updatedAt,
    eventMeta: {
      title: 'PUNTOS RÁPIDOS',
      subtitle: 'SHOW DE AMISTAD EN VIVO',
      tagline: 'MEJORES AMIGOS • GRANDES APUESTAS • PUNTOS RÁPIDOS',
      lobbyMessage: 'TOMEN SUS ASIENTOS — EL SHOW COMIENZA PRONTO',
    },
    teams: SAMPLE_TEAMS.map((t) => ({ ...t })),
    displayMode: 'lobby',
    activeModuleId: DEFAULT_MODULE_ID,
    questions: SAMPLE_QUESTIONS.map((q) => ({ ...q })),
    stageState: {
      roundLabel: 'ROUND 1 • WARM-UP STAGE',
      selectedQuestionId: SAMPLE_QUESTIONS[0].id,
      promptVisible: true,
      answerRevealed: false,
      spotlightTeamId: null,
      showBottomScores: true,
    },
    language: 'es',
    audioMuted: false,
    moduleData: {
      [FAST_MONEY_MODULE_ID]: createInitialFastMoneyState(SAMPLE_TEAMS[0]?.id ?? null),
      [CONFIDENCE_AUCTION_MODULE_ID]: createInitialConfidenceAuctionState(SAMPLE_TEAMS[0]?.id ?? null),
      [MENTAL_SYNC_MODULE_ID]: createInitialMentalSyncState(SAMPLE_TEAMS[0]?.id ?? null),
      [POLYGRAPH_MODULE_ID]: createInitialPolygraphState(SAMPLE_TEAMS[0]?.id ?? null),
    },
  };
}

export function createBlankShowState(): ShowState {
  return {
    schemaVersion: 1,
    updatedAt: Date.now(),
    eventMeta: {
      title: 'PUNTOS RÁPIDOS',
      subtitle: 'LIVE FRIENDSHIP GAME SHOW',
      tagline: 'BEST FRIENDS • BIG STAKES • FAST POINTS',
      lobbyMessage: 'WELCOME TO THE SHOW',
    },
    teams: [],
    displayMode: 'lobby',
    activeModuleId: DEFAULT_MODULE_ID,
    questions: [],
    stageState: {
      roundLabel: 'ROUND 1',
      selectedQuestionId: null,
      promptVisible: false,
      answerRevealed: false,
      spotlightTeamId: null,
      showBottomScores: true,
    },
    language: 'es',
    audioMuted: false,
    moduleData: {},
  };
}

function isValidAccent(val: unknown): val is TeamAccent {
  return typeof val === 'string' && (ACCENT_ORDER as string[]).includes(val);
}

/**
 * Validates and normalizes imported JSON event data so malformed or older exports
 * never crash the live show.
 */
export function parseImportedShowState(raw: unknown): { ok: true; state: ShowState } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'File does not contain a valid JSON object.' };
  }

  const obj = raw as Record<string, unknown>;
  const base = createBlankShowState();

  const rawMeta = (obj.eventMeta && typeof obj.eventMeta === 'object'
    ? obj.eventMeta
    : {}) as Record<string, unknown>;

  const eventMeta = {
    title: typeof rawMeta.title === 'string' && rawMeta.title.trim() ? rawMeta.title.trim() : base.eventMeta.title,
    subtitle: typeof rawMeta.subtitle === 'string' ? rawMeta.subtitle.trim() : base.eventMeta.subtitle,
    tagline: typeof rawMeta.tagline === 'string' ? rawMeta.tagline.trim() : base.eventMeta.tagline,
    lobbyMessage: typeof rawMeta.lobbyMessage === 'string' ? rawMeta.lobbyMessage.trim() : base.eventMeta.lobbyMessage,
  };

  if (obj.teams !== undefined && !Array.isArray(obj.teams)) {
    return { ok: false, error: 'Invalid "teams" field: expected an array.' };
  }

  const teams: Team[] = Array.isArray(obj.teams)
    ? obj.teams
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item, idx) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id : createId('team'),
          name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : `Team ${idx + 1}`,
          playerA: typeof item.playerA === 'string' ? item.playerA.trim() : 'Player A',
          playerB: typeof item.playerB === 'string' ? item.playerB.trim() : 'Player B',
          score: typeof item.score === 'number' && Number.isFinite(item.score) ? Math.round(item.score) : 0,
          accent: isValidAccent(item.accent) ? item.accent : ACCENT_ORDER[idx % ACCENT_ORDER.length],
        }))
    : [];

  if (obj.questions !== undefined && !Array.isArray(obj.questions)) {
    return { ok: false, error: 'Invalid "questions" field: expected an array.' };
  }

  const questions: PreparedQuestion[] = Array.isArray(obj.questions)
    ? obj.questions
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id : createId('q'),
          category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'GENERAL',
          prompt: typeof item.prompt === 'string' ? item.prompt : '',
          answer: typeof item.answer === 'string' ? item.answer : '',
          points: typeof item.points === 'number' && Number.isFinite(item.points) ? Math.round(item.points) : 100,
          hostNote: typeof item.hostNote === 'string' ? item.hostNote : undefined,
        }))
    : [];

  const displayMode =
    obj.displayMode === 'lobby' || obj.displayMode === 'leaderboard' || obj.displayMode === 'game'
      ? obj.displayMode
      : 'lobby';

  const activeModuleId =
    typeof obj.activeModuleId === 'string' && obj.activeModuleId.trim()
      ? obj.activeModuleId
      : DEFAULT_MODULE_ID;

  const rawStage = (obj.stageState && typeof obj.stageState === 'object'
    ? obj.stageState
    : {}) as Record<string, unknown>;

  const validSelectedQ =
    typeof rawStage.selectedQuestionId === 'string' &&
    questions.some((q) => q.id === rawStage.selectedQuestionId)
      ? rawStage.selectedQuestionId
      : questions[0]?.id ?? null;

  const validSpotlightTeam =
    typeof rawStage.spotlightTeamId === 'string' &&
    teams.some((t) => t.id === rawStage.spotlightTeamId)
      ? rawStage.spotlightTeamId
      : null;

  const moduleData =
    obj.moduleData && typeof obj.moduleData === 'object' && !Array.isArray(obj.moduleData)
      ? (obj.moduleData as Record<string, unknown>)
      : {};

  return {
    ok: true,
    state: {
      schemaVersion: 1,
      updatedAt: Date.now(),
      eventMeta,
      teams,
      displayMode,
      activeModuleId,
      questions,
      stageState: {
        roundLabel:
          typeof rawStage.roundLabel === 'string' && rawStage.roundLabel.trim()
            ? rawStage.roundLabel.trim()
            : 'ROUND 1',
        selectedQuestionId: validSelectedQ,
        promptVisible: typeof rawStage.promptVisible === 'boolean' ? rawStage.promptVisible : true,
        answerRevealed: typeof rawStage.answerRevealed === 'boolean' ? rawStage.answerRevealed : false,
        spotlightTeamId: validSpotlightTeam,
        showBottomScores: typeof rawStage.showBottomScores === 'boolean' ? rawStage.showBottomScores : true,
      },
      language: obj.language === 'en' ? 'en' : 'es',
      audioMuted: typeof obj.audioMuted === 'boolean' ? obj.audioMuted : false,
      moduleData,
    },
  };
}
