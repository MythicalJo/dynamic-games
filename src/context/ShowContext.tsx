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
  type MusicControlPayload,
  type PreparedQuestion,
  type ScoreFlash,
  type ShowState,
  type SoundCue,
  type Team,
  type TeamAccent,
  type ThemeId,
} from '../types/show';

interface StoredMusicTrack {
  id: string;
  name: string;
  mimeType: string;
  buffer: ArrayBuffer;
}

export interface MusicTrackSummary {
  id: string;
  name: string;
}

interface ShowContextValue {
  state: ShowState;
  role: ClientRole;
  transport: SyncTransport;
  connectedDisplays: number;
  connectedHosts: number;
  displayAudioReady: boolean;

  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;

  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;

  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  toggleAudioMuted: () => void;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notifyAudioUnlocked: () => void;

  // Custom Background Music (synced via BroadcastChannel, never stored in localStorage)
  musicTracks: MusicTrackSummary[];
  musicControl: MusicControlPayload;
  addMusicFiles: (files: FileList | File[]) => Promise<void>;
  selectMusicTrack: (trackId: string) => void;
  removeMusicTrack: (trackId: string) => void;
  toggleMusicPlay: () => void;
  setMusicLoop: (loop: boolean) => void;
  setMusicVolume: (volume: number) => void;
  resumeDisplayMusic: () => void;

  recentFlashes: ScoreFlash[];

  setDisplayMode: (mode: DisplayMode) => void;
  setActiveModuleId: (moduleId: string) => void;
  updateEventMeta: (patch: Partial<EventMeta>) => void;

  addTeam: (input: { name: string; playerA: string; playerB: string; score?: number; accent?: TeamAccent }) => void;
  updateTeam: (id: string, patch: Partial<Omit<Team, 'id'>>) => void;
  deleteTeam: (id: string) => void;
  adjustTeamScore: (id: string, delta: number, options?: { silent?: boolean }) => void;
  resetAllScores: () => void;

  addQuestion: (input: Omit<PreparedQuestion, 'id'>) => string;
  updateQuestion: (id: string, patch: Partial<Omit<PreparedQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;

  updateStageState: (patch: Partial<ActiveStageState>) => void;
  triggerCue: (cue: SoundCue) => void;

  setModuleData: (moduleId: string, data: unknown) => void;

  exportEventJson: () => string;
  importEventJson: (jsonText: string) => { ok: true } | { ok: false; error: string };
  loadDemoData: () => void;
  resetAllData: () => void;
}

const DEFAULT_MUSIC_CONTROL: MusicControlPayload = {
  trackId: null,
  trackName: null,
  isPlaying: false,
  loop: true,
  volume: 0.25,
};

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

  // Custom Background Music state (in-memory only, transferred via BroadcastChannel)
  const [musicTracks, setMusicTracks] = useState<MusicTrackSummary[]>([]);
  const [musicControl, setMusicControl] = useState<MusicControlPayload>(DEFAULT_MUSIC_CONTROL);

  const musicBuffersRef = useRef<Map<string, StoredMusicTrack>>(new Map());
  const musicControlRef = useRef<MusicControlPayload>(DEFAULT_MUSIC_CONTROL);
  musicControlRef.current = musicControl;

