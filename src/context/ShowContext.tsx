import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBlankShowState,
  createId,
  createInitialShowState,
  parseImportedShowState,
} from '../lib/defaults';
import { isAudioUnlocked, playBroadcastCue } from '../lib/sound';
import { TRANSLATIONS, type Translations } from '../lib/i18n';
import {
  getOrCreateDisplayRoomCode,
  loadLastHostRoomCode,
  normalizeRoomCode,
  peerManager,
  type PeerSyncHandlers,
} from '../lib/peerSync';
import { loadPersistedState, ShowSyncClient, type PeerInfo, type SyncTransport } from '../lib/sync';
import {
  ACCENT_ORDER,
  type ActiveStageState,
  type ClientRole,
  type DisplayMode,
  type EventMeta,
  type Language,
  type MusicControlPayload,
  type MusicTrackSummary,
  type PreparedQuestion,
  type RemoteConnectionStatus,
  type ScoreFlash,
  type ShowState,
  type SoundCue,
  type SyncMessage,
  type Team,
  type TeamAccent,
  type ThemeId,
} from '../types/show';

export type { MusicTrackSummary };

interface StoredMusicTrack {
  id: string;
  name: string;
  mimeType: string;
  buffer: ArrayBuffer;
}

interface ShowContextValue {
  state: ShowState;
  role: ClientRole;
  transport: SyncTransport;
  connectedDisplays: number;
  connectedHosts: number;
  localConnectedDisplays: number;
  displayAudioReady: boolean;

  // Cross-Device Remote Control (PeerJS)
  roomCode: string;
  remoteStatus: RemoteConnectionStatus;
  remoteError: string | null;
  remoteConnectedCount: number;
  connectRemoteRoom: (code: string) => void;
  disconnectRemoteRoom: () => void;
  regenerateRoomCode: () => void;

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

  // Custom Background Music (BroadcastChannel ArrayBuffer locally OR loaded directly on /display & controlled remotely via PeerJS)
  musicTracks: MusicTrackSummary[];
  musicControl: MusicControlPayload;
  musicHostedOnDisplay: boolean;
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
  const clientIdRef = useRef<string>(createId(role));

  const [state, setState] = useState<ShowState>(() => loadPersistedState());
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [transport, setTransport] = useState<SyncTransport>('broadcast-channel');
  const [recentFlashes, setRecentFlashes] = useState<ScoreFlash[]>([]);

