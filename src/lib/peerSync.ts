import Peer, { type DataConnection, type PeerOptions } from 'peerjs';
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

const PEER_OPTIONS: PeerOptions = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ],
  },
};

const PING_INTERVAL_MS = 5000;
const PONG_STALE_TIMEOUT_MS = 20000;
const SIGNAL_RECONNECT_DEBOUNCE_MS = 2000;
const STATE_THROTTLE_MS = 100;
const MUSIC_CONTROL_THROTTLE_MS = 80;
const MAX_BUFFERED_AMOUNT = 65536;

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

export interface PeerSyncHandlers {
  clientId: string;
  getAudioUnlocked: () => boolean;
  onMessage: (msg: SyncMessage) => void;
  onStatusChange: (status: RemoteConnectionStatus, error: string | null) => void;
  onConnectionsChange: (count: number) => void;
  onPeerOpened: (conn: DataConnection) => void;
  onRoomCodeChange?: (roomCode: string) => void;
}

/**
 * Gestor singleton de PeerJS completamente aislado de los re-renders de React.
 * - Mantiene el objeto `Peer` y las `DataConnection` fuera del árbol de React.
 * - Reutiliza el mismo `Peer` con `peer.reconnect()` (debounce de 2s) en vez de
 *   destruir/recrear la instancia cuando la señalización cae brevemente.
 * - Envía `PING` cada 5s desde /host y responde `PONG` desde /display para mantener
 *   vivo el túnel WebRTC en navegadores móviles y routers Wi-Fi.
 * - Aplica throttling con coalescencia (leading + trailing) en STATE_UPDATE y
 *   MUSIC_CONTROL para evitar picos de payload al teclear o mover el volumen.
 */
class PeerSyncSingleton {
  private role: ClientRole | null = null;
  private handlers: PeerSyncHandlers | null = null;

  private peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private lastActivityByConn = new Map<string, number>();

  private activeDisplayRoom = '';
  private targetHostRoom = '';
  private hostWantsConnection = false;
  private unavailableRetries = 0;

  private currentStatus: RemoteConnectionStatus = 'disconnected';
  private currentError: string | null = null;

  // Timers internos
  private signalReconnectTimer: number | null = null;
  private redialTimer: number | null = null;
  private connectTimeoutTimer: number | null = null;
  private pingTimer: number | null = null;
  private teardownGraceTimer: number | null = null;

  // Throttling / coalescencia para evitar picos de payload
  private lastStateSentAt = 0;
  private pendingStateMsg: SyncMessage | null = null;
  private stateFlushTimer: number | null = null;

  private lastMusicCtrlSentAt = 0;
  private pendingMusicCtrlMsg: SyncMessage | null = null;
  private musicCtrlFlushTimer: number | null = null;

  private visibilityBound = false;

  private bindGlobalListeners() {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return;

    // 1. Si la señalización se desconectó mientras el celular estuvo en segundo plano, reconectarla suavemente
    if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
      this.scheduleSignalReconnect(300);
    }

