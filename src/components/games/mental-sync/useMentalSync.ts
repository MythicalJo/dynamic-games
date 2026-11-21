import { useCallback, useMemo } from 'react';
import { useShow } from '../../../context/ShowContext';
import { createId } from '../../../lib/defaults';
import {
  computeRemainingMs,
  createTimerState,
  useSyncedTimer,
} from '../../../lib/timer';
import {
  MENTAL_SYNC_DEFAULT_SECONDS,
  MENTAL_SYNC_MATCH_POINTS,
  MENTAL_SYNC_MODULE_ID,
  normalizeMentalSyncState,
  SAMPLE_MENTAL_SYNC_PROMPTS,
  type MentalSyncPrompt,
  type MentalSyncPromptType,
  type MentalSyncResult,
  type MentalSyncState,
} from '../../../types/mentalSync';

export function useMentalSync() {
  const { state, role, setModuleData, adjustTeamScore, triggerCue } = useShow();
  const fallbackTeamId = state.teams[0]?.id ?? null;

  const syncState = useMemo(
    () => normalizeMentalSyncState(state.moduleData[MENTAL_SYNC_MODULE_ID], fallbackTeamId),
    [state.moduleData, fallbackTeamId]
  );

  const activeTeam = useMemo(() => {
    if (syncState.activeTeamId) {
      const found = state.teams.find((t) => t.id === syncState.activeTeamId);
      if (found) return found;
    }
    return state.teams[0] ?? null;
  }, [syncState.activeTeamId, state.teams]);

  const activePrompt = useMemo(
    () => syncState.prompts.find((p) => p.id === syncState.selectedPromptId) ?? null,
    [syncState.prompts, syncState.selectedPromptId]
  );

  const commit = useCallback(
    (updater: (prev: MentalSyncState) => MentalSyncState) => {
      const next = updater(syncState);
      setModuleData(MENTAL_SYNC_MODULE_ID, next);
    },
    [syncState, setModuleData]
  );

  const handleExpire = useCallback(() => {
    setModuleData(MENTAL_SYNC_MODULE_ID, {
      ...syncState,
      timer: {
        ...syncState.timer,
        remainingMs: 0,
        isRunning: false,
        startedAt: null,
      },
    });
  }, [syncState, setModuleData]);

  const remainingMs = useSyncedTimer({
    timer: syncState.timer,
    role,
    triggerCue,
    onExpire: handleExpire,
  });

  // --- Prompts Setup CRUD ---

  const addPrompt = useCallback(
    (type: MentalSyncPromptType, text: string) => {
      const id = createId('ms');
      commit((prev) => ({
        ...prev,
        prompts: [...prev.prompts, { id, type, text: text.trim() }],
        selectedPromptId: prev.selectedPromptId ?? id,
      }));
      return id;
    },
    [commit]
  );

  const updatePrompt = useCallback(
    (id: string, patch: Partial<Omit<MentalSyncPrompt, 'id'>>) => {
      commit((prev) => ({
        ...prev,
        prompts: prev.prompts.map((p) =>
          p.id === id
            ? {
                ...p,
                ...patch,
                text: patch.text !== undefined ? patch.text.trim() : p.text,
              }
            : p
        ),
      }));
    },
    [commit]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      commit((prev) => {
        const remaining = prev.prompts.filter((p) => p.id !== id);
        return {
          ...prev,
          prompts: remaining,
          selectedPromptId:
            prev.selectedPromptId === id ? remaining[0]?.id ?? null : prev.selectedPromptId,
        };
      });
    },
    [commit]
  );

  const loadSamplePrompts = useCallback(() => {
    commit((prev) => ({
      ...prev,
      prompts: SAMPLE_MENTAL_SYNC_PROMPTS.map((p) => ({ ...p })),
      selectedPromptId: SAMPLE_MENTAL_SYNC_PROMPTS[0].id,
      playerAAnswer: '',
      playerBAnswer: '',
      showWhiteboardsOnDisplay: false,
      result: 'pending',
      awardedPoints: 0,
      timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
    }));
  }, [commit]);

  // --- Live Round Controls ---

  const selectPrompt = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        selectedPromptId: id,
        playerAAnswer: '',
        playerBAnswer: '',
        showWhiteboardsOnDisplay: false,
        result: 'pending',
        awardedPoints: 0,
        timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

  const setActiveTeam = useCallback(
    (teamId: string) => {
      commit((prev) => ({
        ...prev,
        activeTeamId: teamId,
        playerAAnswer: '',
        playerBAnswer: '',
        showWhiteboardsOnDisplay: false,
        result: 'pending',
        awardedPoints: 0,
        timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
      }));
    },
    [commit]
  );

  const setTimerEnabled = useCallback(
    (enabled: boolean) => {
      commit((prev) => ({
        ...prev,
        timerEnabled: enabled,
        timer: !enabled ? createTimerState(MENTAL_SYNC_DEFAULT_SECONDS) : prev.timer,
      }));
    },
    [commit]
  );

  const startTimer = useCallback(() => {
    commit((prev) => {
      const left = computeRemainingMs(prev.timer);
      const nextMs = left <= 0 ? MENTAL_SYNC_DEFAULT_SECONDS * 1000 : left;
      return {
        ...prev,
        timerEnabled: true,
        timer: {
          ...prev.timer,
          remainingMs: nextMs,
          isRunning: true,
          startedAt: Date.now(),
        },
      };
    });
  }, [commit]);

  const pauseTimer = useCallback(() => {
    commit((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        remainingMs: computeRemainingMs(prev.timer),
        isRunning: false,
        startedAt: null,
      },
    }));
  }, [commit]);

  const resetTimer = useCallback(() => {
    commit((prev) => ({
      ...prev,
      timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
    }));
  }, [commit]);

  const setWhiteboardAnswers = useCallback(
    (patch: { playerAAnswer?: string; playerBAnswer?: string; showWhiteboardsOnDisplay?: boolean }) => {
      commit((prev) => ({
        ...prev,
        ...patch,
      }));
      if (patch.showWhiteboardsOnDisplay === true) {
        triggerCue('cardFlip');
      }
    },
    [commit, triggerCue]
  );

  const triggerResult = useCallback(
    (result: MentalSyncResult) => {
      const teamId = activeTeam?.id ?? null;
      const prevAwarded = syncState.awardedPoints;
      const nextAwarded = result === 'match' ? MENTAL_SYNC_MATCH_POINTS : 0;
      const delta = nextAwarded - prevAwarded;

      commit((prev) => ({
        ...prev,
        result,
        awardedPoints: nextAwarded,
        timer: prev.timer.isRunning
          ? {
              ...prev.timer,
              remainingMs: computeRemainingMs(prev.timer),
              isRunning: false,
              startedAt: null,
            }
          : prev.timer,
      }));

      if (teamId && delta !== 0) {
        adjustTeamScore(teamId, delta, { silent: true });
      }

      if (result === 'match') triggerCue('exactMatch');
      else if (result === 'mismatch') triggerCue('miss');
    },
    [activeTeam, adjustTeamScore, commit, syncState.awardedPoints, triggerCue]
  );

  return {
    syncState,
    activeTeam,
    activePrompt,
    remainingMs,
    addPrompt,
    updatePrompt,
    deletePrompt,
    loadSamplePrompts,
    selectPrompt,
    setActiveTeam,
    setTimerEnabled,
    startTimer,
    pauseTimer,
    resetTimer,
    setWhiteboardAnswers,
    triggerResult,
  };
}
