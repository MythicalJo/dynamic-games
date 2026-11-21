import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBlankShowState,
  createId,
  createInitialShowState,
  parseImportedShowState,
} from '../lib/defaults';
import { isAudioUnlocked, playBroadcastCue } from '../lib/sound';
import { TRANSLATIONS, type Translations } from '../lib/i18n';
import { loadPersistedState, ShowSyncClient, type PeerInfo, type SyncTransport } from '../lib/sync';
import {
  ACCENT_ORDER,
  type ActiveStageState,
  type ClientRole,
  type DisplayMode,
  type EventMeta,
  type Language,
  type PreparedQuestion,
  type ScoreFlash,
  type ShowState,
  type SoundCue,
  type Team,
  type TeamAccent,
} from '../types/show';

interface ShowContextValue {
  state: ShowState;
  role: ClientRole;
  transport: SyncTransport;
  connectedDisplays: number;
  connectedHosts: number;
  displayAudioReady: boolean;

  /** Synchronized UI & Display language ('es' | 'en') */
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;

  /** Global synchronized mute (mutes /display and /host) */
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  toggleAudioMuted: () => void;

  /** Local audio preview toggle (defaults ON for /display, OFF for /host to prevent echo) */
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notifyAudioUnlocked: () => void;

  recentFlashes: ScoreFlash[];

  // Display state controls
  setDisplayMode: (mode: DisplayMode) => void;
  setActiveModuleId: (moduleId: string) => void;

  // Event meta
  updateEventMeta: (patch: Partial<EventMeta>) => void;

  // Team CRUD & Scoring
  addTeam: (input: { name: string; playerA: string; playerB: string; score?: number; accent?: TeamAccent }) => void;
  updateTeam: (id: string, patch: Partial<Omit<Team, 'id'>>) => void;
  deleteTeam: (id: string) => void;
  adjustTeamScore: (id: string, delta: number, options?: { silent?: boolean }) => void;
  resetAllScores: () => void;