  // Dedicated audio player element (plays on /display; optional fallback on /host when no display is open)
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);

  const stateRef = useRef<ShowState>(state);
  stateRef.current = state;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const connectedDisplaysRef = useRef<number>(0);
  const syncRef = useRef<ShowSyncClient | null>(null);

  const ensureAudioElement = useCallback((): HTMLAudioElement => {
    if (!audioElRef.current) {
      const el = new Audio();
      el.preload = 'auto';
      audioElRef.current = el;
    }
    return audioElRef.current;
  }, []);

  const loadTrackIntoAudioElement = useCallback(
    (track: { id: string; mimeType: string; buffer: ArrayBuffer }, control: MusicControlPayload, shouldPlayHere: boolean) => {
      const el = ensureAudioElement();
      if (loadedTrackIdRef.current !== track.id) {
        if (audioObjectUrlRef.current) {
          URL.revokeObjectURL(audioObjectUrlRef.current);
          audioObjectUrlRef.current = null;
        }
        const blob = new Blob([track.buffer], { type: track.mimeType || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        audioObjectUrlRef.current = url;
        loadedTrackIdRef.current = track.id;
        el.src = url;
      }

      el.loop = control.loop;
      el.volume = Math.max(0, Math.min(1, control.volume));
      el.muted = stateRef.current.audioMuted || !soundEnabledRef.current;

      if (shouldPlayHere && control.isPlaying) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    },
    [ensureAudioElement]
  );

  const applyControlToAudioElement = useCallback(
    (control: MusicControlPayload, shouldPlayHere: boolean) => {
      const el = audioElRef.current;
      if (!el) return;
      el.loop = control.loop;
      el.volume = Math.max(0, Math.min(1, control.volume));
      el.muted = stateRef.current.audioMuted || !soundEnabledRef.current;

      if (!control.trackId || !shouldPlayHere || !control.isPlaying) {
        el.pause();
      } else {
        el.play().catch(() => {});
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.src = '';
        audioElRef.current = null;
      }
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
    };
  }, []);

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
        // ignorar
      }
    },
    [role]
  );

  const notifyAudioUnlocked = useCallback(() => {
    syncRef.current?.sendHeartbeat();
  }, []);

  const resumeDisplayMusic = useCallback(() => {
    if (role !== 'display') return;
    const el = audioElRef.current;
    const ctrl = musicControlRef.current;
    if (el && ctrl.trackId && ctrl.isPlaying) {
      el.muted = stateRef.current.audioMuted || !soundEnabledRef.current;
      el.volume = Math.max(0, Math.min(1, ctrl.volume));
      el.loop = ctrl.loop;
      el.play().catch(() => {});
    }
  }, [role]);

  const sendCurrentMusicToDisplays = useCallback(() => {
    if (role !== 'host') return;
    const ctrl = musicControlRef.current;
    if (!ctrl.trackId) return;
    const stored = musicBuffersRef.current.get(ctrl.trackId);
    if (!stored) return;
    syncRef.current?.broadcastMusicTrack({
      trackId: stored.id,
      name: stored.name,
      mimeType: stored.mimeType,
      buffer: stored.buffer,
      control: ctrl,
    });
  }, [role]);

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
          sendCurrentMusicToDisplays();
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
      onMusicTrackReceived: (incoming) => {
        if (role !== 'display') return;
        setMusicControl(incoming.control);
        musicControlRef.current = incoming.control;
        loadTrackIntoAudioElement(
          { id: incoming.trackId, mimeType: incoming.mimeType, buffer: incoming.buffer },
          incoming.control,
          true
        );
      },
      onMusicControlReceived: (incomingControl) => {
        if (role !== 'display') return;
        setMusicControl(incomingControl);
        musicControlRef.current = incomingControl;
        applyControlToAudioElement(incomingControl, true);
      },
      onMusicRequested: () => {
        if (role === 'host') {
          sendCurrentMusicToDisplays();
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
  }, [
    role,
    pushFlash,
    sendCurrentMusicToDisplays,
    loadTrackIntoAudioElement,
    applyControlToAudioElement,
  ]);

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

  connectedDisplaysRef.current = connectedDisplays;

  // Keep audio element mute/playback synced whenever audioMuted, soundEnabled, or connectedDisplays changes
  useEffect(() => {
    const shouldPlayHere =
      role === 'display' ? true : soundEnabled && connectedDisplays === 0;
    applyControlToAudioElement(musicControlRef.current, shouldPlayHere);
  }, [role, state.audioMuted, soundEnabled, connectedDisplays, applyControlToAudioElement]);

  // --- Custom Background Music Controls (Host) ---

  const addMusicFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const added: StoredMusicTrack[] = [];
      for (const file of list) {
        try {
          const buffer = await file.arrayBuffer();
          const id = createId('bgm');
          const track: StoredMusicTrack = {
            id,
            name: file.name.replace(/\.[^/.]+$/, ''),
            mimeType: file.type || 'audio/mpeg',
            buffer,
          };
          musicBuffersRef.current.set(id, track);
          added.push(track);
        } catch {
          // Omitir archivo ilegible
        }
      }

      if (added.length === 0) return;

      setMusicTracks((prev) => [
        ...prev,
        ...added.map((tr) => ({ id: tr.id, name: tr.name })),
      ]);

      // Auto-select first added track if none is selected yet
      if (!musicControlRef.current.trackId) {
        const first = added[0];
        const nextCtrl: MusicControlPayload = {
          ...musicControlRef.current,
          trackId: first.id,
          trackName: first.name,
        };
        setMusicControl(nextCtrl);
        musicControlRef.current = nextCtrl;

        const shouldPlayLocal =
          role === 'display' || (soundEnabledRef.current && connectedDisplaysRef.current === 0);
        loadTrackIntoAudioElement(first, nextCtrl, shouldPlayLocal);

        syncRef.current?.broadcastMusicTrack({
          trackId: first.id,
          name: first.name,
          mimeType: first.mimeType,
          buffer: first.buffer,
          control: nextCtrl,
        });
      }
    },
    [loadTrackIntoAudioElement, role]
  );

  const selectMusicTrack = useCallback(
    (trackId: string) => {
      const stored = musicBuffersRef.current.get(trackId);
      if (!stored) return;

      const nextCtrl: MusicControlPayload = {
        ...musicControlRef.current,
        trackId: stored.id,
        trackName: stored.name,
      };
      setMusicControl(nextCtrl);
      musicControlRef.current = nextCtrl;

      const shouldPlayLocal =
        role === 'display' || (soundEnabledRef.current && connectedDisplaysRef.current === 0);
      loadTrackIntoAudioElement(stored, nextCtrl, shouldPlayLocal);

      syncRef.current?.broadcastMusicTrack({
        trackId: stored.id,
        name: stored.name,
        mimeType: stored.mimeType,
        buffer: stored.buffer,
        control: nextCtrl,
      });
    },
    [loadTrackIntoAudioElement, role]
  );

  const removeMusicTrack = useCallback(
    (trackId: string) => {
      musicBuffersRef.current.delete(trackId);
      setMusicTracks((prev) => {
        const remaining = prev.filter((item) => item.id !== trackId);
        if (musicControlRef.current.trackId === trackId) {
          const fallback = remaining[0] ?? null;
          if (fallback) {
            const stored = musicBuffersRef.current.get(fallback.id);
            const nextCtrl: MusicControlPayload = {
              ...musicControlRef.current,
              trackId: fallback.id,
              trackName: fallback.name,
              isPlaying: false,
            };
            setMusicControl(nextCtrl);
            musicControlRef.current = nextCtrl;
            if (stored) {
              loadTrackIntoAudioElement(stored, nextCtrl, false);
              syncRef.current?.broadcastMusicTrack({
                trackId: stored.id,
                name: stored.name,
                mimeType: stored.mimeType,
                buffer: stored.buffer,
                control: nextCtrl,
              });
            }
          } else {
            const nextCtrl: MusicControlPayload = {
              ...musicControlRef.current,
              trackId: null,
              trackName: null,
              isPlaying: false,
            };
            setMusicControl(nextCtrl);
            musicControlRef.current = nextCtrl;
            applyControlToAudioElement(nextCtrl, false);
            syncRef.current?.broadcastMusicControl(nextCtrl);
          }
        }
        return remaining;
      });
    },
    [applyControlToAudioElement, loadTrackIntoAudioElement]
  );

  const updateMusicControl = useCallback(
    (patch: Partial<MusicControlPayload>) => {
      const nextCtrl: MusicControlPayload = {
        ...musicControlRef.current,
        ...patch,
      };
      setMusicControl(nextCtrl);
      musicControlRef.current = nextCtrl;

      const shouldPlayLocal =
        role === 'display' || (soundEnabledRef.current && connectedDisplaysRef.current === 0);
      if (nextCtrl.trackId && loadedTrackIdRef.current !== nextCtrl.trackId) {
        const stored = musicBuffersRef.current.get(nextCtrl.trackId);
        if (stored) {
          loadTrackIntoAudioElement(stored, nextCtrl, shouldPlayLocal);
        }
      } else {
        applyControlToAudioElement(nextCtrl, shouldPlayLocal);
      }

      syncRef.current?.broadcastMusicControl(nextCtrl);
    },
    [applyControlToAudioElement, loadTrackIntoAudioElement, role]
  );

  const toggleMusicPlay = useCallback(() => {
    if (!musicControlRef.current.trackId) return;
    updateMusicControl({ isPlaying: !musicControlRef.current.isPlaying });
  }, [updateMusicControl]);

  const setMusicLoop = useCallback(
    (loop: boolean) => {
      updateMusicControl({ loop });
    },
    [updateMusicControl]
  );

  const setMusicVolume = useCallback(
    (volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      updateMusicControl({ volume: clamped });
    },
    [updateMusicControl]
  );

  // --- Core Show State Mutations ---

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

  const setTheme = useCallback(
    (theme: ThemeId) => {
      commitState((prev) => ({ ...prev, theme }));
    },
    [commitState]
  );

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

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
          name: input.name.trim().toUpperCase() || `EQUIPO ${prev.teams.length + 1}`,
          playerA: input.playerA.trim() || 'Jugador A',
          playerB: input.playerB.trim() || 'Jugador B',
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
        teams: prev.teams.map((tItem) =>
          tItem.id === id
            ? {
                ...tItem,
                ...patch,
                name: patch.name !== undefined ? patch.name.trim().toUpperCase() : tItem.name,
                playerA: patch.playerA !== undefined ? patch.playerA.trim() : tItem.playerA,
                playerB: patch.playerB !== undefined ? patch.playerB.trim() : tItem.playerB,
                score:
                  patch.score !== undefined && Number.isFinite(patch.score)
                    ? Math.round(patch.score)
                    : tItem.score,
              }
            : tItem
        ),
      }));
    },
    [commitState]
  );

  const deleteTeam = useCallback(
    (id: string) => {
      commitState((prev) => ({
        ...prev,
        teams: prev.teams.filter((tItem) => tItem.id !== id),
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
        teams: prev.teams.map((tItem) =>
          tItem.id === id ? { ...tItem, score: tItem.score + cleanDelta } : tItem
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
      teams: prev.teams.map((tItem) => ({ ...tItem, score: 0 })),
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
          points: Number.isFinite(input.points) ? Math.round(input.points) : 20,
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
        return {
          ok: false,
          error: 'Formato JSON inválido. Revisa el archivo e inténtalo de nuevo.',
        };
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
      theme: state.theme,
      setTheme,
      audioMuted: state.audioMuted,
      setAudioMuted,
      toggleAudioMuted,
      soundEnabled,
      setSoundEnabled: handleSetSoundEnabled,
      notifyAudioUnlocked,
      musicTracks,
      musicControl,
      addMusicFiles,
      selectMusicTrack,
      removeMusicTrack,
      toggleMusicPlay,
      setMusicLoop,
      setMusicVolume,
      resumeDisplayMusic,
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
      setTheme,
      setAudioMuted,
      toggleAudioMuted,
      soundEnabled,
      handleSetSoundEnabled,
      notifyAudioUnlocked,
      musicTracks,
      musicControl,
      addMusicFiles,
      selectMusicTrack,
      removeMusicTrack,
      toggleMusicPlay,
      setMusicLoop,
      setMusicVolume,
      resumeDisplayMusic,
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
