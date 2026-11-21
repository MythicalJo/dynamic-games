import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShow } from '../../../context/ShowContext';
import { pickRandomFastMoneyQuestions } from '../../../lib/spanishBank';
import {
  createDefaultTeamSession,
  createDefaultTimerState,
  createEmptyRoundState,
  FAST_MONEY_DEFAULT_SECONDS,
  FAST_MONEY_MODULE_ID,
  FAST_MONEY_SLOT_COUNT,
  getLiveRemainingMs,
  getRoundPointsTotal,
  normalizeFastMoneyState,
  ratingToPoints,
  roundPhaseFromStage,
  SAMPLE_FAST_MONEY_QUESTIONS,
  stageFromRoundPhase,
  type FastMoneyPhase,
  type FastMoneyQuestionItem,
  type FastMoneyRoundNumber,
  type FastMoneyRoundSlot,
  type FastMoneyScoreRating,
  type FastMoneyStage,
  type FastMoneyState,
  type FastMoneyTeamSession,
} from '../../../types/fastMoney';

export function useFastMoney() {
  const { state, role, setModuleData, adjustTeamScore, triggerCue } = useShow();

  const fallbackTeamId = state.teams[0]?.id ?? null;

  const fmState = useMemo(
    () => normalizeFastMoneyState(state.moduleData[FAST_MONEY_MODULE_ID], fallbackTeamId),
    [state.moduleData, fallbackTeamId]
  );

  const selectedTeam = useMemo(() => {
    if (fmState.selectedTeamId) {
      const found = state.teams.find((tItem) => tItem.id === fmState.selectedTeamId);
      if (found) return found;
    }
    return state.teams[0] ?? null;
  }, [fmState.selectedTeamId, state.teams]);

  const effectiveTeamId = selectedTeam?.id ?? null;

  const activeSession: FastMoneyTeamSession = useMemo(() => {
    if (effectiveTeamId && fmState.sessions[effectiveTeamId]) {
      return fmState.sessions[effectiveTeamId];
    }
    return createDefaultTeamSession(true);
  }, [effectiveTeamId, fmState.sessions]);

  const activeRoundState = activeSession.rounds[fmState.activeRound];
  const stage: FastMoneyStage = stageFromRoundPhase(fmState.activeRound, fmState.phase);

  const [remainingMs, setRemainingMs] = useState<number>(() => getLiveRemainingMs(fmState.timer));
  const lastWholeSecRef = useRef<number>(Math.ceil(getLiveRemainingMs(fmState.timer) / 1000));
  const expiredHandledRef = useRef<boolean>(false);

  const commit = useCallback(
    (updater: (prev: FastMoneyState) => FastMoneyState) => {
      const next = updater(fmState);
      setModuleData(FAST_MONEY_MODULE_ID, next);
    },
    [fmState, setModuleData]
  );

  const commitSession = useCallback(
    (updater: (session: FastMoneyTeamSession) => FastMoneyTeamSession) => {
      if (!effectiveTeamId) return;
      commit((prev) => {
        const existing = prev.sessions[effectiveTeamId] ?? createDefaultTeamSession(true);
        return {
          ...prev,
          selectedTeamId: effectiveTeamId,
          sessions: {
            ...prev.sessions,
            [effectiveTeamId]: updater(existing),
          },
        };
      });
    },
    [commit, effectiveTeamId]
  );

  useEffect(() => {
    const syncRemaining = getLiveRemainingMs(fmState.timer);
    setRemainingMs(syncRemaining);
    lastWholeSecRef.current = Math.ceil(syncRemaining / 1000);
    if (syncRemaining > 0) {
      expiredHandledRef.current = false;
    }

    if (!fmState.timer.isRunning) return;

    const interval = window.setInterval(() => {
      const current = getLiveRemainingMs(fmState.timer);
      setRemainingMs(current);

      const wholeSec = Math.ceil(current / 1000);
      if (role === 'host' && wholeSec !== lastWholeSecRef.current) {
        lastWholeSecRef.current = wholeSec;
        if (wholeSec > 0 && wholeSec <= 5) {
          // Alterna cada segundo entre "tick" agudo (5, 3, 1) y "tock" grave (4, 2)
          triggerCue(wholeSec % 2 === 1 ? 'timerTick' : 'timerTock');
        }
      }

      if (current <= 0 && !expiredHandledRef.current) {
        expiredHandledRef.current = true;
        if (role === 'host') {
          triggerCue('timeUp');
          setModuleData(FAST_MONEY_MODULE_ID, {
            ...fmState,
            timer: {
              ...fmState.timer,
              remainingMs: 0,
              isRunning: false,
              startedAt: null,
            },
          });
        }
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [fmState, role, setModuleData, triggerCue]);

  // --- Team & Pre-Game Setup Controls ---

  const selectTeam = useCallback(
    (teamId: string) => {
      commit((prev) => ({
        ...prev,
        selectedTeamId: teamId,
        activeRound: 1,
        phase: 'play',
        timer: createDefaultTimerState(),
        sessions: prev.sessions[teamId]
          ? prev.sessions
          : {
              ...prev.sessions,
              [teamId]: createDefaultTeamSession(false),
            },
      }));
    },
    [commit]
  );

  const updateQuestionItem = useCallback(
    (index: number, patch: Partial<FastMoneyQuestionItem>) => {
      commitSession((session) => ({
        ...session,
        questions: session.questions.map((q, idx) => (idx === index ? { ...q, ...patch } : q)),
      }));
    },
    [commitSession]
  );

  const loadSampleQuestions = useCallback(() => {
    commitSession((session) => ({
      ...session,
      questions: SAMPLE_FAST_MONEY_QUESTIONS.map((q) => ({ ...q })),
    }));
  }, [commitSession]);

  /** Carga 5 preguntas aleatorias del banco de 40 evitando repetir las usadas recientemente */
  const loadRandomFiveQuestions = useCallback(() => {
    if (!effectiveTeamId) return;
    commit((prev) => {
      const { selected, nextRecent } = pickRandomFastMoneyQuestions(prev.recentQuestions, 5);
      const existing = prev.sessions[effectiveTeamId] ?? createDefaultTeamSession(false);
      return {
        ...prev,
        selectedTeamId: effectiveTeamId,
        recentQuestions: nextRecent,
        sessions: {
          ...prev.sessions,
          [effectiveTeamId]: {
            ...existing,
            questions: selected.map((item) => ({
              question: item.question,
              playerAAnswer: '',
              playerBAnswer: '',
            })),
          },
        },
      };
    });
  }, [commit, effectiveTeamId]);

  // --- 4-Phase Sequential Flow Navigation ---

  const setStage = useCallback(
    (nextStage: FastMoneyStage) => {
      const { activeRound, phase } = roundPhaseFromStage(nextStage);
      commit((prev) => ({
        ...prev,
        activeRound,
        phase,
        timer: createDefaultTimerState(),
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

  const setActiveRound = useCallback(
    (round: FastMoneyRoundNumber) => {
      commit((prev) => ({
        ...prev,
        activeRound: round,
        timer: createDefaultTimerState(),
      }));
    },
    [commit]
  );

  const setPhase = useCallback(
    (phase: FastMoneyPhase) => {
      commit((prev) => ({
        ...prev,
        phase,
        timer:
          phase === 'reveal' && prev.timer.isRunning
            ? {
                ...prev.timer,
                remainingMs: getLiveRemainingMs(prev.timer),
                isRunning: false,
                startedAt: null,
              }
            : prev.timer,
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

  // --- Timer Controls ---

  const startTimer = useCallback(() => {
    commit((prev) => {
      const currentLeft = getLiveRemainingMs(prev.timer);
      const nextRemaining = currentLeft <= 0 ? FAST_MONEY_DEFAULT_SECONDS * 1000 : currentLeft;
      return {
        ...prev,
        phase: 'play',
        timer: {
          ...prev.timer,
          remainingMs: nextRemaining,
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
        remainingMs: getLiveRemainingMs(prev.timer),
        isRunning: false,
        startedAt: null,
      },
    }));
  }, [commit]);

  const resetTimer = useCallback(() => {
    commit((prev) => ({
      ...prev,
      timer: createDefaultTimerState(),
    }));
  }, [commit]);

  const addFiveSeconds = useCallback(() => {
    commit((prev) => {
      const now = Date.now();
      const currentLeft = getLiveRemainingMs(prev.timer, now);
      const nextRemaining = currentLeft + 5000;
      const nextTotal = Math.max(prev.timer.totalSeconds, Math.ceil(nextRemaining / 1000));
      return {
        ...prev,
        timer: {
          totalSeconds: nextTotal,
          remainingMs: nextRemaining,
          isRunning: prev.timer.isRunning,
          startedAt: prev.timer.isRunning ? now : null,
        },
      };
    });
  }, [commit]);

  // --- Live Round Input & PASO Controls ---

  const setActiveSlotIndex = useCallback(
    (index: number) => {
      commitSession((session) => ({
        ...session,
        rounds: {
          ...session.rounds,
          [fmState.activeRound]: {
            ...session.rounds[fmState.activeRound],
            activeSlotIndex: Math.max(0, Math.min(FAST_MONEY_SLOT_COUNT - 1, index)),
          },
        },
      }));
    },
    [commitSession, fmState.activeRound]
  );

  const findNextSlotIndex = (slots: FastMoneyRoundSlot[], fromIndex: number): number => {
    for (let step = 1; step <= FAST_MONEY_SLOT_COUNT; step++) {
      const idx = (fromIndex + step) % FAST_MONEY_SLOT_COUNT;
      if (slots[idx].status === 'empty') return idx;
    }
    for (let step = 1; step <= FAST_MONEY_SLOT_COUNT; step++) {
      const idx = (fromIndex + step) % FAST_MONEY_SLOT_COUNT;
      if (slots[idx].status === 'passed') return idx;
    }
    return (fromIndex + 1) % FAST_MONEY_SLOT_COUNT;
  };

  const updateSlotGuess = useCallback(
    (index: number, guess: string, advanceOnCommit = false): number => {
      let nextFocusIdx = index;
      commitSession((session) => {
        const round = session.rounds[fmState.activeRound];
        const nextSlots = round.slots.map((slot, idx) => {
          if (idx !== index) return slot;
          const trimmed = guess.trim();
          return {
            ...slot,
            guess,
            status: trimmed.length > 0 ? ('answered' as const) : ('empty' as const),
          };
        });
        nextFocusIdx = advanceOnCommit ? findNextSlotIndex(nextSlots, index) : index;
        return {
          ...session,
          rounds: {
            ...session.rounds,
            [fmState.activeRound]: {
              slots: nextSlots,
              activeSlotIndex: nextFocusIdx,
            },
          },
        };
      });
      return nextFocusIdx;
    },
    [commitSession, fmState.activeRound]
  );

  const passSlot = useCallback(
    (index: number): number => {
      let nextFocusIdx = (index + 1) % FAST_MONEY_SLOT_COUNT;
      commitSession((session) => {
        const round = session.rounds[fmState.activeRound];
        const nextSlots = round.slots.map((slot, idx) =>
          idx === index
            ? {
                ...slot,
                guess: '',
                status: 'passed' as const,
              }
            : slot
        );
        nextFocusIdx = findNextSlotIndex(nextSlots, index);
        return {
          ...session,
          rounds: {
            ...session.rounds,
            [fmState.activeRound]: {
              slots: nextSlots,
              activeSlotIndex: nextFocusIdx,
            },
          },
        };
      });
      triggerCue('pass');
      return nextFocusIdx;
    },
    [commitSession, fmState.activeRound, triggerCue]
  );

  // --- Reveal & Scoring Controls ---

  const toggleRevealGuess = useCallback(
    (index: number) => {
      const current = activeRoundState.slots[index];
      const nextVal = !current.guessRevealed;
      commitSession((session) => {
        const round = session.rounds[fmState.activeRound];
        return {
          ...session,
          rounds: {
            ...session.rounds,
            [fmState.activeRound]: {
              ...round,
              slots: round.slots.map((slot, idx) =>
                idx === index ? { ...slot, guessRevealed: nextVal } : slot
              ),
            },
          },
        };
      });
      if (nextVal) triggerCue('cardFlip');
    },
    [activeRoundState.slots, commitSession, fmState.activeRound, triggerCue]
  );

  const toggleRevealActual = useCallback(
    (index: number) => {
      const current = activeRoundState.slots[index];
      const nextVal = !current.actualRevealed;
      commitSession((session) => {
        const round = session.rounds[fmState.activeRound];
        return {
          ...session,
          rounds: {
            ...session.rounds,
            [fmState.activeRound]: {
              ...round,
              slots: round.slots.map((slot, idx) =>
                idx === index
                  ? {
                      ...slot,
                      guessRevealed: nextVal ? true : slot.guessRevealed,
                      actualRevealed: nextVal,
                    }
                  : slot
              ),
            },
          },
        };
      });
      if (nextVal) triggerCue('reveal');
    },
    [activeRoundState.slots, commitSession, fmState.activeRound, triggerCue]
  );

  const scoreSlot = useCallback(
    (index: number, rating: Exclude<FastMoneyScoreRating, null>) => {
      if (!effectiveTeamId) return;
      const current = activeRoundState.slots[index];
      const prevPoints = current.points;
      const nextPoints = ratingToPoints(rating);
      const delta = nextPoints - prevPoints;

      commitSession((session) => {
        const round = session.rounds[fmState.activeRound];
        return {
          ...session,
          rounds: {
            ...session.rounds,
            [fmState.activeRound]: {
              ...round,
              slots: round.slots.map((slot, idx) =>
                idx === index
                  ? {
                      ...slot,
                      guessRevealed: true,
                      actualRevealed: true,
                      rating,
                      points: nextPoints,
                    }
                  : slot
              ),
            },
          },
        };
      });

      if (delta !== 0) {
        adjustTeamScore(effectiveTeamId, delta, { silent: true });
      }

      if (rating === 'exact') triggerCue('exactMatch');
      else if (rating === 'close') triggerCue('closeMatch');
      else triggerCue('miss');
    },
    [activeRoundState.slots, adjustTeamScore, commitSession, effectiveTeamId, fmState.activeRound, triggerCue]
  );

  const resetCurrentRound = useCallback(() => {
    if (!effectiveTeamId) return;
    const awardedThisRound = getRoundPointsTotal(activeRoundState);
    if (awardedThisRound !== 0) {
      adjustTeamScore(effectiveTeamId, -awardedThisRound, { silent: true });
    }
    commit((prev) => {
      const existing = prev.sessions[effectiveTeamId] ?? createDefaultTeamSession(false);
      return {
        ...prev,
        timer: createDefaultTimerState(),
        sessions: {
          ...prev.sessions,
          [effectiveTeamId]: {
            ...existing,
            rounds: {
              ...existing.rounds,
              [prev.activeRound]: createEmptyRoundState(),
            },
          },
        },
      };
    });
  }, [activeRoundState, adjustTeamScore, commit, effectiveTeamId]);

  const resetTeamSession = useCallback(() => {
    if (!effectiveTeamId) return;
    const totalAwarded =
      getRoundPointsTotal(activeSession.rounds[1]) + getRoundPointsTotal(activeSession.rounds[2]);
    if (totalAwarded !== 0) {
      adjustTeamScore(effectiveTeamId, -totalAwarded, { silent: true });
    }
    commit((prev) => {
      const existing = prev.sessions[effectiveTeamId] ?? createDefaultTeamSession(false);
      return {
        ...prev,
        activeRound: 1,
        phase: 'play',
        timer: createDefaultTimerState(),
        sessions: {
          ...prev.sessions,
          [effectiveTeamId]: {
            ...existing,
            rounds: {
              1: createEmptyRoundState(),
              2: createEmptyRoundState(),
            },
          },
        },
      };
    });
  }, [activeSession.rounds, adjustTeamScore, commit, effectiveTeamId]);

  const round1Total = getRoundPointsTotal(activeSession.rounds[1]);
  const round2Total = getRoundPointsTotal(activeSession.rounds[2]);
  const activeRoundTotal = fmState.activeRound === 1 ? round1Total : round2Total;
  const combinedTotal = round1Total + round2Total;

  const round1AnsweredCount = activeSession.rounds[1].slots.filter(
    (s) => s.status === 'answered'
  ).length;
  const round2AnsweredCount = activeSession.rounds[2].slots.filter(
    (s) => s.status === 'answered'
  ).length;
  const isFinalRevealComplete =
    stage === 4 && activeSession.rounds[2].slots.every((s) => s.rating !== null);

  const guessingPlayerName =
    fmState.activeRound === 1
      ? selectedTeam?.playerA || 'Jugador A'
      : selectedTeam?.playerB || 'Jugador B';

  const secretOwnerName =
    fmState.activeRound === 1
      ? selectedTeam?.playerB || 'Jugador B'
      : selectedTeam?.playerA || 'Jugador A';

  const getActualAnswerForRound = useCallback(
    (index: number, round: FastMoneyRoundNumber = fmState.activeRound): string => {
      const item = activeSession.questions[index];
      if (!item) return '';
      return round === 1 ? item.playerBAnswer : item.playerAAnswer;
    },
    [activeSession.questions, fmState.activeRound]
  );

  return {
    fmState,
    stage,
    selectedTeam,
    activeSession,
    activeRoundState,
    remainingMs,
    round1Total,
    round2Total,
    activeRoundTotal,
    combinedTotal,
    round1AnsweredCount,
    round2AnsweredCount,
    isFinalRevealComplete,
    guessingPlayerName,
    secretOwnerName,
    getActualAnswerForRound,
    selectTeam,
    updateQuestionItem,
    loadSampleQuestions,
    loadRandomFiveQuestions,
    setStage,
    setActiveRound,
    setPhase,
    startTimer,
    pauseTimer,
    resetTimer,
    addFiveSeconds,
    setActiveSlotIndex,
    updateSlotGuess,
    passSlot,
    toggleRevealGuess,
    toggleRevealActual,
    scoreSlot,
    resetCurrentRound,
    resetTeamSession,
  };
}