  // Cross-device PeerJS state
  const [roomCode, setRoomCode] = useState<string>(() =>
    role === 'display' ? getOrCreateDisplayRoomCode() : loadLastHostRoomCode()
  );
  const [remoteStatus, setRemoteStatus] = useState<RemoteConnectionStatus>(
    role === 'display' ? 'connecting' : 'disconnected'
  );
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remoteConnectedCount, setRemoteConnectedCount] = useState<number>(0);
  const [remoteDisplayAudioReady, setRemoteDisplayAudioReady] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(`puntos_rapidos_sound_${role}`);
      if (saved === null) return role === 'display';
      return saved === 'true';
    } catch {
      return role === 'display';
    }
  });

  // Custom Background Music state (in-memory only, never stored in localStorage)
  const [musicTracks, setMusicTracks] = useState<MusicTrackSummary[]>([]);
  const [musicControl, setMusicControl] = useState<MusicControlPayload>(DEFAULT_MUSIC_CONTROL);
  const [musicHostedOnDisplay, setMusicHostedOnDisplay] = useState<boolean>(false);

  const musicBuffersRef = useRef<Map<string, StoredMusicTrack>>(new Map());
  const musicTracksRef = useRef<MusicTrackSummary[]>([]);
  musicTracksRef.current = musicTracks;
  const musicControlRef = useRef<MusicControlPayload>(DEFAULT_MUSIC_CONTROL);
  musicControlRef.current = musicControl;

  // Dedicated audio player element (plays on /display; optional fallback on /host when no display is connected)
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);

  const stateRef = useRef<ShowState>(state);
  stateRef.current = state;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const connectedDisplaysRef = useRef<number>(0);
  const syncRef = useRef<ShowSyncClient | null>(null);
  const [activePeerRoom, setActivePeerRoom] = useState<string>(() =>
    role === 'display' ? getOrCreateDisplayRoomCode() : ''
  );

  const ensureAudioElement = useCallback((): HTMLAudioElement => {
    if (!audioElRef.current) {
      const el = new Audio();
      el.preload = 'auto';
      audioElRef.current = el;
    }
    return audioElRef.current;
  }, []);

  const loadTrackIntoAudioElement = useCallback(
    (
      track: { id: string; mimeType: string; buffer: ArrayBuffer },
      control: MusicControlPayload,
      shouldPlayHere: boolean
    ) => {
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
      if (control.trackId && loadedTrackIdRef.current !== control.trackId) {
        const stored = musicBuffersRef.current.get(control.trackId);
        if (stored) {
          loadTrackIntoAudioElement(stored, control, shouldPlayHere);
          return;
        }
      }

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
    [loadTrackIntoAudioElement]
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

  const sendAllHeartbeats = useCallback(() => {
    syncRef.current?.sendHeartbeat();
    peerManager.send({
      type: 'HEARTBEAT',
      senderId: clientIdRef.current,
      role,
      timestamp: Date.now(),
      audioUnlocked: isAudioUnlocked(),
    });
  }, [role]);

  const notifyAudioUnlocked = useCallback(() => {
    sendAllHeartbeats();
  }, [sendAllHeartbeats]);

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

  const broadcastDisplayMusicCatalog = useCallback(() => {
    if (role !== 'display') return;
    const tracks = musicTracksRef.current;
    const ctrl = musicControlRef.current;
    syncRef.current?.broadcastMusicCatalog(tracks, ctrl);
    peerManager.send({
      type: 'MUSIC_CATALOG',
      senderId: clientIdRef.current,
      tracks,
      control: ctrl,
    });
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

  const handleIncomingState = useCallback(
    (incoming: ShowState, fromRole: ClientRole) => {
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
    [role]
  );

  const handleIncomingMusicControl = useCallback(
    (incomingControl: MusicControlPayload) => {
      setMusicControl(incomingControl);
      musicControlRef.current = incomingControl;
      if (role === 'display') {
        applyControlToAudioElement(incomingControl, true);
      }
    },
    [applyControlToAudioElement, role]
  );

  const handleIncomingMusicRemove = useCallback(
    (trackId: string) => {
      musicBuffersRef.current.delete(trackId);
      setMusicTracks((prev) => {
        const remaining = prev.filter((t) => t.id !== trackId);
        if (musicControlRef.current.trackId === trackId) {
          const fallback = remaining[0] ?? null;
          const nextCtrl: MusicControlPayload = {
            ...musicControlRef.current,
            trackId: fallback?.id ?? null,
            trackName: fallback?.name ?? null,
            isPlaying: false,
          };
          setMusicControl(nextCtrl);
          musicControlRef.current = nextCtrl;
          if (role === 'display') {
            applyControlToAudioElement(nextCtrl, false);
          }
        }
        return remaining;
      });
    },
    [applyControlToAudioElement, role]
  );

  // =========================================================================
  // 1. LOCAL SYNC (BroadcastChannel + localStorage fallback)
  // =========================================================================
  useEffect(() => {
    const client = new ShowSyncClient({
      role,
      clientId: clientIdRef.current,
      getAudioUnlocked: () => isAudioUnlocked(),
      onStateReceived: handleIncomingState,
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
        const track: StoredMusicTrack = {
          id: incoming.trackId,
          name: incoming.name,
          mimeType: incoming.mimeType,
          buffer: incoming.buffer,
        };
        musicBuffersRef.current.set(track.id, track);
        setMusicTracks((prev) =>
          prev.some((p) => p.id === track.id) ? prev : [...prev, { id: track.id, name: track.name }]
        );
        setMusicControl(incoming.control);
        musicControlRef.current = incoming.control;
        loadTrackIntoAudioElement(track, incoming.control, true);
      },
      onMusicCatalogReceived: (tracks, incomingControl) => {
        if (role !== 'host') return;
        setMusicTracks(tracks);
        setMusicControl(incomingControl);
        musicControlRef.current = incomingControl;
        setMusicHostedOnDisplay(tracks.length > 0);
      },
      onMusicControlReceived: handleIncomingMusicControl,
      onMusicRemoveReceived: handleIncomingMusicRemove,
      onMusicRequested: () => {
        if (role === 'host') {
          sendCurrentMusicToDisplays();
        } else if (role === 'display' && musicTracksRef.current.length > 0) {
          broadcastDisplayMusicCatalog();
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
    handleIncomingState,
    handleIncomingMusicControl,
    handleIncomingMusicRemove,
    pushFlash,
    sendCurrentMusicToDisplays,
    broadcastDisplayMusicCatalog,
    loadTrackIntoAudioElement,
  ]);

  // =========================================================================
  // 2. CROSS-DEVICE REMOTE SYNC (PeerJS singleton aislado de re-renders)
  // =========================================================================
  // Handlers siempre frescos dentro de useRef: actualizar estado/puntaje/timer
  // JAMÁS dispara desmontaje ni reconexión del Peer.
  const peerHandlersRef = useRef<PeerSyncHandlers>({
    clientId: clientIdRef.current,
    getAudioUnlocked: () => isAudioUnlocked(),
    onRoomCodeChange: (code) => setRoomCode(code),
    onStatusChange: (status, err) => {
      setRemoteStatus(status);
      setRemoteError(err);
      if (status === 'disconnected') {
        setRemoteDisplayAudioReady(false);
      }
    },
    onConnectionsChange: (count) => {
      setRemoteConnectedCount(count);
      if (count === 0) {
        setRemoteDisplayAudioReady(false);
      }
    },
    onPeerOpened: () => {},
    onMessage: () => {},
  });

  peerHandlersRef.current = {
    clientId: clientIdRef.current,
    getAudioUnlocked: () => isAudioUnlocked(),
    onRoomCodeChange: (code) => setRoomCode(code),
    onStatusChange: (status, err) => {
      setRemoteStatus(status);
      setRemoteError(err);
      if (status === 'disconnected') {
        setRemoteDisplayAudioReady(false);
      }
    },
    onConnectionsChange: (count) => {
      setRemoteConnectedCount(count);
      if (count === 0) {
        setRemoteDisplayAudioReady(false);
      }
    },
    onPeerOpened: (conn) => {
      peerManager.sendToConnection(conn, {
        type: 'HEARTBEAT',
        senderId: clientIdRef.current,
        role,
        timestamp: Date.now(),
        audioUnlocked: isAudioUnlocked(),
      });

      if (role === 'host') {
        // Empujar inmediatamente el estado más reciente desde stateRef al conectar o reconectar
        peerManager.sendToConnection(conn, {
          type: 'STATE_UPDATE',
          senderId: clientIdRef.current,
          role: 'host',
          state: stateRef.current,
        });
        peerManager.sendToConnection(conn, {
          type: 'MUSIC_REQUEST',
          senderId: clientIdRef.current,
        });
      } else {
        peerManager.sendToConnection(conn, {
          type: 'REQUEST_STATE',
          senderId: clientIdRef.current,
          role: 'display',
        });
        if (musicTracksRef.current.length > 0) {
          peerManager.sendToConnection(conn, {
            type: 'MUSIC_CATALOG',
            senderId: clientIdRef.current,
            tracks: musicTracksRef.current,
            control: musicControlRef.current,
          });
        }
      }
    },
    onMessage: (msg: SyncMessage) => {
      switch (msg.type) {
        case 'STATE_UPDATE':
          handleIncomingState(msg.state, msg.role);
          break;
        case 'REQUEST_STATE':
          if (role === 'host') {
            peerManager.send({
              type: 'STATE_UPDATE',
              senderId: clientIdRef.current,
              role: 'host',
              state: stateRef.current,
            });
          }
          break;
        case 'SCORE_FLASH':
          pushFlash(msg.flash);
          break;
        case 'SOUND_CUE':
          if (!stateRef.current.audioMuted && soundEnabledRef.current) {
            playBroadcastCue(msg.cue);
          }
          break;
        case 'MUSIC_CATALOG':
          if (role === 'host') {
            setMusicTracks(msg.tracks);
            setMusicControl(msg.control);
            musicControlRef.current = msg.control;
            setMusicHostedOnDisplay(msg.tracks.length > 0);
          }
          break;
        case 'MUSIC_CONTROL':
          handleIncomingMusicControl(msg.control);
          break;
        case 'MUSIC_REMOVE':
          handleIncomingMusicRemove(msg.trackId);
          break;
        case 'MUSIC_REQUEST':
          if (role === 'display' && musicTracksRef.current.length > 0) {
            peerManager.send({
              type: 'MUSIC_CATALOG',
              senderId: clientIdRef.current,
              tracks: musicTracksRef.current,
              control: musicControlRef.current,
            });
          }
          break;
        case 'PONG':
          if (role === 'host' && msg.audioUnlocked !== undefined) {
            setRemoteDisplayAudioReady(msg.audioUnlocked);
          }
          break;
        case 'HEARTBEAT':
          if (msg.role === 'display' && msg.audioUnlocked !== undefined) {
            setRemoteDisplayAudioReady(msg.audioUnlocked);
          }
          break;
      }
    },
  };

  // Mantener delegadores estables apuntando siempre a peerHandlersRef.current
  useEffect(() => {
    const id = clientIdRef.current;
    peerManager.attachHandlers(role, {
      clientId: id,
      getAudioUnlocked: () => peerHandlersRef.current.getAudioUnlocked(),
      onRoomCodeChange: (code) => peerHandlersRef.current.onRoomCodeChange?.(code),
      onStatusChange: (status, err) => peerHandlersRef.current.onStatusChange(status, err),
      onConnectionsChange: (count) => peerHandlersRef.current.onConnectionsChange(count),
      onPeerOpened: (conn) => peerHandlersRef.current.onPeerOpened(conn),
      onMessage: (msg) => peerHandlersRef.current.onMessage(msg),
    });

    return () => {
      peerManager.detachHandlers(id);
    };
  }, [role]);

  // Efecto de sala: SOLO depende de `role` y `activePeerRoom` (NUNCA de gameState ni callbacks)
  useEffect(() => {
    if (role === 'display') {
      peerManager.ensureDisplayRoom(activePeerRoom || undefined);
    } else if (role === 'host' && activePeerRoom.length === 4) {
      peerManager.connectHostToRoom(activePeerRoom);
    }
  }, [role, activePeerRoom]);

  const connectRemoteRoom = useCallback(
    (code: string) => {
      if (role !== 'host') return;
      const clean = normalizeRoomCode(code);
      if (clean.length !== 4) {
        setRemoteStatus('error');
        setRemoteError('Ingresa un código de 4 letras.');
        return;
      }
      setRoomCode(clean);
      setActivePeerRoom(clean);
      // Si el usuario vuelve a presionar "Conectar" con el mismo código tras error, reintentar limpio
      peerManager.connectHostToRoom(clean);
    },
    [role]
  );

  const disconnectRemoteRoom = useCallback(() => {
    if (role !== 'host') return;
    setActivePeerRoom('');
    peerManager.disconnectHost();
  }, [role]);

  const regenerateRoomCode = useCallback(() => {
    if (role !== 'display') return;
    peerManager.regenerateDisplayRoom();
  }, [role]);

  const {
    localConnectedDisplays,
    connectedDisplays,
    connectedHosts,
    displayAudioReady,
  } = useMemo(() => {
    let localDisplays = 0;
    let localHosts = 0;
    let localAudioReady = false;
    for (const p of Object.values(peers)) {
      if (p.role === 'display') {
        localDisplays += 1;
        if (p.audioUnlocked) localAudioReady = true;
      }
      if (p.role === 'host') localHosts += 1;
    }

    const remoteDisplays = role === 'host' ? remoteConnectedCount : 0;
    const remoteHosts = role === 'display' ? remoteConnectedCount : 0;

    return {
      localConnectedDisplays: localDisplays,
      connectedDisplays: localDisplays + remoteDisplays,
      connectedHosts: localHosts + remoteHosts,
      displayAudioReady: localAudioReady || remoteDisplayAudioReady,
    };
  }, [peers, remoteConnectedCount, remoteDisplayAudioReady, role]);

  connectedDisplaysRef.current = connectedDisplays;

  // Keep audio element mute/playback synced whenever audioMuted, soundEnabled, or connectedDisplays changes
  useEffect(() => {
    const shouldPlayHere =
      role === 'display' ? true : soundEnabled && connectedDisplays === 0;
    applyControlToAudioElement(musicControlRef.current, shouldPlayHere);
  }, [role, state.audioMuted, soundEnabled, connectedDisplays, applyControlToAudioElement]);

  // --- Custom Background Music Controls (Works on BOTH /display and /host) ---

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

      const nextTracks = [
        ...musicTracksRef.current,
        ...added.map((tr) => ({ id: tr.id, name: tr.name })),
      ];
      setMusicTracks(nextTracks);
      musicTracksRef.current = nextTracks;

      let nextCtrl = musicControlRef.current;
      if (!nextCtrl.trackId) {
        const first = added[0];
        nextCtrl = {
          ...nextCtrl,
          trackId: first.id,
          trackName: first.name,
        };
        setMusicControl(nextCtrl);
        musicControlRef.current = nextCtrl;

        const shouldPlayLocal =
          role === 'display' || (soundEnabledRef.current && connectedDisplaysRef.current === 0);
        loadTrackIntoAudioElement(first, nextCtrl, shouldPlayLocal);

        if (role === 'host') {
          setMusicHostedOnDisplay(false);
          syncRef.current?.broadcastMusicTrack({
            trackId: first.id,
            name: first.name,
            mimeType: first.mimeType,
            buffer: first.buffer,
            control: nextCtrl,
          });
        }
      }

      if (role === 'display') {
        syncRef.current?.broadcastMusicCatalog(nextTracks, nextCtrl);
        peerManager.send({
          type: 'MUSIC_CATALOG',
          senderId: clientIdRef.current,
          tracks: nextTracks,
          control: nextCtrl,
        });
      }
    },
    [loadTrackIntoAudioElement, role]
  );

  const selectMusicTrack = useCallback(
    (trackId: string) => {
      const trackMeta = musicTracksRef.current.find((item) => item.id === trackId);
      const stored = musicBuffersRef.current.get(trackId);
      if (!trackMeta && !stored) return;

      const nextCtrl: MusicControlPayload = {
        ...musicControlRef.current,
        trackId,
        trackName: stored?.name ?? trackMeta?.name ?? null,
      };
      setMusicControl(nextCtrl);
      musicControlRef.current = nextCtrl;

      if (stored) {
        const shouldPlayLocal =
          role === 'display' || (soundEnabledRef.current && connectedDisplaysRef.current === 0);
        loadTrackIntoAudioElement(stored, nextCtrl, shouldPlayLocal);

        if (role === 'host') {
          syncRef.current?.broadcastMusicTrack({
            trackId: stored.id,
            name: stored.name,
            mimeType: stored.mimeType,
            buffer: stored.buffer,
            control: nextCtrl,
          });
        }
      }

      // Enviar siempre comando liviano de control (clave para controlar pistas cargadas en /display desde el celular)
      syncRef.current?.broadcastMusicControl(nextCtrl);
      peerManager.send({
        type: 'MUSIC_CONTROL',
        senderId: clientIdRef.current,
        control: nextCtrl,
      });

      if (role === 'display') {
        broadcastDisplayMusicCatalog();
      }
    },
    [broadcastDisplayMusicCatalog, loadTrackIntoAudioElement, role]
  );

  const removeMusicTrack = useCallback(
    (trackId: string) => {
      musicBuffersRef.current.delete(trackId);
      const remaining = musicTracksRef.current.filter((item) => item.id !== trackId);
      setMusicTracks(remaining);
      musicTracksRef.current = remaining;

      let nextCtrl = musicControlRef.current;
      if (nextCtrl.trackId === trackId) {
        const fallback = remaining[0] ?? null;
        nextCtrl = {
          ...nextCtrl,
          trackId: fallback?.id ?? null,
          trackName: fallback?.name ?? null,
          isPlaying: false,
        };
        setMusicControl(nextCtrl);
        musicControlRef.current = nextCtrl;

        if (fallback) {
          const stored = musicBuffersRef.current.get(fallback.id);
          if (stored) {
            loadTrackIntoAudioElement(stored, nextCtrl, false);
            if (role === 'host') {
              syncRef.current?.broadcastMusicTrack({
                trackId: stored.id,
                name: stored.name,
                mimeType: stored.mimeType,
                buffer: stored.buffer,
                control: nextCtrl,
              });
            }
          }
        } else {
          applyControlToAudioElement(nextCtrl, false);
        }
      }

      syncRef.current?.broadcastMusicRemove(trackId);
      peerManager.send({
        type: 'MUSIC_REMOVE',
        senderId: clientIdRef.current,
        trackId,
      });
      syncRef.current?.broadcastMusicControl(nextCtrl);
      peerManager.send({
        type: 'MUSIC_CONTROL',
        senderId: clientIdRef.current,
        control: nextCtrl,
      });

      if (role === 'display') {
        broadcastDisplayMusicCatalog();
      }
    },
    [applyControlToAudioElement, broadcastDisplayMusicCatalog, loadTrackIntoAudioElement, role]
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
      applyControlToAudioElement(nextCtrl, shouldPlayLocal);

      syncRef.current?.broadcastMusicControl(nextCtrl);
      peerManager.send({
        type: 'MUSIC_CONTROL',
        senderId: clientIdRef.current,
        control: nextCtrl,
      });
    },
    [applyControlToAudioElement, role]
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

  const commitState = useCallback(
    (updater: (prev: ShowState) => ShowState) => {
      setState((prev) => {
        const next: ShowState = {
          ...updater(prev),
          updatedAt: Math.max(Date.now(), prev.updatedAt + 1),
        };
        stateRef.current = next;
        syncRef.current?.broadcastState(next);
        peerManager.send({
          type: 'STATE_UPDATE',
          senderId: clientIdRef.current,
          role,
          state: next,
        });
        return next;
      });
    },
    [role]
  );

  const triggerCue = useCallback((cue: SoundCue) => {
    if (stateRef.current.audioMuted) return;
    if (soundEnabledRef.current) {
      playBroadcastCue(cue);
    }
    syncRef.current?.broadcastSoundCue(cue);
    peerManager.send({
      type: 'SOUND_CUE',
      senderId: clientIdRef.current,
      cue,
    });
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
      peerManager.send({
        type: 'SCORE_FLASH',
        senderId: clientIdRef.current,
        flash,
      });
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
      localConnectedDisplays,
      displayAudioReady,
      roomCode,
      remoteStatus,
      remoteError,
      remoteConnectedCount,
      connectRemoteRoom,
      disconnectRemoteRoom,
      regenerateRoomCode,
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
      musicHostedOnDisplay,
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
      localConnectedDisplays,
      displayAudioReady,
      roomCode,
      remoteStatus,
      remoteError,
      remoteConnectedCount,
      connectRemoteRoom,
      disconnectRemoteRoom,
      regenerateRoomCode,
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
      musicHostedOnDisplay,
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