    // 2. En /host, verificar la salud de la conexión sin destruir un túnel sano
    if (this.role === 'host' && this.hostWantsConnection && this.targetHostRoom) {
      if (this.hasOpenConnection()) {
        this.sendPingNow();
      } else {
        this.redialHostConnection();
      }
    }
  };

  /**
   * Actualiza los handlers de React sin tocar ni reiniciar la conexión PeerJS.
   */
  attachHandlers(role: ClientRole, handlers: PeerSyncHandlers) {
    this.bindGlobalListeners();
    if (this.teardownGraceTimer !== null) {
      window.clearTimeout(this.teardownGraceTimer);
      this.teardownGraceTimer = null;
    }

    // Si cambió el rol (ej. el usuario navegó de /host a /display en la misma pestaña), limpiar el peer anterior
    if (this.role !== null && this.role !== role) {
      this.destroyAll();
    }

    this.role = role;
    this.handlers = handlers;

    // Sincronizar estado actual inmediatamente al nuevo suscriptor
    handlers.onStatusChange(this.currentStatus, this.currentError);
    handlers.onConnectionsChange(this.getOpenConnectionCount());
    if (role === 'display' && this.activeDisplayRoom) {
      handlers.onRoomCodeChange?.(this.activeDisplayRoom);
    } else if (role === 'host' && this.targetHostRoom) {
      handlers.onRoomCodeChange?.(this.targetHostRoom);
    }
  }

  /**
   * Desvincula handlers de React al desmontar. Usa una pequeña ventana de gracia (400ms)
   * para sobrevivir al doble-montaje de React StrictMode sin romper ni recrear el Peer.
   */
  detachHandlers(clientId: string) {
    if (this.handlers?.clientId !== clientId) return;
    this.handlers = null;

    if (this.teardownGraceTimer !== null) {
      window.clearTimeout(this.teardownGraceTimer);
    }
    this.teardownGraceTimer = window.setTimeout(() => {
      this.teardownGraceTimer = null;
      if (!this.handlers) {
        this.destroyAll();
      }
    }, 400);
  }

  private setStatus(status: RemoteConnectionStatus, error: string | null = null) {
    this.currentStatus = status;
    this.currentError = error;
    this.handlers?.onStatusChange(status, error);
  }

  private getOpenConnectionCount(): number {
    let count = 0;
    for (const conn of this.connections.values()) {
      if (conn.open) count += 1;
    }
    return count;
  }

  private hasOpenConnection(): boolean {
    return this.getOpenConnectionCount() > 0;
  }

  private emitConnectionsCount() {
    this.handlers?.onConnectionsChange(this.getOpenConnectionCount());
  }

  private clearTimer(ref: 'signalReconnectTimer' | 'redialTimer' | 'connectTimeoutTimer' | 'stateFlushTimer' | 'musicCtrlFlushTimer') {
    const id = this[ref];
    if (id !== null) {
      window.clearTimeout(id);
      this[ref] = null;
    }
  }

  private scheduleSignalReconnect(delayMs = SIGNAL_RECONNECT_DEBOUNCE_MS) {
    this.clearTimer('signalReconnectTimer');
    this.signalReconnectTimer = window.setTimeout(() => {
      this.signalReconnectTimer = null;
      const peer = this.peer;
      if (!peer || peer.destroyed) return;
      if (peer.disconnected) {
        try {
          peer.reconnect();
        } catch {
          // Reintentar suavemente si el socket aún estaba cerrando
          this.scheduleSignalReconnect(3500);
        }
      }
    }, delayMs);
  }

  private ensurePingLoop() {
    if (this.pingTimer !== null) return;
    this.pingTimer = window.setInterval(() => {
      if (this.role !== 'host' || !this.hostWantsConnection) return;

      const now = Date.now();
      let sentAny = false;

      for (const [id, conn] of Array.from(this.connections.entries())) {
        if (!conn.open) continue;

        const lastActivity = this.lastActivityByConn.get(id) ?? now;
        if (now - lastActivity > PONG_STALE_TIMEOUT_MS) {
          // El canal WebRTC se quedó zombi (sin respuesta en 20s): cerrar solo esa conexión y remarcar
          this.connections.delete(id);
          this.lastActivityByConn.delete(id);
          try {
            conn.close();
          } catch {
            // ignorar
          }
          continue;
        }

        this.sendRawToConnection(conn, {
          type: 'PING',
          senderId: this.handlers?.clientId ?? 'host',
          timestamp: now,
        });
        sentAny = true;
      }

      if (!sentAny && this.hostWantsConnection && this.targetHostRoom && !this.hasOpenConnection()) {
        this.emitConnectionsCount();
        this.setStatus('reconnecting', 'Reconectando con la pantalla...');
        this.scheduleHostRedial(1500);
      }
    }, PING_INTERVAL_MS);
  }

  private sendPingNow() {
    const now = Date.now();
    for (const conn of this.connections.values()) {
      if (!conn.open) continue;
      this.sendRawToConnection(conn, {
        type: 'PING',
        senderId: this.handlers?.clientId ?? 'host',
        timestamp: now,
      });
    }
  }

  /* ===================================================================== */
  /* DISPLAY MODE: Alojar sala de 4 letras (`dynamic-games-XXXX`)          */
  /* ===================================================================== */
  ensureDisplayRoom(requestedCode?: string, forceRecreate = false) {
    const code =
      normalizeRoomCode(requestedCode || this.activeDisplayRoom || getOrCreateDisplayRoomCode()) ||
      generateRoomCode(4);

    // Idempotente: si ya estamos alojando exactamente esa sala y el Peer sigue vivo, NO recrearlo
    if (
      !forceRecreate &&
      this.role === 'display' &&
      this.activeDisplayRoom === code &&
      this.peer &&
      !this.peer.destroyed
    ) {
      if (this.peer.disconnected) {
        this.scheduleSignalReconnect(500);
      }
      return;
    }

    this.destroyPeerOnly();
    this.role = 'display';
    this.activeDisplayRoom = code;
    this.unavailableRetries = 0;
    saveDisplayRoomCode(code);
    this.handlers?.onRoomCodeChange?.(code);
    this.setStatus('connecting', null);

    const peer = new Peer(`${PEER_ID_PREFIX}${code}`, PEER_OPTIONS);
    this.peer = peer;

    peer.on('open', () => {
      if (this.peer !== peer) return;
      this.unavailableRetries = 0;
      this.setStatus(this.hasOpenConnection() ? 'connected' : 'ready', null);
    });

    peer.on('connection', (conn) => {
      if (this.peer !== peer) return;
      this.attachConnection(conn);
    });

    peer.on('disconnected', () => {
      if (this.peer !== peer || peer.destroyed) return;
      // NUNCA crear un Peer nuevo aquí: solo reconectar la señalización con debounce de 2s
      if (!this.hasOpenConnection()) {
        this.setStatus('reconnecting', null);
      }
      this.scheduleSignalReconnect(SIGNAL_RECONNECT_DEBOUNCE_MS);
    });

    peer.on('error', (err) => {
      if (this.peer !== peer) return;

      if (err.type === 'unavailable-id') {
        if (this.unavailableRetries < 1) {
          this.unavailableRetries += 1;
          this.clearTimer('redialTimer');
          this.redialTimer = window.setTimeout(() => {
            this.redialTimer = null;
            if (this.role === 'display' && this.activeDisplayRoom === code) {
              this.ensureDisplayRoom(code, true);
            }
          }, 900);
        } else {
          this.unavailableRetries = 0;
          const fresh = generateRoomCode(4);
          this.ensureDisplayRoom(fresh, true);
        }
        return;
      }

      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'disconnected') {
        if (!this.hasOpenConnection()) {
          this.setStatus('reconnecting', 'Reconectando señal P2P...');
        }
        this.scheduleSignalReconnect(SIGNAL_RECONNECT_DEBOUNCE_MS);
        return;
      }

      if (!this.hasOpenConnection()) {
        this.setStatus('error', 'Sin conexión remota disponible.');
      }
    });
  }

  regenerateDisplayRoom() {
    const fresh = generateRoomCode(4);
    this.ensureDisplayRoom(fresh, true);
  }

  /* ===================================================================== */
  /* HOST MODE: Conectar desde celular/navegador usando UN solo Peer       */
  /* ===================================================================== */
  connectHostToRoom(rawCode: string, forceRedial = false) {
    const code = normalizeRoomCode(rawCode);
    if (code.length !== 4) {
      this.setStatus('error', 'Ingresa un código de 4 letras.');
      return;
    }

    // Idempotente: si ya estamos conectados o conectando a esa misma sala, NO romper la conexión
    if (
      !forceRedial &&
      this.role === 'host' &&
      this.hostWantsConnection &&
      this.targetHostRoom === code &&
      (this.hasOpenConnection() || this.currentStatus === 'connecting')
    ) {
      return;
    }

    this.role = 'host';
    this.targetHostRoom = code;
    this.hostWantsConnection = true;
    saveLastHostRoomCode(code);
    this.handlers?.onRoomCodeChange?.(code);
    this.clearTimer('redialTimer');
    this.clearTimer('connectTimeoutTimer');
    this.ensurePingLoop();

    // Cerrar conexiones previas si estamos cambiando de sala
    this.closeAllConnections();
    this.setStatus('connecting', null);

    // Reutilizar el Peer existente si está vivo y conectado al servidor de señalización
    if (this.peer && !this.peer.destroyed) {
      if (this.peer.open && !this.peer.disconnected) {
        this.dialTargetOnCurrentPeer();
        return;
      }
      if (this.peer.disconnected) {
        this.scheduleSignalReconnect(300);
        return;
      }
      // Si el Peer aún está abriendo (`!peer.open`), su listener `open` marcará automáticamente
      return;
    }

    // Crear el Peer del /host UNA SOLA VEZ
    const peer = new Peer(PEER_OPTIONS);
    this.peer = peer;

    peer.on('open', () => {
      if (this.peer !== peer) return;
      if (this.hostWantsConnection && this.targetHostRoom && !this.hasOpenConnection()) {
        this.dialTargetOnCurrentPeer();
      }
    });

    peer.on('disconnected', () => {
      if (this.peer !== peer || peer.destroyed) return;
      // Mantener vivo el DataChannel WebRTC existente y reconectar señalización suavemente en 2s
      if (!this.hasOpenConnection() && this.hostWantsConnection) {
        this.setStatus('reconnecting', 'Reconectando señal...');
      }
      this.scheduleSignalReconnect(SIGNAL_RECONNECT_DEBOUNCE_MS);
    });

    peer.on('error', (err) => {
      if (this.peer !== peer) return;

      if (err.type === 'peer-unavailable') {
        this.clearTimer('connectTimeoutTimer');
        this.setStatus(
          'error',
          `Sala «${this.targetHostRoom}» no encontrada. Verifica que /display esté abierta.`
        );
        this.scheduleHostRedial(4500);
        return;
      }

      if (err.type === 'disconnected' || err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error') {
        if (!this.hasOpenConnection() && this.hostWantsConnection) {
          this.setStatus('reconnecting', 'Señal inestable, reconectando...');
        }
        this.scheduleSignalReconnect(SIGNAL_RECONNECT_DEBOUNCE_MS);
        return;
      }

      if (!this.hasOpenConnection() && this.hostWantsConnection) {
        this.setStatus('reconnecting', 'Reintentando conexión...');
        this.scheduleHostRedial(3500);
      }
    });
  }

  private dialTargetOnCurrentPeer() {
    const peer = this.peer;
    if (!peer || peer.destroyed || !this.hostWantsConnection || !this.targetHostRoom) return;
    if (peer.disconnected) {
      this.scheduleSignalReconnect(500);
      return;
    }
    if (this.hasOpenConnection()) return;

    this.closeAllConnections();
    const targetPeerId = `${PEER_ID_PREFIX}${this.targetHostRoom}`;
    const conn = peer.connect(targetPeerId, {
      reliable: true,
      serialization: 'json',
    });
    this.attachConnection(conn);

    this.clearTimer('connectTimeoutTimer');
    this.connectTimeoutTimer = window.setTimeout(() => {
      this.connectTimeoutTimer = null;
      if (!conn.open && this.hostWantsConnection && !this.hasOpenConnection()) {
        this.setStatus(
          'error',
          `No responde la pantalla «${this.targetHostRoom}». Revisa el código o la red Wi-Fi.`
        );
        try {
          conn.close();
        } catch {
          // ignorar
        }
        this.scheduleHostRedial(4000);
      }
    }, 12000);
  }

  private redialHostConnection() {
    if (!this.hostWantsConnection || !this.targetHostRoom) return;
    if (this.hasOpenConnection()) return;

    if (!this.peer || this.peer.destroyed) {
      this.connectHostToRoom(this.targetHostRoom, true);
      return;
    }

    if (this.peer.disconnected) {
      this.scheduleSignalReconnect(300);
      return;
    }

    if (this.peer.open) {
      this.dialTargetOnCurrentPeer();
    }
  }

  private scheduleHostRedial(delayMs = 3000) {
    if (!this.hostWantsConnection || !this.targetHostRoom) return;
    if (this.redialTimer !== null) return;
    this.redialTimer = window.setTimeout(() => {
      this.redialTimer = null;
      if (this.hostWantsConnection && !this.hasOpenConnection()) {
        this.redialHostConnection();
      }
    }, delayMs);
  }

  disconnectHost() {
    this.hostWantsConnection = false;
    this.targetHostRoom = '';
    saveLastHostRoomCode('');
    this.clearTimer('redialTimer');
    this.clearTimer('connectTimeoutTimer');
    this.clearTimer('stateFlushTimer');
    this.clearTimer('musicCtrlFlushTimer');
    this.pendingStateMsg = null;
    this.pendingMusicCtrlMsg = null;
    this.closeAllConnections();
    this.setStatus('disconnected', null);
    this.emitConnectionsCount();
  }

  /* ===================================================================== */
  /* GESTIÓN DE DATA CONNECTIONS + KEEP-ALIVE PING/PONG                    */
  /* ===================================================================== */
  private attachConnection(conn: DataConnection) {
    this.connections.set(conn.connectionId, conn);
    this.lastActivityByConn.set(conn.connectionId, Date.now());

    conn.on('open', () => {
      if (!this.connections.has(conn.connectionId)) return;
      this.lastActivityByConn.set(conn.connectionId, Date.now());
      this.clearTimer('connectTimeoutTimer');
      this.clearTimer('redialTimer');
      this.emitConnectionsCount();
      this.setStatus('connected', null);
      this.handlers?.onPeerOpened(conn);
    });

    conn.on('data', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      this.lastActivityByConn.set(conn.connectionId, Date.now());

      const msg = raw as SyncMessage;
      if (msg.senderId === this.handlers?.clientId) return;

      // Keep-alive PING / PONG gestionado en la capa de red sin disparar re-renders innecesarios
      if (msg.type === 'PING') {
        this.sendRawToConnection(conn, {
          type: 'PONG',
          senderId: this.handlers?.clientId ?? 'display',
          timestamp: msg.timestamp,
          audioUnlocked: this.handlers?.getAudioUnlocked(),
        });
        return;
      }

      if (msg.type === 'PONG') {
        this.handlers?.onMessage(msg);
        return;
      }

      if (msg.type === 'STATE_UPDATE') {
        const adjusted = adjustRemoteStateTimers(msg.state, msg.sentAt);
        this.handlers?.onMessage({ ...msg, state: adjusted });
        return;
      }

      this.handlers?.onMessage(msg);
    });

    const handleClosed = () => {
      const existed = this.connections.delete(conn.connectionId);
      this.lastActivityByConn.delete(conn.connectionId);
      if (!existed) return;

      this.emitConnectionsCount();

      if (this.role === 'display') {
        this.setStatus(this.hasOpenConnection() ? 'connected' : 'ready', null);
      } else if (this.role === 'host') {
        if (this.hostWantsConnection) {
          if (!this.hasOpenConnection()) {
            this.setStatus('reconnecting', 'Reconectando con la pantalla...');
            this.scheduleHostRedial(2000);
          }
        } else {
          this.setStatus('disconnected', null);
        }
      }
    };

    conn.on('close', handleClosed);
    conn.on('error', handleClosed);
  }

  /* ===================================================================== */
  /* ENVÍO CON PROTECCIÓN CONTRA PICOS DE PAYLOAD                          */
  /* ===================================================================== */
  private isChannelCongested(conn: DataConnection): boolean {
    const dc = conn.dataChannel as RTCDataChannel | undefined;
    return Boolean(dc && typeof dc.bufferedAmount === 'number' && dc.bufferedAmount > MAX_BUFFERED_AMOUNT);
  }

  private sendRawToConnection(conn: DataConnection, msg: SyncMessage) {
    if (!conn.open || msg.type === 'MUSIC_TRACK_DATA') return;
    try {
      const payload =
        msg.type === 'STATE_UPDATE' ? { ...msg, sentAt: Date.now() } : msg;
      conn.send(payload);
    } catch {
      // ignorar si el canal acaba de cerrarse
    }
  }

  sendToConnection(conn: DataConnection, msg: SyncMessage) {
    this.sendRawToConnection(conn, msg);
  }

  private broadcastRaw(msg: SyncMessage) {
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

  private hasCongestedConnection(): boolean {
    for (const conn of this.connections.values()) {
      if (conn.open && this.isChannelCongested(conn)) return true;
    }
    return false;
  }

  private flushPendingState() {
    this.stateFlushTimer = null;
    if (!this.pendingStateMsg) return;
    if (this.hasCongestedConnection()) {
      this.stateFlushTimer = window.setTimeout(() => this.flushPendingState(), STATE_THROTTLE_MS);
      return;
    }
    const msg = this.pendingStateMsg;
    this.pendingStateMsg = null;
    this.lastStateSentAt = Date.now();
    this.broadcastRaw(msg);
  }

  private flushPendingMusicCtrl() {
    this.musicCtrlFlushTimer = null;
    if (!this.pendingMusicCtrlMsg) return;
    const msg = this.pendingMusicCtrlMsg;
    this.pendingMusicCtrlMsg = null;
    this.lastMusicCtrlSentAt = Date.now();
    this.broadcastRaw(msg);
  }

  send(msg: SyncMessage) {
    if (msg.type === 'MUSIC_TRACK_DATA' || !this.hasOpenConnection()) return;

    // Leading + trailing throttle para STATE_UPDATE (evita picos de payload al escribir rápido en móvil)
    if (msg.type === 'STATE_UPDATE') {
      const now = Date.now();
      const elapsed = now - this.lastStateSentAt;

      if (elapsed >= STATE_THROTTLE_MS && !this.hasCongestedConnection() && this.stateFlushTimer === null) {
        this.lastStateSentAt = now;
        this.pendingStateMsg = null;
        this.broadcastRaw(msg);
      } else {
        this.pendingStateMsg = msg;
        if (this.stateFlushTimer === null) {
          const wait = Math.max(25, STATE_THROTTLE_MS - elapsed);
          this.stateFlushTimer = window.setTimeout(() => this.flushPendingState(), wait);
        }
      }
      return;
    }

    // Leading + trailing throttle para MUSIC_CONTROL (evita saturación al deslizar el volumen)
    if (msg.type === 'MUSIC_CONTROL') {
      const now = Date.now();
      const elapsed = now - this.lastMusicCtrlSentAt;

      if (elapsed >= MUSIC_CONTROL_THROTTLE_MS && this.musicCtrlFlushTimer === null) {
        this.lastMusicCtrlSentAt = now;
        this.pendingMusicCtrlMsg = null;
        this.broadcastRaw(msg);
      } else {
        this.pendingMusicCtrlMsg = msg;
        if (this.musicCtrlFlushTimer === null) {
          const wait = Math.max(20, MUSIC_CONTROL_THROTTLE_MS - elapsed);
          this.musicCtrlFlushTimer = window.setTimeout(() => this.flushPendingMusicCtrl(), wait);
        }
      }
      return;
    }

    // Eventos discretos pequeños (SOUND_CUE, SCORE_FLASH, MUSIC_CATALOG, etc.): envío inmediato
    this.broadcastRaw(msg);
  }

  private closeAllConnections() {
    for (const conn of this.connections.values()) {
      try {
        conn.close();
      } catch {
        // ignorar
      }
    }
    this.connections.clear();
    this.lastActivityByConn.clear();
  }

  private destroyPeerOnly() {
    this.clearTimer('signalReconnectTimer');
    this.clearTimer('redialTimer');
    this.clearTimer('connectTimeoutTimer');
    this.clearTimer('stateFlushTimer');
    this.clearTimer('musicCtrlFlushTimer');
    this.pendingStateMsg = null;
    this.pendingMusicCtrlMsg = null;
    this.closeAllConnections();

    if (this.peer) {
      const oldPeer = this.peer;
      this.peer = null;
      try {
        oldPeer.destroy();
      } catch {
        // ignorar
      }
    }
  }

  private destroyAll() {
    this.hostWantsConnection = false;
    this.activeDisplayRoom = '';
    this.targetHostRoom = '';
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.destroyPeerOnly();
    this.currentStatus = 'disconnected';
    this.currentError = null;
    this.role = null;
  }
}

export const peerManager = new PeerSyncSingleton();
