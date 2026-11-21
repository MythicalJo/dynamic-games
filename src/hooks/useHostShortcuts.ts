import { useCallback, useEffect, useRef, useState } from 'react';
import { useShow } from '../context/ShowContext';
import { computeRemainingMs, createTimerState } from '../lib/timer';
import {
  createDefaultTeamSession,
  createDefaultTimerState,
  FAST_MONEY_DEFAULT_SECONDS,
  FAST_MONEY_MODULE_ID,
  getLiveRemainingMs,
  normalizeFastMoneyState,
} from '../types/fastMoney';
import {
  AUCTION_DEFAULT_SECONDS,
  CONFIDENCE_AUCTION_MODULE_ID,
  normalizeConfidenceAuctionState,
} from '../types/confidenceAuction';
import {
  MENTAL_SYNC_DEFAULT_SECONDS,
  MENTAL_SYNC_MODULE_ID,
  normalizeMentalSyncState,
} from '../types/mentalSync';
import {
  normalizePolygraphState,
  POLYGRAPH_DEFAULT_SECONDS,
  POLYGRAPH_MODULE_ID,
} from '../types/polygraph';

export function useHostShortcuts() {
  const { state, setDisplayMode, setModuleData, triggerCue, t } = useShow();
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const toggleActiveTimer = useCallback(() => {
    const firstTeamId = state.teams[0]?.id ?? null;

    switch (state.activeModuleId) {
      case FAST_MONEY_MODULE_ID: {
        const fm = normalizeFastMoneyState(state.moduleData[FAST_MONEY_MODULE_ID], firstTeamId);
        if (fm.timer.isRunning) {
          setModuleData(FAST_MONEY_MODULE_ID, {
            ...fm,
            timer: {
              ...fm.timer,
              remainingMs: getLiveRemainingMs(fm.timer),
              isRunning: false,
              startedAt: null,
            },
          });
          flashNotice(t.shortcuts.fmPaused);
        } else {
          const left = getLiveRemainingMs(fm.timer);
          setModuleData(FAST_MONEY_MODULE_ID, {
            ...fm,
            phase: 'play',
            timer: {
              ...fm.timer,
              remainingMs: left <= 0 ? FAST_MONEY_DEFAULT_SECONDS * 1000 : left,
              isRunning: true,
              startedAt: Date.now(),
            },
          });
          flashNotice(t.shortcuts.fmStarted);
        }
        return;
      }

      case CONFIDENCE_AUCTION_MODULE_ID: {
        const auction = normalizeConfidenceAuctionState(
          state.moduleData[CONFIDENCE_AUCTION_MODULE_ID],
          firstTeamId
        );
        if (auction.timer.isRunning) {
          setModuleData(CONFIDENCE_AUCTION_MODULE_ID, {
            ...auction,
            timer: {
              ...auction.timer,
              remainingMs: computeRemainingMs(auction.timer),
              isRunning: false,
              startedAt: null,
            },
          });
          flashNotice(t.shortcuts.auctionPaused);
        } else {
          const left = computeRemainingMs(auction.timer);
          setModuleData(CONFIDENCE_AUCTION_MODULE_ID, {
            ...auction,
            timer: {
              ...auction.timer,
              remainingMs: left <= 0 ? AUCTION_DEFAULT_SECONDS * 1000 : left,
              isRunning: true,
              startedAt: Date.now(),
            },
          });
          flashNotice(t.shortcuts.auctionStarted);
        }
        return;
      }

      case MENTAL_SYNC_MODULE_ID: {
        const ms = normalizeMentalSyncState(state.moduleData[MENTAL_SYNC_MODULE_ID], firstTeamId);
        if (ms.timer.isRunning) {
          setModuleData(MENTAL_SYNC_MODULE_ID, {
            ...ms,
            timer: {
              ...ms.timer,
              remainingMs: computeRemainingMs(ms.timer),
              isRunning: false,
              startedAt: null,
            },
          });
          flashNotice(t.shortcuts.syncPaused);
        } else {
          const left = computeRemainingMs(ms.timer);
          setModuleData(MENTAL_SYNC_MODULE_ID, {
            ...ms,
            timerEnabled: true,
            timer: {
              ...ms.timer,
              remainingMs: left <= 0 ? MENTAL_SYNC_DEFAULT_SECONDS * 1000 : left,
              isRunning: true,
              startedAt: Date.now(),
            },
          });
          flashNotice(t.shortcuts.syncStarted);
        }
        return;
      }

      case POLYGRAPH_MODULE_ID: {
        const poly = normalizePolygraphState(state.moduleData[POLYGRAPH_MODULE_ID], firstTeamId);
        if (poly.timer.isRunning) {
          setModuleData(POLYGRAPH_MODULE_ID, {
            ...poly,
            timer: {
              ...poly.timer,
              remainingMs: computeRemainingMs(poly.timer),
              isRunning: false,
              startedAt: null,
            },
          });
          flashNotice(t.shortcuts.polyPaused);
        } else {
          const left = computeRemainingMs(poly.timer);
          setModuleData(POLYGRAPH_MODULE_ID, {
            ...poly,
            timer: {
              ...poly.timer,
              remainingMs: left <= 0 ? POLYGRAPH_DEFAULT_SECONDS * 1000 : left,
              isRunning: true,
              startedAt: Date.now(),
            },
          });
          flashNotice(t.shortcuts.polyStarted);
        }
        return;
      }
    }
  }, [flashNotice, setModuleData, state.activeModuleId, state.moduleData, state.teams, t.shortcuts]);

  const resetActiveTimer = useCallback(() => {
    const firstTeamId = state.teams[0]?.id ?? null;

    switch (state.activeModuleId) {
      case FAST_MONEY_MODULE_ID: {
        const fm = normalizeFastMoneyState(state.moduleData[FAST_MONEY_MODULE_ID], firstTeamId);
        setModuleData(FAST_MONEY_MODULE_ID, { ...fm, timer: createDefaultTimerState() });
        flashNotice(t.shortcuts.fmReset);
        return;
      }
      case CONFIDENCE_AUCTION_MODULE_ID: {
        const auction = normalizeConfidenceAuctionState(
          state.moduleData[CONFIDENCE_AUCTION_MODULE_ID],
          firstTeamId
        );
        setModuleData(CONFIDENCE_AUCTION_MODULE_ID, {
          ...auction,
          timer: createTimerState(AUCTION_DEFAULT_SECONDS),
        });
        flashNotice(t.shortcuts.auctionReset);
        return;
      }
      case MENTAL_SYNC_MODULE_ID: {
        const ms = normalizeMentalSyncState(state.moduleData[MENTAL_SYNC_MODULE_ID], firstTeamId);
        setModuleData(MENTAL_SYNC_MODULE_ID, {
          ...ms,
          timer: createTimerState(MENTAL_SYNC_DEFAULT_SECONDS),
        });
        flashNotice(t.shortcuts.syncReset);
        return;
      }
      case POLYGRAPH_MODULE_ID: {
        const poly = normalizePolygraphState(state.moduleData[POLYGRAPH_MODULE_ID], firstTeamId);
        setModuleData(POLYGRAPH_MODULE_ID, {
          ...poly,
          timer: createTimerState(POLYGRAPH_DEFAULT_SECONDS),
        });
        flashNotice(t.shortcuts.polyReset);
        return;
      }
    }
  }, [flashNotice, setModuleData, state.activeModuleId, state.moduleData, state.teams, t.shortcuts]);

  const quickRevealFastMoneyRow = useCallback(
    (rowIndex: number) => {
      const firstTeamId = state.teams[0]?.id ?? null;
      const fm = normalizeFastMoneyState(state.moduleData[FAST_MONEY_MODULE_ID], firstTeamId);
      if (fm.phase !== 'reveal') {
        flashNotice('Pasa a Revelación 1 o 2 para revelar con 1–5');
        return;
      }
      const teamId =
        fm.selectedTeamId && state.teams.some((tItem) => tItem.id === fm.selectedTeamId)
          ? fm.selectedTeamId
          : firstTeamId;
      if (!teamId) return;

      const session = fm.sessions[teamId] ?? createDefaultTeamSession(true);
      const round = session.rounds[fm.activeRound];
      const slot = round.slots[rowIndex];
      if (!slot) return;

      let nextGuessRevealed = slot.guessRevealed;
      let nextActualRevealed = slot.actualRevealed;
      let cue: 'cardFlip' | 'reveal' | null = null;
      let label = '';

      if (!slot.guessRevealed) {
        nextGuessRevealed = true;
        cue = 'cardFlip';
        label = t.shortcuts.rowGuessRevealed(rowIndex + 1);
      } else if (!slot.actualRevealed) {
        nextActualRevealed = true;
        cue = 'reveal';
        label = t.shortcuts.rowActualRevealed(rowIndex + 1);
      } else {
        label = t.shortcuts.rowAlreadyRevealed(rowIndex + 1);
      }

      setModuleData(FAST_MONEY_MODULE_ID, {
        ...fm,
        selectedTeamId: teamId,
        phase: 'reveal',
        timer: fm.timer.isRunning
          ? {
              ...fm.timer,
              remainingMs: getLiveRemainingMs(fm.timer),
              isRunning: false,
              startedAt: null,
            }
          : fm.timer,
        sessions: {
          ...fm.sessions,
          [teamId]: {
            ...session,
            rounds: {
              ...session.rounds,
              [fm.activeRound]: {
                ...round,
                slots: round.slots.map((s, idx) =>
                  idx === rowIndex
                    ? {
                        ...s,
                        guessRevealed: nextGuessRevealed,
                        actualRevealed: nextActualRevealed,
                      }
                    : s
                ),
              },
            },
          },
        },
      });

      if (cue) triggerCue(cue);
      flashNotice(label);
    },
    [flashNotice, setModuleData, state.moduleData, state.teams, t.shortcuts, triggerCue]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isEditable || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.shiftKey) {
        if (e.code === 'Digit1') {
          e.preventDefault();
          setDisplayMode('lobby');
          flashNotice(t.shortcuts.switchedLobby);
        } else if (e.code === 'Digit2') {
          e.preventDefault();
          setDisplayMode('leaderboard');
          flashNotice(t.shortcuts.switchedLeaderboard);
        } else if (e.code === 'Digit3') {
          e.preventDefault();
          setDisplayMode('game');
          flashNotice(t.shortcuts.switchedGame);
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (target instanceof HTMLButtonElement) {
          target.blur();
        }
        toggleActiveTimer();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetActiveTimer();
        return;
      }

      if (
        state.activeModuleId === FAST_MONEY_MODULE_ID &&
        (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5')
      ) {
        e.preventDefault();
        quickRevealFastMoneyRow(Number(e.key) - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    flashNotice,
    quickRevealFastMoneyRow,
    resetActiveTimer,
    setDisplayMode,
    state.activeModuleId,
    t.shortcuts,
    toggleActiveTimer,
  ]);

  return { shortcutNotice: notice };
}
