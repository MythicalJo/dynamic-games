import Peer, { type DataConnection } from 'peerjs';
import type {
  ClientRole,
  RemoteConnectionStatus,
  ShowState,
  SyncMessage,
} from '../types/show';

export const PEER_ID_PREFIX = 'dynamic-games-';
const DISPLAY_ROOM_STORAGE_KEY = 'puntos_rapidos_display_room_v1';
const HOST_LAST_ROOM_STORAGE_KEY = 'puntos_rapidos_host_room_v1';

// 24 letras claras sin caracteres ambiguos (sin I ni O)
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(length = 4): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return result;
}

export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4);
}

export function getOrCreateDisplayRoomCode(): string {
  try {
    const existing = window.sessionStorage.getItem(DISPLAY_ROOM_STORAGE_KEY);
    const cleaned = existing ? normalizeRoomCode(existing) : '';
    if (cleaned.length === 4) return cleaned;
    const fresh = generateRoomCode(4);
    window.sessionStorage.setItem(DISPLAY_ROOM_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return generateRoomCode(4);
  }
}

export function saveDisplayRoomCode(code: string): void {
  try {
    window.sessionStorage.setItem(DISPLAY_ROOM_STORAGE_KEY, normalizeRoomCode(code));
  } catch {
    // ignorar
  }
}

export function loadLastHostRoomCode(): string {
  try {
    return normalizeRoomCode(window.sessionStorage.getItem(HOST_LAST_ROOM_STORAGE_KEY) ?? '');
  } catch {
    return '';
  }
}

export function saveLastHostRoomCode(code: string): void {
  try {
    const clean = normalizeRoomCode(code);
    if (clean) {
      window.sessionStorage.setItem(HOST_LAST_ROOM_STORAGE_KEY, clean);
    } else {
      window.sessionStorage.removeItem(HOST_LAST_ROOM_STORAGE_KEY);
    }
  } catch {
    // ignorar
  }
}

export function getRemoteHostUrl(roomCode: string): string {
  if (typeof window === 'undefined') {
    return `/#/host?room=${encodeURIComponent(roomCode)}`;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/host?room=${encodeURIComponent(normalizeRoomCode(roomCode))}`;
}

/**
 * Compensa posibles diferencias de reloj entre el celular (/host) y la PC (/display)
 * para que los temporizadores regresivos corran exactamente sincronizados.
 */
export function adjustRemoteStateTimers(state: ShowState, sentAt?: number): ShowState {
  if (typeof sentAt !== 'number' || !Number.isFinite(sentAt)) return state;
  const offsetMs = Date.now() - sentAt;
  if (Math.abs(offsetMs) < 120) return state;

  const nextModuleData: Record<string, unknown> = { ...state.moduleData };
  let mutated = false;

  for (const [key, val] of Object.entries(nextModuleData)) {
    if (!val || typeof val !== 'object') continue;
    const modObj = val as Record<string, unknown>;
    const timer = modObj.timer;
    if (timer && typeof timer === 'object') {
      const tObj = timer as Record<string, unknown>;
      if (tObj.isRunning === true && typeof tObj.startedAt === 'number') {
        nextModuleData[key] = {
          ...modObj,
          timer: {
            ...tObj,
            startedAt: tObj.startedAt + offsetMs,
          },
        };
        mutated = true;
      }
    }
  }

  return mutated ? { ...state, moduleData: nextModuleData } : state;
}

export interface PeerSyncCallbacks {
  role: ClientRole;
  clientId: string;
  onMessage: (msg: SyncMessage) => void;
  onStatusChange: (status: RemoteConnectionStatus, error: string | null) => void;
  onConnectionsChange: (count: number) => void;
  onPeerOpened: (conn: DataConnection) => void;
  onRoomCodeChange?: (roomCode: string) => void;
}

/**
 * Capa de sincronización P2P multi-dispositivo usando PeerJS (WebRTC DataChannel).
 * - /display escucha en `dynamic-games-XXXX` y acepta conexiones de controles remotos.
 * - /host se conecta a `dynamic-games-XXXX`, reintenta automáticamente si se cae y
 *   empuja el estado completo al conectar o reconectar.
 */
export class PeerSyncClient {
  private callbacks: PeerSyncCallbacks;
  private peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private destroyed = false;

  private roomCode = '';
  private targetRoomCode = '';
  private userWantsConnection = false;
  private unavailableRetries = 0;

  private reconnectTimer: number | null = null;
  private connectTimeoutTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private getHeartbeatPayload: (() => SyncMessage) | null = null;

  constructor(callbacks: PeerSyncCallbacks, getHeartbeatPayload?: () => SyncMessage) {
    this.callbacks = callbacks;
    this.getHeartbeatPayload = getHeartbeatPayload ?? null;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.heartbeatTimer = window.setInterval(() => {
      if (this.connections.size > 0 && this.getHeartbeatPayload) {
        this.send(this.getHeartbeatPayload());
      }
    }, 3000);
  }

  private clearTimers() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectTimeoutTimer !== null) {
      window.clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }
  }

  private emitConnectionsCount() {
    let openCount = 0;
    for (const conn of this.connections.values()) {
      if (conn.open) openCount += 1;
    }
    this.callbacks.onConnectionsChange(openCount);
  }

  private handleVisibilityChange = () => {
    if (this.destroyed || document.visibilityState !== 'visible') return;
    if (this.callbacks.role === 'host' && this.userWantsConnection && this.targetRoomCode) {
      const hasOpen = Array.from(this.connections.values()).some((c) => c.open);
      if (!hasOpen) {
        this.connectToRoom(this.targetRoomCode);
      }
    } else if (this.callbacks.role === 'display' && this.peer && this.peer.disconnected && !this.peer.destroyed) {
      try {
        this.peer.reconnect();
      } catch {
        // ignorar
      }
    }
  };

  /* ===================================================================== */
  /* DISPLAY MODE: Host a 4-letter Room Code                               */
  /* ===================================================================== */
  startDisplayRoom(initialCode?: string) {
    if (this.destroyed) return;
    this.clearTimers();
    this.teardownPeer();

    const code = normalizeRoomCode(initialCode || getOrCreateDisplayRoomCode()) || generateRoomCode(4);
    this.roomCode = code;
    saveDisplayRoomCode(code);
    this.callbacks.onRoomCodeChange?.(code);
    this.callbacks.onStatusChange('connecting', null);

    const peerId = `${PEER_ID_PREFIX}${code}`;
    const peer = new Peer(peerId, { debug: 0 });
    this.peer = peer;

    peer.on('open', () => {
      if (this.destroyed || this.peer !== peer) return;
      this.unavailableRetries = 0;
      this.callbacks.onStatusChange(this.connections.size > 0 ? 'connected' : 'ready', null);
    });

    peer.on('connection', (conn) => {
      if (this.destroyed || this.peer !== peer) return;
      this.attachConnection(conn);
    });

    peer.on('disconnected', () => {
      if (this.destroyed || this.peer !== peer) return;
      if (this.connections.size === 0) {
        this.callbacks.onStatusChange('reconnecting', null);
      }
      this.reconnectTimer = window.setTimeout(() => {
        if (!this.destroyed && this.peer === peer && !peer.destroyed) {
          try {
            peer.reconnect();
          } catch {
            // ignorar
          }
        }
      }, 2000);
    });

    peer.on('error', (err) => {
      if (this.destroyed || this.peer !== peer) return;
      if (err.type === 'unavailable-id') {
        if (this.unavailableRetries < 1) {
          // Reintenta una vez por si fue un recargue rápido de pestaña
          this.unavailableRetries += 1;
          this.reconnectTimer = window.setTimeout(() => {
            if (!this.destroyed) this.startDisplayRoom(this.roomCode);
          }, 700);
        } else {
          this.unavailableRetries = 0;
          const fresh = generateRoomCode(4);
          this.startDisplayRoom(fresh);
        }
        return;
      }

      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error') {
        this.callbacks.onStatusChange('reconnecting', 'Reconectando con servidor P2P...');
        this.reconnectTimer = window.setTimeout(() => {
          if (!this.destroyed) this.startDisplayRoom(this.roomCode);
        }, 3500);
        return;
      }

      this.callbacks.onStatusChange('error', 'Sin conexión remota disponible.');
    });
  }

  regenerateDisplayRoom() {
    this.unavailableRetries = 0;
    const fresh = generateRoomCode(4);
    this.startDisplayRoom(fresh);
  }

  /* ===================================================================== */
  /* HOST MODE: Connect from Smartphone / Remote Browser to Display Room   */
  /* ===================================================================== */
  connectToRoom(rawCode: string) {
    if (this.destroyed) return;
    const code = normalizeRoomCode(rawCode);
    if (code.length !== 4) {
      this.callbacks.onStatusChange('error', 'Ingresa un código de 4 letras.');
      return;
    }

    this.clearTimers();
    this.teardownPeer();

    this.targetRoomCode = code;
    this.roomCode = code;
    this.userWantsConnection = true;
    saveLastHostRoomCode(code);
    this.callbacks.onRoomCodeChange?.(code);
    this.callbacks.onStatusChange('connecting', null);

    const peer = new Peer({ debug: 0 });
    this.peer = peer;

    const dialTarget = () => {
      if (this.destroyed || this.peer !== peer) return;
      const targetPeerId = `${PEER_ID_PREFIX}${code}`;
      const conn = peer.connect(targetPeerId, {
        reliable: true,
        serialization: 'json',
      });
      this.attachConnection(conn);

      // Si no abre en 10s, informar claramente para que el usuario revise el código
      this.connectTimeoutTimer = window.setTimeout(() => {
        if (this.destroyed || this.peer !== peer) return;
        if (!conn.open) {
          this.callbacks.onStatusChange(
            'error',
            `No se encontró la pantalla «${code}». Verifica que /display esté abierta.`
          );
          this.scheduleHostReconnect();
        }
      }, 10000);
    };

    peer.on('open', () => {
      dialTarget();
    });

    peer.on('disconnected', () => {
      if (this.destroyed || this.peer !== peer) return;
      if (this.userWantsConnection) {
        this.callbacks.onStatusChange('reconnecting', 'Reconectando señal...');
        this.scheduleHostReconnect();
      }
    });

    peer.on('error', (err) => {
      if (this.destroyed || this.peer !== peer) return;
      if (err.type === 'peer-unavailable') {
        this.callbacks.onStatusChange(
          'error',
          `Sala «${code}» no encontrada. Revisa el código en la pantalla.`
        );
        this.scheduleHostReconnect(4500);
        return;
      }

      this.callbacks.onStatusChange('reconnecting', 'Conexión inestable, reintentando...');
      this.scheduleHostReconnect(3500);
    });
  }

  disconnect() {
    this.userWantsConnection = false;
    this.targetRoomCode = '';
    this.clearTimers();
    this.teardownPeer();
    this.callbacks.onStatusChange('disconnected', null);
    this.callbacks.onConnectionsChange(0);
  }

  private scheduleHostReconnect(delayMs = 3000) {
    if (this.destroyed || !this.userWantsConnection || !this.targetRoomCode) return;
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.destroyed && this.userWantsConnection && this.targetRoomCode) {
        const hasOpen = Array.from(this.connections.values()).some((c) => c.open);
        if (!hasOpen) {
          this.connectToRoom(this.targetRoomCode);
        }
      }
    }, delayMs);
  }

  /* ===================================================================== */
  /* SHARED DATA CONNECTION HANDLING                                       */
  /* ===================================================================== */
  private attachConnection(conn: DataConnection) {
    this.connections.set(conn.connectionId, conn);

    conn.on('open', () => {
      if (this.destroyed) return;
      if (this.connectTimeoutTimer !== null) {
        window.clearTimeout(this.connectTimeoutTimer);
        this.connectTimeoutTimer = null;
      }
      this.emitConnectionsCount();
      this.callbacks.onStatusChange('connected', null);
      this.callbacks.onPeerOpened(conn);
    });

    conn.on('data', (raw) => {
      if (this.destroyed || !raw || typeof raw !== 'object') return;
      const msg = raw as SyncMessage;
      if (msg.senderId === this.callbacks.clientId) return;
      if (msg.type === 'STATE_UPDATE') {
        const adjusted = adjustRemoteStateTimers(msg.state, msg.sentAt);
        this.callbacks.onMessage({ ...msg, state: adjusted });
        return;
      }
      this.callbacks.onMessage(msg);
    });

    const handleClosed = () => {
      this.connections.delete(conn.connectionId);
      if (this.destroyed) return;
      this.emitConnectionsCount();

      if (this.callbacks.role === 'display') {
        const hasOpen = Array.from(this.connections.values()).some((c) => c.open);
        this.callbacks.onStatusChange(hasOpen ? 'connected' : 'ready', null);
      } else if (this.userWantsConnection) {
        this.callbacks.onStatusChange('reconnecting', 'Reconectando con la pantalla...');
        this.scheduleHostReconnect(2500);
      } else {
        this.callbacks.onStatusChange('disconnected', null);
      }
    };

    conn.on('close', handleClosed);
    conn.on('error', handleClosed);
  }

  sendToConnection(conn: DataConnection, msg: SyncMessage) {
    if (!conn.open || msg.type === 'MUSIC_TRACK_DATA') return;
    try {
      const payload =
        msg.type === 'STATE_UPDATE' ? { ...msg, sentAt: Date.now() } : msg;
      conn.send(payload);
    } catch {
      // ignorar si la conexión acaba de cerrarse
    }
  }

  send(msg: SyncMessage) {
    // Nunca enviar binarios MP3 enormes sobre la conexión móvil P2P
    if (msg.type === 'MUSIC_TRACK_DATA') return;
    const payload =
      msg.type === 'STATE_UPDATE' ? { ...msg, sentAt: Date.now() } : msg;

    for (const conn of this.connections.values()) {
      if (!conn.open) continue;
      try {
        conn.send(payload);
      } catch {
        // ignorar
      }
    }
  }

  private teardownPeer() {
    for (const conn of this.connections.values()) {
      try {
        conn.close();
      } catch {
        // ignorar
      }
    }
    this.connections.clear();
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignorar
      }
      this.peer = null;
    }
  }

  destroy() {
    this.destroyed = true;
    this.userWantsConnection = false;
    this.clearTimers();
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.teardownPeer();
  }
}
