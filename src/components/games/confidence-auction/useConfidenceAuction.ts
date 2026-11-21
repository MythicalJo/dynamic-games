import { useCallback, useMemo } from 'react';
import { useShow } from '../../../context/ShowContext';
import { createId } from '../../../lib/defaults';
import {
  computeRemainingMs,
  createTimerState,
  useSyncedTimer,
} from '../../../lib/timer';
import {
  AUCTION_DEFAULT_SECONDS,
  AUCTION_FAIL_BONUS_OTHER_TEAMS,
  CONFIDENCE_AUCTION_MODULE_ID,
  normalizeConfidenceAuctionState,
  SAMPLE_AUCTION_CATEGORIES,
  type AuctionCategory,
  type AuctionOutcome,
  type ConfidenceAuctionState,
} from '../../../types/confidenceAuction';

export function useConfidenceAuction() {
  const { state, role, setModuleData, adjustMultipleTeamScores, triggerCue } = useShow();
  const fallbackTeamId = state.teams[0]?.id ?? null;

  const auctionState = useMemo(
    () => normalizeConfidenceAuctionState(state.moduleData[CONFIDENCE_AUCTION_MODULE_ID], fallbackTeamId),
    [state.moduleData, fallbackTeamId]
  );

  const winningTeam = useMemo(() => {
    if (auctionState.winningTeamId) {
      const found = state.teams.find((t) => t.id === auctionState.winningTeamId);
      if (found) return found;
    }
    return state.teams[0] ?? null;
  }, [auctionState.winningTeamId, state.teams]);

  const activeCategory = useMemo(
    () => auctionState.categories.find((c) => c.id === auctionState.selectedCategoryId) ?? null,
    [auctionState.categories, auctionState.selectedCategoryId]
  );

  const unusedCategoriesCount = useMemo(() => {
    const usedSet = new Set(auctionState.usedCategoryIds);
    return auctionState.categories.filter((c) => !usedSet.has(c.id)).length;
  }, [auctionState.categories, auctionState.usedCategoryIds]);

  const commit = useCallback(
    (updater: (prev: ConfidenceAuctionState) => ConfidenceAuctionState) => {
      const next = updater(auctionState);
      setModuleData(CONFIDENCE_AUCTION_MODULE_ID, next);
    },
    [auctionState, setModuleData]
  );

  const handleExpire = useCallback(() => {
    setModuleData(CONFIDENCE_AUCTION_MODULE_ID, {
      ...auctionState,
      timer: {
        ...auctionState.timer,
        remainingMs: 0,
        isRunning: false,
        startedAt: null,
      },
    });
  }, [auctionState, setModuleData]);

  const remainingMs = useSyncedTimer({
    timer: auctionState.timer,
    role,
    triggerCue,
    onExpire: handleExpire,
  });

  // --- Categories CRUD ---

  const addCategory = useCallback(
    (title: string, hint?: string) => {
      const id = createId('cat');
      commit((prev) => ({
        ...prev,
        categories: [
          ...prev.categories,
          { id, title: title.trim(), hint: hint?.trim() || undefined },
        ],
        selectedCategoryId: prev.selectedCategoryId ?? id,
      }));
      return id;
    },
    [commit]
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<Omit<AuctionCategory, 'id'>>) => {
      commit((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                title: patch.title !== undefined ? patch.title.trim() : c.title,
                hint: patch.hint !== undefined ? patch.hint.trim() || undefined : c.hint,
              }
            : c
        ),
      }));
    },
    [commit]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      commit((prev) => {
        const remaining = prev.categories.filter((c) => c.id !== id);
        return {
          ...prev,
          categories: remaining,
          selectedCategoryId:
            prev.selectedCategoryId === id ? remaining[0]?.id ?? null : prev.selectedCategoryId,
        };
      });
    },
    [commit]
  );

  const loadSampleCategories = useCallback(() => {
    const firstId = SAMPLE_AUCTION_CATEGORIES[0]?.id ?? null;
    commit((prev) => ({
      ...prev,
      categories: SAMPLE_AUCTION_CATEGORIES.map((c) => ({ ...c })),
      selectedCategoryId: firstId,
      usedCategoryIds: firstId ? [firstId] : [],
      hits: 0,
      outcome: 'pending',
      awardedPoints: 0,
      failedBonusTeamIds: [],
      timer: createTimerState(AUCTION_DEFAULT_SECONDS),
    }));
  }, [commit]);

  // --- Live Controls ---

  const selectCategory = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        selectedCategoryId: id,
        usedCategoryIds: prev.usedCategoryIds.includes(id)
          ? prev.usedCategoryIds
          : [...prev.usedCategoryIds, id],
        hits: 0,
        outcome: 'pending',
        awardedPoints: 0,
        failedBonusTeamIds: [],
        timer: createTimerState(AUCTION_DEFAULT_SECONDS),
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

  /** Elige una categoría al azar evitando repetir las ya jugadas */
  const selectRandomCategory = useCallback(() => {
    if (auctionState.categories.length === 0) return;
    commit((prev) => {
      const usedSet = new Set(prev.usedCategoryIds);
      let candidates = prev.categories.filter(
        (c) => !usedSet.has(c.id) && c.id !== prev.selectedCategoryId
      );
      let resetPool = false;

      if (candidates.length === 0) {
        candidates = prev.categories.filter((c) => c.id !== prev.selectedCategoryId);
        if (candidates.length === 0) candidates = prev.categories;
        resetPool = true;
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      if (!chosen) return prev;

      return {
        ...prev,
        selectedCategoryId: chosen.id,
        usedCategoryIds: resetPool ? [chosen.id] : [...prev.usedCategoryIds, chosen.id],
        hits: 0,
        outcome: 'pending',
        awardedPoints: 0,
        failedBonusTeamIds: [],
        timer: createTimerState(AUCTION_DEFAULT_SECONDS),
      };
    });
    triggerCue('switch');
  }, [auctionState.categories.length, commit, triggerCue]);

  const adjustBid = useCallback(
    (delta: number) => {
      commit((prev) => ({
        ...prev,
        bidTarget: Math.max(1, prev.bidTarget + delta),
      }));
    },
    [commit]
  );

  const setBidTarget = useCallback(
    (target: number) => {
      commit((prev) => ({
        ...prev,
        bidTarget: Math.max(1, Math.round(target) || 1),
      }));
    },
    [commit]
  );

  const setWinningTeam = useCallback(
    (teamId: string) => {
      commit((prev) => ({
        ...prev,
        winningTeamId: teamId,
        outcome: 'pending',
        awardedPoints: 0,
        failedBonusTeamIds: [],
      }));
    },
    [commit]
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
      const current = computeRemainingMs(prev.timer);
      const nextMs = current <= 0 ? AUCTION_DEFAULT_SECONDS * 1000 : current;
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
      timer: createTimerState(AUCTION_DEFAULT_SECONDS),
    }));
  }, [commit]);

  const addFiveSeconds = useCallback(() => {
    commit((prev) => {
      const now = Date.now();
      const left = computeRemainingMs(prev.timer, now);
      const nextRemaining = left + 5000;
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

  const incrementHit = useCallback(() => {
    const nextHits = auctionState.hits + 1;
    const justReachedTarget = nextHits === auctionState.bidTarget;
    commit((prev) => ({
      ...prev,
      hits: prev.hits + 1,
      timer:
        justReachedTarget && prev.timer.isRunning
          ? {
              ...prev.timer,
              remainingMs: computeRemainingMs(prev.timer),
              isRunning: false,
              startedAt: null,
            }
          : prev.timer,
    }));
    triggerCue(justReachedTarget ? 'targetHit' : 'bidHit');
  }, [auctionState.bidTarget, auctionState.hits, commit, triggerCue]);

  const decrementHit = useCallback(() => {
    commit((prev) => ({
      ...prev,
      hits: Math.max(0, prev.hits - 1),
    }));
  }, [commit]);

  const setOutcome = useCallback(
    (outcome: AuctionOutcome) => {
      if (outcome === auctionState.outcome) return;

      const activeTeamId = winningTeam?.id ?? null;
      const scoreUpdates: { teamId: string; delta: number }[] = [];

      // 1. Revertir cualquier puntaje previamente aplicado en esta ronda
      if (activeTeamId && auctionState.awardedPoints !== 0) {
        scoreUpdates.push({ teamId: activeTeamId, delta: -auctionState.awardedPoints });
      }
      for (const bonusId of auctionState.failedBonusTeamIds) {
        scoreUpdates.push({ teamId: bonusId, delta: -AUCTION_FAIL_BONUS_OTHER_TEAMS });
      }

      // 2. Aplicar el nuevo veredicto:
      //    - 'won': +rewardPoints al equipo activo
      //    - 'failed': 0 al equipo activo y +10 pts a TODOS los demás equipos
      let nextAwarded = 0;
      let nextFailedBonusIds: string[] = [];

      if (outcome === 'won' && activeTeamId) {
        nextAwarded = auctionState.rewardPoints;
        scoreUpdates.push({ teamId: activeTeamId, delta: nextAwarded });
      } else if (outcome === 'failed') {
        nextFailedBonusIds = state.teams
          .filter((tItem) => tItem.id !== activeTeamId)
          .map((tItem) => tItem.id);
        for (const otherId of nextFailedBonusIds) {
          scoreUpdates.push({ teamId: otherId, delta: AUCTION_FAIL_BONUS_OTHER_TEAMS });
        }
      }

      commit((prev) => ({
        ...prev,
        outcome,
        awardedPoints: nextAwarded,
        failedBonusTeamIds: nextFailedBonusIds,
        timer: prev.timer.isRunning
          ? {
              ...prev.timer,
              remainingMs: computeRemainingMs(prev.timer),
              isRunning: false,
              startedAt: null,
            }
          : prev.timer,
      }));

      if (scoreUpdates.length > 0) {
        adjustMultipleTeamScores(scoreUpdates, { silent: true });
      }

      if (outcome === 'won') triggerCue('targetHit');
      else if (outcome === 'failed') triggerCue('miss');
    },
    [
      adjustMultipleTeamScores,
      auctionState.awardedPoints,
      auctionState.failedBonusTeamIds,
      auctionState.outcome,
      auctionState.rewardPoints,
      commit,
      state.teams,
      triggerCue,
      winningTeam,
    ]
  );

  const resetRound = useCallback(() => {
    commit((prev) => ({
      ...prev,
      hits: 0,
      outcome: 'pending',
      awardedPoints: 0,
      failedBonusTeamIds: [],
      timer: createTimerState(AUCTION_DEFAULT_SECONDS),
    }));
  }, [commit]);

  return {
    auctionState,
    winningTeam,
    activeCategory,
    unusedCategoriesCount,
    remainingMs,
    addCategory,
    updateCategory,
    deleteCategory,
    loadSampleCategories,
    selectCategory,
    selectRandomCategory,
    adjustBid,
    setBidTarget,
    setWinningTeam,
    setRewardPoints,
    startTimer,
    pauseTimer,
    resetTimer,
    addFiveSeconds,
    incrementHit,
    decrementHit,
    setOutcome,
    resetRound,
  };
}
