import { createId, createInitialShowState, parseImportedShowState } from './defaults';
import type {
  ClientRole,
  MusicControlPayload,
  MusicTrackSummary,
  ScoreFlash,
  ShowState,
  SoundCue,
  SyncMessage,
} from '../types/show';

export const STORAGE_KEY = 'puntos_rapidos_state_v1';
export const EVENT_BRIDGE_KEY = 'puntos_rapidos_event_v1';
export const CHANNEL_NAME = 'puntos-rapidos-sync-v1';

export type SyncTransport = 'broadcast-channel' | 'storage-fallback';

export interface PeerInfo {
  role: ClientRole;
  lastSeen: number;
  audioUnlocked?: boolean;
}

export interface IncomingMusicTrack {
  trackId: string;
  name: string;
  mimeType: string;
  buffer: ArrayBuffer;
  control: MusicControlPayload;
}

export function loadPersistedState(): ShowState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialShowState();
    const parsed = JSON.parse(raw) as unknown;
    const validated = parseImportedShowState(parsed);
    if (validated.ok) {
      const rawUpdated = (parsed as { updatedAt?: unknown })?.updatedAt;
      return {
        ...validated.state,
        updatedAt: typeof rawUpdated === 'number' ? rawUpdated : validated.state.updatedAt,
      };
    }
    return createInitialShowState();
  } catch {
    return createInitialShowState();
  }
}

export function savePersistedState(state: ShowState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignorar errores de cuota en modo privado
  }
}

export interface SyncClientOptions {
  role: ClientRole;
  clientId?: string;
  getAudioUnlocked?: () => boolean;
  onStateReceived: (state: ShowState, fromRole: ClientRole) => void;
  onStateRequested: () => void;
  onScoreFlash: (flash: ScoreFlash) => void;
  onSoundCue: (cue: SoundCue) => void;
  onMusicTrackReceived?: (track: IncomingMusicTrack) => void;
  onMusicCatalogReceived?: (tracks: MusicTrackSummary[], control: MusicControlPayload) => void;
  onMusicControlReceived?: (control: MusicControlPayload) => void;
  onMusicRemoveReceived?: (trackId: string) => void;
  onMusicRequested?: () => void;
  onPeersChanged: (peers: Record<string, PeerInfo>) => void;
}

export class ShowSyncClient {
  readonly clientId: string;
  readonly role: ClientRole;
  readonly transport: SyncTransport;

  private channel: BroadcastChannel | null = null;
  private options: SyncClientOptions;
  private peers: Record<string, PeerInfo> = {};
  private heartbeatTimer: number | null = null;
  private pruneTimer: number | null = null;
  private lastReceivedStamp = -1;

