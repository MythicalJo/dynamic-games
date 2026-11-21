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
  CONFIDENCE_AUCTION_MODULE_ID,
  normalizeConfidenceAuctionState,
  SAMPLE_AUCTION_CATEGORIES,
  type AuctionCategory,
  type AuctionOutcome,
  type ConfidenceAuctionState,
} from '../../../types/confidenceAuction';

export function useConfidenceAuction() {
  const { state, role, setModuleData, adjustTeamScore, triggerCue } = useShow();
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
    commit((prev) => ({
      ...prev,
      categories: SAMPLE_AUCTION_CATEGORIES.map((c) => ({ ...c })),
      selectedCategoryId: SAMPLE_AUCTION_CATEGORIES[0].id,
      hits: 0,
      outcome: 'pending',
      awardedPoints: 0,
      timer: createTimerState(AUCTION_DEFAULT_SECONDS),
    }));
  }, [commit]);

  // --- Live Controls ---

  const selectCategory = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        selectedCategoryId: id,
        hits: 0,
        outcome: 'pending',
        awardedPoints: 0,
        timer: createTimerState(AUCTION_DEFAULT_SECONDS),
      }));
      triggerCue('switch');
    },
    [commit, triggerCue]
  );

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
      const teamId = winningTeam?.id ?? null;
      const prevAwarded = auctionState.awardedPoints;
      const nextAwarded = outcome === 'won' ? auctionState.rewardPoints : 0;
      const delta = nextAwarded - prevAwarded;

      commit((prev) => ({
        ...prev,
        outcome,
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

      if (outcome === 'won') triggerCue('targetHit');
      else if (outcome === 'failed') triggerCue('miss');
    },
    [adjustTeamScore, auctionState.awardedPoints, auctionState.rewardPoints, commit, triggerCue, winningTeam]
  );

  const resetRound = useCallback(() => {
    commit((prev) => ({
      ...prev,
      hits: 0,
      outcome: 'pending',
      awardedPoints: 0,
      timer: createTimerState(AUCTION_DEFAULT_SECONDS),
    }));
  }, [commit]);

  return {
    auctionState,
    winningTeam,
    activeCategory,
    remainingMs,
    addCategory,
    updateCategory,
    deleteCategory,
    loadSampleCategories,
    selectCategory,
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
