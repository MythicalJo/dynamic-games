import { createId, createInitialShowState, parseImportedShowState } from './defaults';
import type { ClientRole, ScoreFlash, ShowState, SoundCue, SyncMessage } from '../types/show';

export const STORAGE_KEY = 'puntos_rapidos_state_v1';
export const EVENT_BRIDGE_KEY = 'puntos_rapidos_event_v1';
export const CHANNEL_NAME = 'puntos-rapidos-sync-v1';

export type SyncTransport = 'broadcast-channel' | 'storage-fallback';

export interface PeerInfo {
  role: ClientRole;
  lastSeen: number;
  audioUnlocked?: boolean;
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
    // Ignore storage quota errors in private browsing
  }
}

export interface SyncClientOptions {
  role: ClientRole;
  getAudioUnlocked?: () => boolean;
  onStateReceived: (state: ShowState, fromRole: ClientRole) => void;
  onStateRequested: () => void;
  onScoreFlash: (flash: ScoreFlash) => void;
  onSoundCue: (cue: SoundCue) => void;
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
    this.clientId = createId(options.role);
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
        // Ignore invalid storage payload
      }
      return;
    }

    if (event.key === EVENT_BRIDGE_KEY && event.newValue) {
      try {
        const msg = JSON.parse(event.newValue) as SyncMessage;
        this.handleMessage(msg);
      } catch {
        // Ignore invalid bridge payload
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
        // Fall through to localStorage bridge
      }
    }
    try {
      window.localStorage.setItem(EVENT_BRIDGE_KEY, JSON.stringify({ ...msg, _nonce: Math.random() }));
    } catch {
      // Ignore storage errors
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
