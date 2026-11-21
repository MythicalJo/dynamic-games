import {
  ACCENT_ORDER,
  THEME_IDS,
  type DisplayMode,
  type PreparedQuestion,
  type ShowState,
  type Team,
  type TeamAccent,
  type ThemeId,
  type TiebreakerState,
} from '../types/show';
import { createTimerState, normalizeTimerState } from './timer';
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
    id: 'team_caos',
    name: 'CAOS TOTAL',
    playerA: 'Maya',
    playerB: 'Lucas',
    score: 140,
    accent: 'gold',
  },
  {
    id: 'team_inseparables',
    name: 'INSEPARABLES',
    playerA: 'Sofía',
    playerB: 'Mateo',
    score: 120,
    accent: 'cyan',
  },
  {
    id: 'team_nocturno',
    name: 'TURNO NOCTURNO',
    playerA: 'Valentina',
    playerB: 'Diego',
    score: 95,
    accent: 'emerald',
  },
  {
    id: 'team_leyenda',
    name: 'MODO LEYENDA',
    playerA: 'Elena',
    playerB: 'Nicolás',
    score: 80,
    accent: 'coral',
  },
];

export const SAMPLE_QUESTIONS: PreparedQuestion[] = [
  {
    id: 'q_calentamiento_1',
    category: 'TELEPATÍA',
    prompt: 'Si tu pareja ganara 10,000 dólares esta noche, ¿qué es lo PRIMERO absurdo que compraría?',
    answer: 'Respuestas iguales ganan puntaje completo — ¡+20 extra si coinciden en la marca!',
    points: 25,
    hostNote: 'Pide que ambos escriban su respuesta a la vez en sus pizarras.',
  },
  {
    id: 'q_calentamiento_2',
    category: 'ENCUESTA',
    prompt: 'Nombra la excusa #1 que usa un amigo cuando llega 25 minutos tarde a cenar.',
    answer: '«¡Ya voy saliendo!» / «¡El tráfico está imposible!»',
    points: 30,
    hostNote: 'El público decide con aplausos si la respuesta cuenta.',
  },
  {
    id: 'q_calentamiento_3',
    category: 'SILLA CALIENTE',
    prompt: '¿Quién de esta pareja sobreviviría más tiempo en un apocalipsis zombi y por qué?',
    answer: 'Ambos señalan a la cuenta de 3... 2... 1. Si coinciden, suman puntos.',
    points: 20,
    hostNote: 'Dales 15 segundos para defender su postura.',
  },
  {
    id: 'q_calentamiento_4',
    category: 'RONDA RELÁMPAGO',
    prompt: '¡Nombra 3 canciones que todos en esta sala se saben de memoria en 10 segundos!',
    answer: 'El conductor otorga +50 si el público aprueba las 3.',
    points: 50,
    hostNote: 'Cuenta los 10 segundos apenas termines de leer.',
  },
];

export function createInitialTiebreakerState(): TiebreakerState {
  return {
    source: 'mental-sync',
    promptText: '',
    promptHint: undefined,
    timerSeconds: 15,
    timer: createTimerState(15),
    winnerTeamId: null,
    usedPrompts: [],
  };
}

export function normalizeTiebreakerState(raw: unknown): TiebreakerState {
  if (!raw || typeof raw !== 'object') {
    return createInitialTiebreakerState();
  }
  const obj = raw as Partial<TiebreakerState>;
  const timerSeconds =
    typeof obj.timerSeconds === 'number' && Number.isFinite(obj.timerSeconds)
      ? Math.max(5, Math.min(180, Math.round(obj.timerSeconds)))
      : 15;
  return {
    source: obj.source === 'confidence-auction' ? 'confidence-auction' : 'mental-sync',
    promptText: typeof obj.promptText === 'string' ? obj.promptText : '',
    promptHint: typeof obj.promptHint === 'string' ? obj.promptHint : undefined,
    timerSeconds,
    timer: normalizeTimerState(obj.timer, timerSeconds),
    winnerTeamId:
      typeof obj.winnerTeamId === 'string' && obj.winnerTeamId.trim()
        ? obj.winnerTeamId
        : null,
    usedPrompts: Array.isArray(obj.usedPrompts)
      ? obj.usedPrompts.filter((item): item is string => typeof item === 'string')
      : [],
  };
}

export function createInitialShowState(updatedAt = 0): ShowState {
  return {
    schemaVersion: 1,
    updatedAt,
    eventMeta: {
      title: 'PUNTOS RÁPIDOS',
      subtitle: 'NOCHE DE JUEGOS EN VIVO',
      tagline: 'MEJORES AMIGOS · GRANDES APUESTAS · PUNTOS RÁPIDOS',
      lobbyMessage: 'TOMEN SUS ASIENTOS — EL SHOW COMIENZA PRONTO',
    },
    teams: SAMPLE_TEAMS.map((t) => ({ ...t })),
    displayMode: 'lobby',
    activeModuleId: DEFAULT_MODULE_ID,
    questions: SAMPLE_QUESTIONS.map((q) => ({ ...q })),
    stageState: {
      roundLabel: 'RONDA 1 · CALENTAMIENTO',
      selectedQuestionId: SAMPLE_QUESTIONS[0].id,
      promptVisible: true,
      answerRevealed: false,
      spotlightTeamId: null,
      showBottomScores: true,
    },
    language: 'es',
    theme: 'blanco',
    audioMuted: false,
    rulesOverlayModuleId: null,
    podiumRevealStep: 0,
    tiebreaker: createInitialTiebreakerState(),
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
      subtitle: 'NOCHE DE JUEGOS EN VIVO',
      tagline: 'MEJORES AMIGOS · GRANDES APUESTAS · PUNTOS RÁPIDOS',
      lobbyMessage: 'BIENVENIDOS AL SHOW',
    },
    teams: [],
    displayMode: 'lobby',
    activeModuleId: DEFAULT_MODULE_ID,
    questions: [],
    stageState: {
      roundLabel: 'RONDA 1',
      selectedQuestionId: null,
      promptVisible: false,
      answerRevealed: false,
      spotlightTeamId: null,
      showBottomScores: true,
    },
    language: 'es',
    theme: 'blanco',
    audioMuted: false,
    rulesOverlayModuleId: null,
    podiumRevealStep: 0,
    tiebreaker: createInitialTiebreakerState(),
    moduleData: {},
  };
}