  // Question Bank CRUD
  addQuestion: (input: Omit<PreparedQuestion, 'id'>) => string;
  updateQuestion: (id: string, patch: Partial<Omit<PreparedQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;

  // Active Game Stage controls
  updateStageState: (patch: Partial<ActiveStageState>) => void;
  triggerCue: (cue: SoundCue) => void;

  // Extensible module state setter
  setModuleData: (moduleId: string, data: unknown) => void;

  // Data persistence & JSON Export / Import
  exportEventJson: () => string;
  importEventJson: (jsonText: string) => { ok: true } | { ok: false; error: string };
  loadDemoData: () => void;
  resetAllData: () => void;
}

const ShowContext = createContext<ShowContextValue | null>(null);

interface ShowProviderProps {
  role: ClientRole;
  children: React.ReactNode;
}

export function ShowProvider({ role, children }: ShowProviderProps) {
  const [state, setState] = useState<ShowState>(() => loadPersistedState());
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [transport, setTransport] = useState<SyncTransport>('broadcast-channel');
  const [recentFlashes, setRecentFlashes] = useState<ScoreFlash[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(`puntos_rapidos_sound_${role}`);
      if (saved === null) return role === 'display';
      return saved === 'true';
    } catch {
      return role === 'display';
    }
  });

  const stateRef = useRef<ShowState>(state);
  stateRef.current = state;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const syncRef = useRef<ShowSyncClient | null>(null);

  const pushFlash = useCallback((flash: ScoreFlash) => {
    setRecentFlashes((prev) => [...prev.filter((f) => f.teamId !== flash.teamId), flash]);
    window.setTimeout(() => {
      setRecentFlashes((prev) => prev.filter((f) => f.id !== flash.id));
    }, 2400);
  }, []);

  const handleSetSoundEnabled = useCallback(
    (enabled: boolean) => {
      setSoundEnabled(enabled);
      try {
        window.localStorage.setItem(`puntos_rapidos_sound_${role}`, String(enabled));
      } catch {
        // ignore
      }
    },
    [role]
  );

  const notifyAudioUnlocked = useCallback(() => {
    syncRef.current?.sendHeartbeat();
  }, []);

  useEffect(() => {
    const client = new ShowSyncClient({
      role,
      getAudioUnlocked: () => isAudioUnlocked(),
      onStateReceived: (incoming, fromRole) => {
        setState((current) => {
          if (role === 'display' && fromRole === 'host') {
            return incoming;
          }
          if (incoming.updatedAt < current.updatedAt) {
            return current;
          }
          return incoming;
        });
      },
      onStateRequested: () => {
        if (role === 'host') {
          client.broadcastState(stateRef.current);
        }
      },
      onScoreFlash: (flash) => {
        pushFlash(flash);
      },
      onSoundCue: (cue) => {
        if (!stateRef.current.audioMuted && soundEnabledRef.current) {
          playBroadcastCue(cue);
        }
      },
      onPeersChanged: (nextPeers) => {
        setPeers(nextPeers);
      },
    });

    syncRef.current = client;
    setTransport(client.transport);

    return () => {
      client.destroy();
      syncRef.current = null;
    };
  }, [role, pushFlash]);

  const commitState = useCallback((updater: (prev: ShowState) => ShowState) => {
    setState((prev) => {
      const next: ShowState = {
        ...updater(prev),
        updatedAt: Math.max(Date.now(), prev.updatedAt + 1),
      };
      stateRef.current = next;
      syncRef.current?.broadcastState(next);
      return next;
    });
  }, []);

  const triggerCue = useCallback((cue: SoundCue) => {
    if (stateRef.current.audioMuted) return;
    if (soundEnabledRef.current) {
      playBroadcastCue(cue);
    }
    syncRef.current?.broadcastSoundCue(cue);
  }, []);

  const setAudioMuted = useCallback(
    (muted: boolean) => {
      commitState((prev) => ({ ...prev, audioMuted: muted }));
    },
    [commitState]
  );

  const toggleAudioMuted = useCallback(() => {
    commitState((prev) => ({ ...prev, audioMuted: !prev.audioMuted }));
  }, [commitState]);

  const setLanguage = useCallback(
    (language: Language) => {
      commitState((prev) => ({ ...prev, language }));
    },
    [commitState]
  );

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      commitState((prev) => ({ ...prev, displayMode: mode }));
      triggerCue('switch');
    },
    [commitState, triggerCue]
  );

  const setActiveModuleId = useCallback(
    (moduleId: string) => {
      commitState((prev) => ({ ...prev, activeModuleId: moduleId }));
    },
    [commitState]
  );

  const updateEventMeta = useCallback(
    (patch: Partial<EventMeta>) => {
      commitState((prev) => ({
        ...prev,
        eventMeta: { ...prev.eventMeta, ...patch },
      }));
    },
    [commitState]
  );

  const addTeam = useCallback(
    (input: { name: string; playerA: string; playerB: string; score?: number; accent?: TeamAccent }) => {
      commitState((prev) => {
        const nextAccent = input.accent ?? ACCENT_ORDER[prev.teams.length % ACCENT_ORDER.length];
        const newTeam: Team = {
          id: createId('team'),
          name: input.name.trim().toUpperCase() || `TEAM ${prev.teams.length + 1}`,
          playerA: input.playerA.trim() || 'Player A',
          playerB: input.playerB.trim() || 'Player B',
          score: typeof input.score === 'number' && Number.isFinite(input.score) ? Math.round(input.score) : 0,
          accent: nextAccent,
        };
        return {
          ...prev,
          teams: [...prev.teams, newTeam],
        };
      });
    },
    [commitState]
  );

  const updateTeam = useCallback(
    (id: string, patch: Partial<Omit<Team, 'id'>>) => {
      commitState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === id
            ? {
                ...t,
                ...patch,
                name: patch.name !== undefined ? patch.name.trim().toUpperCase() : t.name,
                playerA: patch.playerA !== undefined ? patch.playerA.trim() : t.playerA,
                playerB: patch.playerB !== undefined ? patch.playerB.trim() : t.playerB,
                score:
                  patch.score !== undefined && Number.isFinite(patch.score)
                    ? Math.round(patch.score)
                    : t.score,
              }
            : t
        ),
      }));
    },
    [commitState]
  );

  const deleteTeam = useCallback(
    (id: string) => {
      commitState((prev) => ({
        ...prev,
        teams: prev.teams.filter((t) => t.id !== id),
        stageState:
          prev.stageState.spotlightTeamId === id
            ? { ...prev.stageState, spotlightTeamId: null }
            : prev.stageState,
      }));
    },
    [commitState]
  );

  const adjustTeamScore = useCallback(
    (id: string, delta: number, options?: { silent?: boolean }) => {
      const cleanDelta = Math.round(delta);
      if (cleanDelta === 0) return;

      commitState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === id ? { ...t, score: t.score + cleanDelta } : t
        ),
      }));

      const flash: ScoreFlash = {
        id: createId('flash'),
        teamId: id,
        delta: cleanDelta,
        timestamp: Date.now(),
      };
      pushFlash(flash);
      syncRef.current?.broadcastScoreFlash(flash);
      if (!options?.silent) {
        triggerCue(cleanDelta > 0 ? 'scoreUp' : 'scoreDown');
      }
    },
    [commitState, pushFlash, triggerCue]
  );

  const resetAllScores = useCallback(() => {
    commitState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => ({ ...t, score: 0 })),
    }));
  }, [commitState]);

  const addQuestion = useCallback(
    (input: Omit<PreparedQuestion, 'id'>) => {
      const id = createId('q');
      commitState((prev) => {
        const question: PreparedQuestion = {
          id,
          category: input.category.trim().toUpperCase() || 'GENERAL',
          prompt: input.prompt.trim(),
          answer: input.answer.trim(),
          points: Number.isFinite(input.points) ? Math.round(input.points) : 100,
          hostNote: input.hostNote?.trim() || undefined,
        };
        const nextQuestions = [...prev.questions, question];
        return {
          ...prev,
          questions: nextQuestions,
          stageState: {
            ...prev.stageState,
            selectedQuestionId: prev.stageState.selectedQuestionId ?? id,
          },
        };
      });
      return id;
    },
    [commitState]
  );

  const updateQuestion = useCallback(
    (id: string, patch: Partial<Omit<PreparedQuestion, 'id'>>) => {
      commitState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === id
            ? {
                ...q,
                ...patch,
                category:
                  patch.category !== undefined ? patch.category.trim().toUpperCase() : q.category,
                points:
                  patch.points !== undefined && Number.isFinite(patch.points)
                    ? Math.round(patch.points)
                    : q.points,
              }
            : q
        ),
      }));
    },
    [commitState]
  );

  const deleteQuestion = useCallback(
    (id: string) => {
      commitState((prev) => {
        const remaining = prev.questions.filter((q) => q.id !== id);
        return {
          ...prev,
          questions: remaining,
          stageState:
            prev.stageState.selectedQuestionId === id
              ? {
                  ...prev.stageState,
                  selectedQuestionId: remaining[0]?.id ?? null,
                  answerRevealed: false,
                }
              : prev.stageState,
        };
      });
    },
    [commitState]
  );

  const updateStageState = useCallback(
    (patch: Partial<ActiveStageState>) => {
      commitState((prev) => ({
        ...prev,
        stageState: { ...prev.stageState, ...patch },
      }));
      if (patch.answerRevealed === true) {
        triggerCue('reveal');
      }
    },
    [commitState, triggerCue]
  );

  const setModuleData = useCallback(
    (moduleId: string, data: unknown) => {
      commitState((prev) => ({
        ...prev,
        moduleData: {
          ...prev.moduleData,
          [moduleId]: data,
        },
      }));
    },
    [commitState]
  );

  const exportEventJson = useCallback(() => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const importEventJson = useCallback(
    (jsonText: string): { ok: true } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(jsonText) as unknown;
        const result = parseImportedShowState(parsed);
        if (!result.ok) return result;
        commitState(() => result.state);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Invalid JSON syntax. Please check the file and try again.' };
      }
    },
    [commitState]
  );

  const loadDemoData = useCallback(() => {
    commitState(() => createInitialShowState(Date.now()));
  }, [commitState]);

  const resetAllData = useCallback(() => {
    commitState(() => createBlankShowState());
  }, [commitState]);

  const { connectedDisplays, connectedHosts, displayAudioReady } = useMemo(() => {
    let displays = 0;
    let hosts = 0;
    let audioReady = false;
    for (const p of Object.values(peers)) {
      if (p.role === 'display') {
        displays += 1;
        if (p.audioUnlocked) audioReady = true;
      }
      if (p.role === 'host') hosts += 1;
    }
    return {
      connectedDisplays: displays,
      connectedHosts: hosts,
      displayAudioReady: audioReady,
    };
  }, [peers]);

  const t = TRANSLATIONS[state.language];

  const value = useMemo<ShowContextValue>(
    () => ({
      state,
      role,
      transport,
      connectedDisplays,
      connectedHosts,
      displayAudioReady,
      language: state.language,
      setLanguage,
      t,
      audioMuted: state.audioMuted,
      setAudioMuted,
      toggleAudioMuted,
      soundEnabled,
      setSoundEnabled: handleSetSoundEnabled,
      notifyAudioUnlocked,
      recentFlashes,
      setDisplayMode,
      setActiveModuleId,
      updateEventMeta,
      addTeam,
      updateTeam,
      deleteTeam,
      adjustTeamScore,
      resetAllScores,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      updateStageState,
      triggerCue,
      setModuleData,
      exportEventJson,
      importEventJson,
      loadDemoData,
      resetAllData,
    }),
    [
      state,
      role,
      transport,
      connectedDisplays,
      connectedHosts,
      displayAudioReady,
      setLanguage,
      t,
      setAudioMuted,
      toggleAudioMuted,
      soundEnabled,
      handleSetSoundEnabled,
      notifyAudioUnlocked,
      recentFlashes,
      setDisplayMode,
      setActiveModuleId,
      updateEventMeta,
      addTeam,
      updateTeam,
      deleteTeam,
      adjustTeamScore,
      resetAllScores,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      updateStageState,
      triggerCue,
      setModuleData,
      exportEventJson,
      importEventJson,
      loadDemoData,
      resetAllData,
    ]
  );

  return <ShowContext.Provider value={value}>{children}</ShowContext.Provider>;
}

export function useShow(): ShowContextValue {
  const ctx = useContext(ShowContext);
  if (!ctx) {
    throw new Error('useShow must be used inside a ShowProvider');
  }
  return ctx;
}
