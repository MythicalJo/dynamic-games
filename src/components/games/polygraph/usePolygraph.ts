import { useCallback, useMemo } from 'react';
import { useShow } from '../../../context/ShowContext';
import { createId } from '../../../lib/defaults';
import {
  computeRemainingMs,
  createTimerState,
  useSyncedTimer,
} from '../../../lib/timer';
import {
  createSamplePolygraphStatements,
  normalizePolygraphState,
  POLYGRAPH_DEFAULT_SECONDS,
  POLYGRAPH_MODULE_ID,
  type PolygraphPlayerSlot,
  type PolygraphState,
  type PolygraphStatement,
  type PolygraphVerdict,
} from '../../../types/polygraph';

export function usePolygraph() {
  const { state, role, setModuleData, adjustTeamScore, triggerCue } = useShow();
  const fallbackTeamId = state.teams[0]?.id ?? null;

  const polyState = useMemo(
    () => normalizePolygraphState(state.moduleData[POLYGRAPH_MODULE_ID], fallbackTeamId),
    [state.moduleData, fallbackTeamId]
  );

  const activeStatement = useMemo(
    () => polyState.statements.find((s) => s.id === polyState.activeStatementId) ?? null,
    [polyState.statements, polyState.activeStatementId]
  );

  const activeTeam = useMemo(() => {
    const targetId = activeStatement?.teamId ?? fallbackTeamId;
    if (targetId) {
      const found = state.teams.find((t) => t.id === targetId);
      if (found) return found;
    }
    return state.teams[0] ?? null;
  }, [activeStatement?.teamId, fallbackTeamId, state.teams]);

  const speakerName = useMemo(() => {
    if (!activeTeam) return activeStatement?.speakerSlot === 'B' ? 'Jugador B' : 'Jugador A';
    return activeStatement?.speakerSlot === 'B' ? activeTeam.playerB : activeTeam.playerA;
  }, [activeStatement?.speakerSlot, activeTeam]);

  const interrogatorName = useMemo(() => {
    if (!activeTeam) return activeStatement?.speakerSlot === 'B' ? 'Jugador A' : 'Jugador B';
    return activeStatement?.speakerSlot === 'B' ? activeTeam.playerA : activeTeam.playerB;
  }, [activeStatement?.speakerSlot, activeTeam]);

  const commit = useCallback(
    (updater: (prev: PolygraphState) => PolygraphState) => {
      const next = updater(polyState);
      setModuleData(POLYGRAPH_MODULE_ID, next);
    },
    [polyState, setModuleData]
  );

  const handleExpire = useCallback(() => {
    setModuleData(POLYGRAPH_MODULE_ID, {
      ...polyState,
      timer: {
        ...polyState.timer,
        remainingMs: 0,
        isRunning: false,
        startedAt: null,
      },
    });
  }, [polyState, setModuleData]);

  const remainingMs = useSyncedTimer({
    timer: polyState.timer,
    role,
    triggerCue,
    onExpire: handleExpire,
  });

  // --- Statements CRUD ---

  const addStatement = useCallback(
    (input: {
      statement: string;
      verdict: PolygraphVerdict;
      teamId: string | null;
      speakerSlot: PolygraphPlayerSlot;
    }) => {
      const id = createId('poly');
      commit((prev) => ({
        ...prev,
        statements: [
          ...prev.statements,
          {
            id,
            statement: input.statement.trim(),
            verdict: input.verdict,
            teamId: input.teamId,
            speakerSlot: input.speakerSlot,
          },
        ],
        activeStatementId: prev.activeStatementId ?? id,
      }));
      return id;
    },
    [commit]
  );

  const updateStatement = useCallback(
    (id: string, patch: Partial<Omit<PolygraphStatement, 'id'>>) => {
      commit((prev) => ({
        ...prev,
        statements: prev.statements.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                statement: patch.statement !== undefined ? patch.statement.trim() : s.statement,
              }
            : s
        ),
      }));
    },
    [commit]
  );

  const deleteStatement = useCallback(
    (id: string) => {
      commit((prev) => {
        const remaining = prev.statements.filter((s) => s.id !== id);
        return {
          ...prev,
          statements: remaining,
          activeStatementId:
            prev.activeStatementId === id ? remaining[0]?.id ?? null : prev.activeStatementId,
          lockedGuess: prev.activeStatementId === id ? null : prev.lockedGuess,
          verdictRevealed: prev.activeStatementId === id ? false : prev.verdictRevealed,
          awardedPoints: prev.activeStatementId === id ? 0 : prev.awardedPoints,
        };
      });
    },
    [commit]
  );

  const loadSampleStatements = useCallback(() => {
    const samples = createSamplePolygraphStatements(fallbackTeamId);
    commit((prev) => ({
      ...prev,
      statements: samples,
      activeStatementId: samples[0]?.id ?? null,
      lockedGuess: null,
      verdictRevealed: false,
      awardedPoints: 0,
      timer: createTimerState(POLYGRAPH_DEFAULT_SECONDS),
    }));
  }, [commit, fallbackTeamId]);

  // --- Live Interrogation Controls ---

  const pushStatementToScreen = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        activeStatementId: id,
        lockedGuess: null,
        verdictRevealed: false,
        awardedPoints: 0,
        timer: createTimerState(POLYGRAPH_DEFAULT_SECONDS),
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

  /** Cambio de equipo en 1 toque: carga la primera afirmación del equipo o asigna la activa a ese equipo */
  const selectTeamForLive = useCallback(
    (teamId: string) => {
      const teamStatement = polyState.statements.find((s) => s.teamId === teamId);
      if (teamStatement) {
        if (teamStatement.id === polyState.activeStatementId) return;
        pushStatementToScreen(teamStatement.id);
        return;
      }

      if (!polyState.activeStatementId) return;
      commit((prev) => ({
        ...prev,
        statements: prev.statements.map((s) =>
          s.id === prev.activeStatementId ? { ...s, teamId } : s
        ),
        lockedGuess: null,
        verdictRevealed: false,
        awardedPoints: 0,
      }));
      triggerCue('switch');
    },
    [commit, polyState.activeStatementId, polyState.statements, pushStatementToScreen, triggerCue]
  );

  const setRewardPoints = useCallback(
    (points: number) => {
      commit((prev) => ({
        ...prev,
        rewardPoints: Math.max(1, Math.round(points) || 1),
      }));
    },
    [commit]
  );

  const startTimer = useCallback(() => {
    commit((prev) => {
      const left = computeRemainingMs(prev.timer);
      const nextMs = left <= 0 ? POLYGRAPH_DEFAULT_SECONDS * 1000 : left;
      return {
        ...prev,
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
      timer: createTimerState(POLYGRAPH_DEFAULT_SECONDS),
    }));
  }, [commit]);

  const addTenSeconds = useCallback(() => {
    commit((prev) => {
      const now = Date.now();
      const left = computeRemainingMs(prev.timer, now);
      const nextRemaining = left + 10000;
      return {
        ...prev,
        timer: {
          totalSeconds: Math.max(prev.timer.totalSeconds, Math.ceil(nextRemaining / 1000)),
          remainingMs: nextRemaining,
          isRunning: prev.timer.isRunning,
          startedAt: prev.timer.isRunning ? now : null,
        },
      };
    });
  }, [commit]);

  const lockGuess = useCallback(
    (guess: PolygraphVerdict | null) => {
      commit((prev) => ({
        ...prev,
        lockedGuess: guess,
      }));
      if (guess) triggerCue('cardFlip');
    },
    [commit, triggerCue]
  );

  const revealVerdict = useCallback(() => {
    if (!activeStatement) return;
    const isCorrectGuess =
      polyState.lockedGuess !== null && polyState.lockedGuess === activeStatement.verdict;
    const prevAwarded = polyState.awardedPoints;
    const nextAwarded = isCorrectGuess ? polyState.rewardPoints : 0;
    const delta = nextAwarded - prevAwarded;

    commit((prev) => ({
      ...prev,
      verdictRevealed: true,
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

    if (activeTeam && delta !== 0) {
      adjustTeamScore(activeTeam.id, delta, { silent: true });
    }

    triggerCue(activeStatement.verdict === 'truth' ? 'stampTruth' : 'stampLie');
  }, [
    activeStatement,
    activeTeam,
    adjustTeamScore,
    commit,
    polyState.awardedPoints,
    polyState.lockedGuess,
    polyState.rewardPoints,
    triggerCue,
  ]);

  const hideVerdict = useCallback(() => {
    const prevAwarded = polyState.awardedPoints;
    commit((prev) => ({
      ...prev,
      verdictRevealed: false,
      awardedPoints: 0,
    }));
    if (activeTeam && prevAwarded !== 0) {
      adjustTeamScore(activeTeam.id, -prevAwarded, { silent: true });
    }
  }, [activeTeam, adjustTeamScore, commit, polyState.awardedPoints]);

  return {
    polyState,
    activeStatement,
    activeTeam,
    speakerName,
    interrogatorName,
    remainingMs,
    addStatement,
    updateStatement,
    deleteStatement,
    loadSampleStatements,
    pushStatementToScreen,
    selectTeamForLive,
    setRewardPoints,
    startTimer,
    pauseTimer,
    resetTimer,
    addTenSeconds,
    lockGuess,
    revealVerdict,
    hideVerdict,
  };
}
