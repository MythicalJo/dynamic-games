import { useEffect, useRef, useState } from 'react';
import type { ClientRole, SoundCue } from '../types/show';

export interface SyncedTimerState {
  totalSeconds: number;
  remainingMs: number;
  isRunning: boolean;
  startedAt: number | null;
}

export function createTimerState(seconds: number): SyncedTimerState {
  return {
    totalSeconds: seconds,
    remainingMs: seconds * 1000,
    isRunning: false,
    startedAt: null,
  };
}

export function normalizeTimerState(raw: unknown, defaultSeconds: number): SyncedTimerState {
  if (!raw || typeof raw !== 'object') {
    return createTimerState(defaultSeconds);
  }
  const t = raw as Partial<SyncedTimerState>;
  return {
    totalSeconds:
      typeof t.totalSeconds === 'number' && t.totalSeconds > 0 ? t.totalSeconds : defaultSeconds,
    remainingMs:
      typeof t.remainingMs === 'number' && t.remainingMs >= 0
        ? t.remainingMs
        : defaultSeconds * 1000,
    isRunning: Boolean(t.isRunning),
    startedAt: typeof t.startedAt === 'number' ? t.startedAt : null,
  };
}

export function computeRemainingMs(timer: SyncedTimerState, now = Date.now()): number {
  if (!timer.isRunning || timer.startedAt === null) {
    return Math.max(0, timer.remainingMs);
  }
  return Math.max(0, timer.remainingMs - (now - timer.startedAt));
}

export function formatBroadcastTimer(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe === 0) return '00';
  if (safe < 10000) return (safe / 1000).toFixed(1);
  return String(Math.ceil(safe / 1000)).padStart(2, '0');
}

interface UseSyncedTimerOptions {
  timer: SyncedTimerState;
  role: ClientRole;
  triggerCue: (cue: SoundCue) => void;
  onExpire: () => void;
}

export function useSyncedTimer({ timer, role, triggerCue, onExpire }: UseSyncedTimerOptions): number {
  const [remainingMs, setRemainingMs] = useState<number>(() => computeRemainingMs(timer));
  const lastSecRef = useRef<number>(Math.ceil(computeRemainingMs(timer) / 1000));
  const expiredRef = useRef<boolean>(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const initial = computeRemainingMs(timer);
    setRemainingMs(initial);
    lastSecRef.current = Math.ceil(initial / 1000);
    if (initial > 0) {
      expiredRef.current = false;
    }

    if (!timer.isRunning) return;

    const id = window.setInterval(() => {
      const current = computeRemainingMs(timer);
      setRemainingMs(current);

      const wholeSec = Math.ceil(current / 1000);
      if (role === 'host' && wholeSec !== lastSecRef.current) {
        lastSecRef.current = wholeSec;
        if (wholeSec > 0 && wholeSec <= 5) {
          // Alterna cada segundo entre "tick" agudo (5, 3, 1) y "tock" grave (4, 2)
          triggerCue(wholeSec % 2 === 1 ? 'timerTick' : 'timerTock');
        }
      }

      if (current <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        if (role === 'host') {
          triggerCue('timeUp');
          onExpireRef.current();
        }
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [timer, role, triggerCue]);

  return remainingMs;
}
