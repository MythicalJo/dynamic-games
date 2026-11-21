import { useCallback, useMemo } from 'react';
import { useShow } from '../../../context/ShowContext';
import { createId } from '../../../lib/defaults';
import { MENTAL_SYNC_PROMPT_BANK, pickRandomMentalSyncPrompts } from '../../../lib/spanishBank';
import {
  computeRemainingMs,
  createTimerState,
  useSyncedTimer,
} from '../../../lib/timer';
import {
  createDefaultMentalSyncDeck,
  MENTAL_SYNC_DECK_SIZE,
  MENTAL_SYNC_MATCH_POINTS,
  MENTAL_SYNC_MODULE_ID,
  normalizeMentalSyncState,
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

  const unusedBankCount = useMemo(() => {
    const usedSet = new Set(syncState.recentPromptTexts);
    return MENTAL_SYNC_PROMPT_BANK.filter((item) => !usedSet.has(item.text)).length;
  }, [syncState.recentPromptTexts]);

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

  // --- Prompts Setup & 12-Question Deck Controls ---

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
    const deck = createDefaultMentalSyncDeck();
    commit((prev) => ({
      ...prev,
      prompts: deck,
      selectedPromptId: deck[0]?.id ?? null,
      recentPromptTexts: deck.map((p) => p.text),
      playerAAnswer: '',
      playerBAnswer: '',
      showWhiteboardsOnDisplay: false,
      result: 'pending',
      awardedPoints: 0,
      teamResults: {},
      timer: createTimerState(prev.timerSeconds),
    }));
  }, [commit]);

  /** Carga 12 preguntas al azar sin repetir del banco integrado */
  const loadRandomTwelvePrompts = useCallback(() => {
    commit((prev) => {
      const { selected, nextRecent } = pickRandomMentalSyncPrompts(
        prev.recentPromptTexts,
        MENTAL_SYNC_DECK_SIZE
      );
      return {
        ...prev,
        prompts: selected,
        selectedPromptId: selected[0]?.id ?? null,
        recentPromptTexts: nextRecent,
        playerAAnswer: '',
        playerBAnswer: '',
        showWhiteboardsOnDisplay: false,
        result: 'pending',
        awardedPoints: 0,
        teamResults: {},
        timer: createTimerState(prev.timerSeconds),
      };
    });
    triggerCue('switch');
  }, [commit, triggerCue]);

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
        teamResults: {},
        timer: createTimerState(prev.timerSeconds),
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
        timer: createTimerState(prev.timerSeconds),
      }));
    },
    [commit]
  );

  const setTimerEnabled = useCallback(
    (enabled: boolean) => {
      commit((prev) => ({
        ...prev,
        timerEnabled: enabled,
        timer: !enabled ? createTimerState(prev.timerSeconds) : prev.timer,
      }));
    },
    [commit]
  );

  const setTimerDuration = useCallback(
    (seconds: number) => {
      const clamped = Math.max(3, Math.min(300, Math.round(seconds) || 15));
      commit((prev) => ({
        ...prev,
        timerSeconds: clamped,
        timer: createTimerState(clamped),
      }));
    },
    [commit]
  );

  const startTimer = useCallback(() => {
    commit((prev) => {
      const left = computeRemainingMs(prev.timer);
      const nextMs = left <= 0 ? prev.timerSeconds * 1000 : left;
      return {
        ...prev,
        timerEnabled: true,
        timer: {
          ...prev.timer,
          totalSeconds: prev.timerSeconds,
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
      timer: createTimerState(prev.timerSeconds),
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

  /**
   * Califica rápidamente a un equipo individual en la pregunta actual.
   * Si se vuelve a pulsar el mismo botón, deshace / alterna a pendiente y revierte los puntos.
   */
  const scoreTeamForPrompt = useCallback(
    (teamId: string, target: 'match' | 'mismatch') => {
      const prevTeamResult: MentalSyncResult = syncState.teamResults[teamId] ?? 'pending';
      const nextTeamResult: MentalSyncResult = prevTeamResult === target ? 'pending' : target;

      const prevPts = prevTeamResult === 'match' ? MENTAL_SYNC_MATCH_POINTS : 0;
      const nextPts = nextTeamResult === 'match' ? MENTAL_SYNC_MATCH_POINTS : 0;
      const delta = nextPts - prevPts;

      commit((prev) => ({
        ...prev,
        activeTeamId: teamId,
        result: nextTeamResult,
        awardedPoints: nextPts,
        teamResults: {
          ...prev.teamResults,
          [teamId]: nextTeamResult,
        },
        timer: prev.timer.isRunning
          ? {
              ...prev.timer,
              remainingMs: computeRemainingMs(prev.timer),
              isRunning: false,
              startedAt: null,
            }
          : prev.timer,
      }));

      if (delta !== 0) {
        adjustTeamScore(teamId, delta, { silent: true });
      }

      if (nextTeamResult === 'match') triggerCue('exactMatch');
      else if (nextTeamResult === 'mismatch') triggerCue('miss');
    },
    [adjustTeamScore, commit, syncState.teamResults, triggerCue]
  );

  const clearResultOverlay = useCallback(() => {
    commit((prev) => ({
      ...prev,
      result: 'pending',
    }));
  }, [commit]);

  return {
    syncState,
    activeTeam,
    activePrompt,
    unusedBankCount,
    remainingMs,
    addPrompt,
    updatePrompt,
    deletePrompt,
    loadSamplePrompts,
    loadRandomTwelvePrompts,
    selectPrompt,
    setActiveTeam,
    setTimerEnabled,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    setWhiteboardAnswers,
    triggerResult,
    scoreTeamForPrompt,
    clearResultOverlay,
  };
}