  constructor(options: SyncClientOptions) {
    this.clientId = options.clientId ?? createId(options.role);
    this.role = options.role;
    this.options = options;

    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        this.handleMessage(event.data);
      };
      this.transport = 'broadcast-channel';
    } else {
      this.transport = 'storage-fallback';
    }

    window.addEventListener('storage', this.handleStorageEvent);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.sendHeartbeat();
    this.sendMessage({
      type: 'REQUEST_STATE',
      senderId: this.clientId,
      role: this.role,
    });

    if (this.role === 'display' && this.channel) {
      this.channel.postMessage({
        type: 'MUSIC_REQUEST',
        senderId: this.clientId,
      } satisfies SyncMessage);
    }

    this.heartbeatTimer = window.setInterval(() => {
      this.sendHeartbeat();
    }, 2000);

    this.pruneTimer = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, info] of Object.entries(this.peers)) {
        if (now - info.lastSeen > 6000) {
          delete this.peers[id];
          changed = true;
        }
      }
      if (changed) {
        this.options.onPeersChanged({ ...this.peers });
      }
    }, 2500);
  }

  private handleBeforeUnload = () => {
    this.sendMessage({
      type: 'CLIENT_LEAVE',
      senderId: this.clientId,
      role: this.role,
    });
  };

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as unknown;
        const validated = parseImportedShowState(parsed);
        if (validated.ok) {
          const rawUpdated = (parsed as { updatedAt?: unknown })?.updatedAt;
          const stamp = typeof rawUpdated === 'number' ? rawUpdated : Date.now();
          if (stamp === this.lastReceivedStamp) return;
          this.lastReceivedStamp = stamp;
          this.options.onStateReceived(
            {
              ...validated.state,
              updatedAt: stamp,
            },
            'host'
          );
        }
      } catch {
        // Ignorar carga inválida
      }
      return;
    }

    if (event.key === EVENT_BRIDGE_KEY && event.newValue) {
      try {
        const msg = JSON.parse(event.newValue) as SyncMessage;
        this.handleMessage(msg);
      } catch {
        // Ignorar mensaje inválido
      }
    }
  };

  private handleMessage(msg: SyncMessage | null | undefined) {
    if (!msg || typeof msg !== 'object' || msg.senderId === this.clientId) {
      return;
    }

    switch (msg.type) {
      case 'STATE_UPDATE':
        this.touchPeer(msg.senderId, msg.role);
        this.lastReceivedStamp = msg.state.updatedAt;
        this.options.onStateReceived(msg.state, msg.role);
        break;
      case 'REQUEST_STATE':
        this.touchPeer(msg.senderId, msg.role);
        this.sendHeartbeat();
        this.options.onStateRequested();
        break;
      case 'SCORE_FLASH':
        this.options.onScoreFlash(msg.flash);
        break;
      case 'SOUND_CUE':
        this.options.onSoundCue(msg.cue);
        break;
      case 'MUSIC_TRACK_DATA':
        this.options.onMusicTrackReceived?.({
          trackId: msg.trackId,
          name: msg.name,
          mimeType: msg.mimeType,
          buffer: msg.buffer,
          control: msg.control,
        });
        break;
      case 'MUSIC_CATALOG':
        this.options.onMusicCatalogReceived?.(msg.tracks, msg.control);
        break;
      case 'MUSIC_CONTROL':
        this.options.onMusicControlReceived?.(msg.control);
        break;
      case 'MUSIC_REMOVE':
        this.options.onMusicRemoveReceived?.(msg.trackId);
        break;
      case 'MUSIC_REQUEST':
        this.options.onMusicRequested?.();
        break;
      case 'HEARTBEAT':
        this.touchPeer(msg.senderId, msg.role, msg.audioUnlocked);
        break;
      case 'CLIENT_LEAVE':
        if (this.peers[msg.senderId]) {
          delete this.peers[msg.senderId];
          this.options.onPeersChanged({ ...this.peers });
        }
        break;
    }
  }

  private touchPeer(senderId: string, role: ClientRole, audioUnlocked?: boolean) {
    const prev = this.peers[senderId];
    const nextAudio = audioUnlocked !== undefined ? audioUnlocked : prev?.audioUnlocked;
    const changed = !prev || prev.audioUnlocked !== nextAudio;
    this.peers[senderId] = { role, lastSeen: Date.now(), audioUnlocked: nextAudio };
    if (changed) {
      this.options.onPeersChanged({ ...this.peers });
    }
  }

  private sendMessage(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
        return;
      } catch {
        // Fallback a localStorage para mensajes livianos
      }
    }
    if (msg.type === 'MUSIC_TRACK_DATA') {
      // Nunca guardar archivos binarios de audio en localStorage
      return;
    }
    try {
      window.localStorage.setItem(EVENT_BRIDGE_KEY, JSON.stringify({ ...msg, _nonce: Math.random() }));
    } catch {
      // Ignorar errores de cuota
    }
  }

  sendHeartbeat() {
    this.sendMessage({
      type: 'HEARTBEAT',
      senderId: this.clientId,
      role: this.role,
      timestamp: Date.now(),
      audioUnlocked: this.options.getAudioUnlocked?.(),
    });
  }

  broadcastState(state: ShowState) {
    savePersistedState(state);
    this.sendMessage({
      type: 'STATE_UPDATE',
      senderId: this.clientId,
      role: this.role,
      state,
    });
  }

  broadcastScoreFlash(flash: ScoreFlash) {
    this.sendMessage({
      type: 'SCORE_FLASH',
      senderId: this.clientId,
      flash,
    });
  }

  broadcastSoundCue(cue: SoundCue) {
    this.sendMessage({
      type: 'SOUND_CUE',
      senderId: this.clientId,
      cue,
    });
  }

  /**
   * Envía el ArrayBuffer del archivo de audio directamente por BroadcastChannel (sin tocar localStorage).
   */
  broadcastMusicTrack(payload: {
    trackId: string;
    name: string;
    mimeType: string;
    buffer: ArrayBuffer;
    control: MusicControlPayload;
  }) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: 'MUSIC_TRACK_DATA',
        senderId: this.clientId,
        trackId: payload.trackId,
        name: payload.name,
        mimeType: payload.mimeType,
        buffer: payload.buffer,
        control: payload.control,
      } satisfies SyncMessage);
    } catch {
      // Ignorar si la ventana cerró el canal
    }
  }

  broadcastMusicCatalog(tracks: MusicTrackSummary[], control: MusicControlPayload) {
    this.sendMessage({
      type: 'MUSIC_CATALOG',
      senderId: this.clientId,
      tracks,
      control,
    });
  }

  broadcastMusicControl(control: MusicControlPayload) {
    this.sendMessage({
      type: 'MUSIC_CONTROL',
      senderId: this.clientId,
      control,
    });
  }

  broadcastMusicRemove(trackId: string) {
    this.sendMessage({
      type: 'MUSIC_REMOVE',
      senderId: this.clientId,
      trackId,
    });
  }

  destroy() {
    this.handleBeforeUnload();
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    if (this.pruneTimer !== null) window.clearInterval(this.pruneTimer);
    window.removeEventListener('storage', this.handleStorageEvent);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