function isValidAccent(val: unknown): val is TeamAccent {
  return typeof val === 'string' && (ACCENT_ORDER as string[]).includes(val);
}

function isValidTheme(val: unknown): val is ThemeId {
  return typeof val === 'string' && (THEME_IDS as string[]).includes(val);
}

/**
 * Valida y normaliza archivos JSON importados para evitar errores en vivo.
 */
export function parseImportedShowState(
  raw: unknown
): { ok: true; state: ShowState } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'El archivo no contiene un objeto JSON válido.' };
  }

  const obj = raw as Record<string, unknown>;
  const base = createBlankShowState();

  const rawMeta = (
    obj.eventMeta && typeof obj.eventMeta === 'object' ? obj.eventMeta : {}
  ) as Record<string, unknown>;

  const eventMeta = {
    title:
      typeof rawMeta.title === 'string' && rawMeta.title.trim()
        ? rawMeta.title.trim()
        : base.eventMeta.title,
    subtitle: typeof rawMeta.subtitle === 'string' ? rawMeta.subtitle.trim() : base.eventMeta.subtitle,
    tagline: typeof rawMeta.tagline === 'string' ? rawMeta.tagline.trim() : base.eventMeta.tagline,
    lobbyMessage:
      typeof rawMeta.lobbyMessage === 'string'
        ? rawMeta.lobbyMessage.trim()
        : base.eventMeta.lobbyMessage,
  };

  if (obj.teams !== undefined && !Array.isArray(obj.teams)) {
    return { ok: false, error: 'El campo "teams" no es válido: se esperaba una lista.' };
  }

  const teams: Team[] = Array.isArray(obj.teams)
    ? obj.teams
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item, idx) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id : createId('team'),
          name:
            typeof item.name === 'string' && item.name.trim()
              ? item.name.trim()
              : `EQUIPO ${idx + 1}`,
          playerA: typeof item.playerA === 'string' ? item.playerA.trim() : 'Jugador A',
          playerB: typeof item.playerB === 'string' ? item.playerB.trim() : 'Jugador B',
          score:
            typeof item.score === 'number' && Number.isFinite(item.score)
              ? Math.round(item.score)
              : 0,
          accent: isValidAccent(item.accent)
            ? item.accent
            : ACCENT_ORDER[idx % ACCENT_ORDER.length],
        }))
    : [];

  if (obj.questions !== undefined && !Array.isArray(obj.questions)) {
    return { ok: false, error: 'El campo "questions" no es válido: se esperaba una lista.' };
  }

  const questions: PreparedQuestion[] = Array.isArray(obj.questions)
    ? obj.questions
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id : createId('q'),
          category:
            typeof item.category === 'string' && item.category.trim()
              ? item.category.trim()
              : 'GENERAL',
          prompt: typeof item.prompt === 'string' ? item.prompt : '',
          answer: typeof item.answer === 'string' ? item.answer : '',
          points:
            typeof item.points === 'number' && Number.isFinite(item.points)
              ? Math.round(item.points)
              : 20,
          hostNote: typeof item.hostNote === 'string' ? item.hostNote : undefined,
        }))
    : [];

  const displayMode: DisplayMode =
    obj.displayMode === 'lobby' ||
    obj.displayMode === 'leaderboard' ||
    obj.displayMode === 'game' ||
    obj.displayMode === 'podium' ||
    obj.displayMode === 'tiebreaker'
      ? obj.displayMode
      : 'lobby';

  const activeModuleId =
    typeof obj.activeModuleId === 'string' && obj.activeModuleId.trim()
      ? obj.activeModuleId
      : DEFAULT_MODULE_ID;

  const rawStage = (
    obj.stageState && typeof obj.stageState === 'object' ? obj.stageState : {}
  ) as Record<string, unknown>;

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
            : 'RONDA 1',
        selectedQuestionId: validSelectedQ,
        promptVisible: typeof rawStage.promptVisible === 'boolean' ? rawStage.promptVisible : true,
        answerRevealed:
          typeof rawStage.answerRevealed === 'boolean' ? rawStage.answerRevealed : false,
        spotlightTeamId: validSpotlightTeam,
        showBottomScores:
          typeof rawStage.showBottomScores === 'boolean' ? rawStage.showBottomScores : true,
      },
      language: obj.language === 'en' ? 'en' : 'es',
      theme: isValidTheme(obj.theme) ? obj.theme : 'blanco',
      audioMuted: typeof obj.audioMuted === 'boolean' ? obj.audioMuted : false,
      rulesOverlayModuleId:
        typeof obj.rulesOverlayModuleId === 'string' && obj.rulesOverlayModuleId.trim()
          ? obj.rulesOverlayModuleId
          : null,
      podiumRevealStep:
        obj.podiumRevealStep === 1 || obj.podiumRevealStep === 2 || obj.podiumRevealStep === 3
          ? obj.podiumRevealStep
          : 0,
      tiebreaker: normalizeTiebreakerState(obj.tiebreaker),
      moduleData,
    },
  };
}
