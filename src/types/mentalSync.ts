import { MENTAL_SYNC_PROMPT_BANK } from '../lib/spanishBank';
import { createTimerState, normalizeTimerState, type SyncedTimerState } from '../lib/timer';

export const MENTAL_SYNC_MODULE_ID = 'mental-sync';
export const MENTAL_SYNC_DEFAULT_SECONDS = 15;
export const MENTAL_SYNC_DECK_SIZE = 12;
export const MENTAL_SYNC_MATCH_POINTS = 15;

export type MentalSyncPromptType = 'who' | 'fill';
export type MentalSyncResult = 'pending' | 'match' | 'mismatch';

export interface MentalSyncPrompt {
  id: string;
  type: MentalSyncPromptType;
  text: string;
}

export interface MentalSyncState {
  prompts: MentalSyncPrompt[];
  selectedPromptId: string | null;
  activeTeamId: string | null;
  timerEnabled: boolean;
  /** Duración editable del temporizador en segundos (ej. 10, 15, 20, 30 o personalizado) */
  timerSeconds: number;
  timer: SyncedTimerState;
  playerAAnswer: string;
  playerBAnswer: string;
  showWhiteboardsOnDisplay: boolean;
  result: MentalSyncResult;
  awardedPoints: number;
  /** Historial de textos ya sorteados para evitar repeticiones en "Cargar 12 al azar" */
  recentPromptTexts: string[];
}

export const SAMPLE_MENTAL_SYNC_PROMPTS: MentalSyncPrompt[] = MENTAL_SYNC_PROMPT_BANK;

export function createDefaultMentalSyncDeck(): MentalSyncPrompt[] {
  return MENTAL_SYNC_PROMPT_BANK.slice(0, MENTAL_SYNC_DECK_SIZE).map((p) => ({ ...p }));
}

export function createInitialMentalSyncState(firstTeamId: string | null): MentalSyncState {
  const initialDeck = createDefaultMentalSyncDeck();
  return {
    prompts: initialDeck,
    selectedPromptId: initialDeck[0]?.id ?? null,
    activeTeamId: firstTeamId,
    timerEnabled: true,
    timerSeconds: MENTAL_SYNC_DEFAULT_SECONDS,
    timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
    playerAAnswer: '',
    playerBAnswer: '',
    showWhiteboardsOnDisplay: false,
    result: 'pending',
    awardedPoints: 0,
    recentPromptTexts: initialDeck.map((p) => p.text),
  };
}

export function normalizeMentalSyncState(
  raw: unknown,
  fallbackTeamId: string | null
): MentalSyncState {
  if (!raw || typeof raw !== 'object') {
    return createInitialMentalSyncState(fallbackTeamId);
  }
  const obj = raw as Partial<MentalSyncState>;
  const prompts: MentalSyncPrompt[] = Array.isArray(obj.prompts)
    ? obj.prompts
        .filter((p): p is MentalSyncPrompt => Boolean(p && typeof p === 'object' && typeof p.text === 'string'))
        .map((p, i) => ({
          id: typeof p.id === 'string' && p.id ? p.id : `ms_${i + 1}`,
          type: 'who' as MentalSyncPromptType,
          text: p.text,
        }))
    : createDefaultMentalSyncDeck();

  const selectedPromptId =
    typeof obj.selectedPromptId === 'string' && prompts.some((p) => p.id === obj.selectedPromptId)
      ? obj.selectedPromptId
      : prompts[0]?.id ?? null;

  const result: MentalSyncResult =
    obj.result === 'match' || obj.result === 'mismatch' ? obj.result : 'pending';

  const rawTimerSeconds =
    typeof obj.timerSeconds === 'number' && Number.isFinite(obj.timerSeconds)
      ? obj.timerSeconds
      : typeof obj.timer?.totalSeconds === 'number' && Number.isFinite(obj.timer.totalSeconds)
        ? obj.timer.totalSeconds
        : MENTAL_SYNC_DEFAULT_SECONDS;
  const timerSeconds = Math.max(3, Math.min(300, Math.round(rawTimerSeconds)));

  const recentPromptTexts = Array.isArray(obj.recentPromptTexts)
    ? obj.recentPromptTexts.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    prompts,
    selectedPromptId,
    activeTeamId:
      typeof obj.activeTeamId === 'string' && obj.activeTeamId.trim()
        ? obj.activeTeamId
        : fallbackTeamId,
    timerEnabled: typeof obj.timerEnabled === 'boolean' ? obj.timerEnabled : true,
    timerSeconds,
    timer: normalizeTimerState(obj.timer, timerSeconds),
    playerAAnswer: typeof obj.playerAAnswer === 'string' ? obj.playerAAnswer : '',
    playerBAnswer: typeof obj.playerBAnswer === 'string' ? obj.playerBAnswer : '',
    showWhiteboardsOnDisplay: Boolean(obj.showWhiteboardsOnDisplay),
    result,
    awardedPoints:
      typeof obj.awardedPoints === 'number' && Number.isFinite(obj.awardedPoints)
        ? Math.round(obj.awardedPoints)
        : 0,
    recentPromptTexts,
  };
}
