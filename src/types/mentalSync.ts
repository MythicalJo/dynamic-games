import { MENTAL_SYNC_PROMPT_BANK } from '../lib/spanishBank';
import { createTimerState, normalizeTimerState, type SyncedTimerState } from '../lib/timer';

export const MENTAL_SYNC_MODULE_ID = 'mental-sync';
export const MENTAL_SYNC_DEFAULT_SECONDS = 15;
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
  timer: SyncedTimerState;
  playerAAnswer: string;
  playerBAnswer: string;
  showWhiteboardsOnDisplay: boolean;
  result: MentalSyncResult;
  awardedPoints: number;
}

export const SAMPLE_MENTAL_SYNC_PROMPTS: MentalSyncPrompt[] = MENTAL_SYNC_PROMPT_BANK;

export function createInitialMentalSyncState(firstTeamId: string | null): MentalSyncState {
  return {
    prompts: MENTAL_SYNC_PROMPT_BANK.map((p) => ({ ...p })),
    selectedPromptId: MENTAL_SYNC_PROMPT_BANK[0]?.id ?? null,
    activeTeamId: firstTeamId,
    timerEnabled: true,
    timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
    playerAAnswer: '',
    playerBAnswer: '',
    showWhiteboardsOnDisplay: false,
    result: 'pending',
    awardedPoints: 0,
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
    : MENTAL_SYNC_PROMPT_BANK.map((p) => ({ ...p }));

  const selectedPromptId =
    typeof obj.selectedPromptId === 'string' && prompts.some((p) => p.id === obj.selectedPromptId)
      ? obj.selectedPromptId
      : prompts[0]?.id ?? null;

  const result: MentalSyncResult =
    obj.result === 'match' || obj.result === 'mismatch' ? obj.result : 'pending';

  return {
    prompts,
    selectedPromptId,
    activeTeamId:
      typeof obj.activeTeamId === 'string' && obj.activeTeamId.trim()
        ? obj.activeTeamId
        : fallbackTeamId,
    timerEnabled: typeof obj.timerEnabled === 'boolean' ? obj.timerEnabled : true,
    timer: normalizeTimerState(obj.timer, MENTAL_SYNC_DEFAULT_SECONDS),
    playerAAnswer: typeof obj.playerAAnswer === 'string' ? obj.playerAAnswer : '',
    playerBAnswer: typeof obj.playerBAnswer === 'string' ? obj.playerBAnswer : '',
    showWhiteboardsOnDisplay: Boolean(obj.showWhiteboardsOnDisplay),
    result,
    awardedPoints:
      typeof obj.awardedPoints === 'number' && Number.isFinite(obj.awardedPoints)
        ? Math.round(obj.awardedPoints)
        : 0,
  };
}
