import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';
import type {
  ClientRole,
  RemoteConnectionStatus,
  ShowState,
  SyncMessage,
} from '../types/show';

export const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
export const MQTT_TOPIC_PREFIX = 'mythicaljo/dynamic-games';

const DISPLAY_ROOM_STORAGE_KEY = 'puntos_rapidos_display_room_v1';
const HOST_LAST_ROOM_STORAGE_KEY = 'puntos_rapidos_host_room_v1';

// 24 letras claras sin caracteres ambiguos (sin I ni O)
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const PRESENCE_INTERVAL_MS = 8000;
const PRESENCE_TTL_MS = 24000;
const STATE_THROTTLE_MS = 80;
const MUSIC_CONTROL_THROTTLE_MS = 80;

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

export function getRoomTopics(roomCode: string) {
  const code = normalizeRoomCode(roomCode);
  const base = `${MQTT_TOPIC_PREFIX}/${code}`;
  return {
    state: `${base}/state`,
    sfx: `${base}/sfx`,
    music: `${base}/music`,
    presence: `${base}/presence`,
  };
}

/**
 * Compensa pequeñas diferencias de reloj entre el celular (/host) y la PC (/display)
 * en entregas en vivo (no retenidas) para mantener sincronizados los temporizadores.
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

  let nextTiebreaker = state.tiebreaker;
  if (
    nextTiebreaker?.timer?.isRunning === true &&
    typeof nextTiebreaker.timer.startedAt === 'number'
  ) {
    nextTiebreaker = {
      ...nextTiebreaker,
      timer: {
        ...nextTiebreaker.timer,
        startedAt: nextTiebreaker.timer.startedAt + offsetMs,
      },
    };
    mutated = true;
  }

  return mutated
    ? { ...state, moduleData: nextModuleData, tiebreaker: nextTiebreaker }
    : state;
}

export interface RemotePeerPresence {
  role: ClientRole;
  lastSeen: number;
  audioUnlocked?: boolean;
}

export interface MqttSyncHandlers {
  clientId: string;
  getAudioUnlocked: () => boolean;
  onMessage: (msg: SyncMessage, isRetained: boolean) => void;
  onStatusChange: (status: RemoteConnectionStatus, error: string | null) => void;
  onRemotePeersChange: (peers: Record<string, RemotePeerPresence>) => void;
  onBrokerConnected: () => void;
  onRoomCodeChange?: (roomCode: string) => void;
}

function createUniqueMqttClientId(role: ClientRole): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 14)
      : `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  return `dg_${role}_${rand}`;
}

/**
 * Gestor singleton de MQTT sobre WebSockets (EMQX) completamente aislado de React.
 * - Mantiene el `MqttClient` fuera de los re-renders de React para que los cambios
 *   de puntaje, temporizador o preguntas nunca desconecten ni recreen el cliente.
 * - Tópicos por sala:
 *   • `mythicaljo/dynamic-games/${roomCode}/state` (retain: true)
 *   • `mythicaljo/dynamic-games/${roomCode}/sfx`   (retain: false)
 *   • `mythicaljo/dynamic-games/${roomCode}/music` (retain: false)
 *   • `mythicaljo/dynamic-games/${roomCode}/presence` (retain: false)
 */
class MqttSyncSingleton {
  private role: ClientRole | null = null;
  private handlers: MqttSyncHandlers | null = null;
  private client: MqttClient | null = null;
  private activeRoomCode = '';
  private wantsConnection = false;

  private currentStatus: RemoteConnectionStatus = 'disconnected';
  private currentError: string | null = null;
  private remotePeers: Record<string, RemotePeerPresence> = {};

  private presenceTimer: number | null = null;
  private pruneTimer: number | null = null;
  private teardownGraceTimer: number | null = null;

  // Leading + trailing throttle para evitar saturar el broker al teclear rápido o mover volumen
  private lastStateSentAt = 0;
  private pendingStateMsg: SyncMessage | null = null;
  private stateFlushTimer: number | null = null;

  private lastMusicCtrlSentAt = 0;
  private pendingMusicCtrlMsg: SyncMessage | null = null;
  private musicCtrlFlushTimer: number | null = null;

  attachHandlers(role: ClientRole, handlers: MqttSyncHandlers) {
    if (this.teardownGraceTimer !== null) {
      window.clearTimeout(this.teardownGraceTimer);
      this.teardownGraceTimer = null;
    }

    // Si el usuario navegó entre /host y /display en la misma pestaña, reiniciar limpio
    if (this.role !== null && this.role !== role) {
      this.disconnect();
    }

    this.role = role;
    this.handlers = handlers;

    // Sincronizar inmediatamente estado actual de conexión hacia React
    handlers.onStatusChange(
      this.client?.connected ? 'connected' : this.currentStatus,
      this.currentError
    );
    handlers.onRemotePeersChange({ ...this.remotePeers });
    if (this.activeRoomCode) {
      handlers.onRoomCodeChange?.(this.activeRoomCode);
    }
  }

  detachHandlers(clientId: string) {
    if (this.handlers?.clientId !== clientId) return;
    this.handlers = null;

    // Ventana de gracia de 400ms para sobrevivir al doble-montaje de React StrictMode
    if (this.teardownGraceTimer !== null) {
      window.clearTimeout(this.teardownGraceTimer);
    }
    this.teardownGraceTimer = window.setTimeout(() => {
      this.teardownGraceTimer = null;
      if (!this.handlers) {
        this.disconnect();
      }
    }, 400);
  }

  get isConnected(): boolean {
    return Boolean(this.client?.connected);
  }

  private setStatus(status: RemoteConnectionStatus, error: string | null = null) {
    this.currentStatus = status;
    this.currentError = error;
    this.handlers?.onStatusChange(status, error);
  }

  private clearFlushTimers() {
    if (this.stateFlushTimer !== null) {
      window.clearTimeout(this.stateFlushTimer);
      this.stateFlushTimer = null;
    }
    if (this.musicCtrlFlushTimer !== null) {
      window.clearTimeout(this.musicCtrlFlushTimer);
      this.musicCtrlFlushTimer = null;
    }
    this.pendingStateMsg = null;
    this.pendingMusicCtrlMsg = null;
  }

  private stopLoops() {
    if (this.presenceTimer !== null) {
      window.clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
    if (this.pruneTimer !== null) {
      window.clearInterval(this.pruneTimer);
      this.pruneTimer = null;
    }
  }

  private startLoops() {
    this.stopLoops();

    this.presenceTimer = window.setInterval(() => {
      if (this.client?.connected && this.role && this.handlers) {
        this.publishPresenceHeartbeat();
      }
    }, PRESENCE_INTERVAL_MS);

    this.pruneTimer = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, info] of Object.entries(this.remotePeers)) {
        if (now - info.lastSeen > PRESENCE_TTL_MS) {
          delete this.remotePeers[id];
          changed = true;
        }
      }
      if (changed) {
        this.handlers?.onRemotePeersChange({ ...this.remotePeers });
      }
    }, 5000);
  }

  private touchRemotePeer(senderId: string, role: ClientRole, audioUnlocked?: boolean) {
    const prev = this.remotePeers[senderId];
    const nextAudio = audioUnlocked !== undefined ? audioUnlocked : prev?.audioUnlocked;
    const changed = !prev || prev.role !== role || prev.audioUnlocked !== nextAudio;
    this.remotePeers[senderId] = {
      role,
      lastSeen: Date.now(),
      audioUnlocked: nextAudio,
    };
    if (changed) {
      this.handlers?.onRemotePeersChange({ ...this.remotePeers });
    }
  }

  private publishPresenceHeartbeat() {
    if (!this.client?.connected || !this.activeRoomCode || !this.role || !this.handlers) return;
    const topics = getRoomTopics(this.activeRoomCode);
    const payload: SyncMessage = {
      type: 'HEARTBEAT',
      senderId: this.handlers.clientId,
      role: this.role,
      timestamp: Date.now(),
      audioUnlocked: this.handlers.getAudioUnlocked(),
    };
    this.publishRaw(topics.presence, payload, false);
  }

  /**
   * Conecta (o reutiliza la conexión activa) a la sala de 4 letras indicada.
   */
  connect(role: ClientRole, rawCode: string, forceReconnect = false) {
    const code = normalizeRoomCode(rawCode);
    if (code.length !== 4) {
      this.setStatus('error', 'Ingresa un código de 4 letras.');
      return;
    }

    // Idempotente: si ya existe un cliente conectado/conectando a esa misma sala, NO recrearlo
    if (
      !forceReconnect &&
      this.client &&
      this.role === role &&
      this.activeRoomCode === code &&
      this.wantsConnection
    ) {
      if (this.client.connected) {
        this.setStatus('connected', null);
      }
      return;
    }

    this.teardownClientOnly();
    this.role = role;
    this.activeRoomCode = code;
    this.wantsConnection = true;
    this.remotePeers = {};
    this.handlers?.onRemotePeersChange({});

    if (role === 'display') {
      saveDisplayRoomCode(code);
    } else {
      saveLastHostRoomCode(code);
    }
    this.handlers?.onRoomCodeChange?.(code);
    this.setStatus('connecting', null);

    const topics = getRoomTopics(code);
    const options: IClientOptions = {
      clientId: createUniqueMqttClientId(role),
      keepalive: 30,
      reconnectPeriod: 2000,
      connectTimeout: 10000,
      clean: true,
      resubscribe: true,
    };

    const client = mqtt.connect(MQTT_BROKER_URL, options);
    this.client = client;

    client.on('connect', () => {
      if (this.client !== client) return;
      this.setStatus('connected', null);

      client.subscribe(
        [topics.state, topics.sfx, topics.music, topics.presence],
        { qos: 0 },
        (err) => {
          if (this.client !== client) return;
          if (err) {
            this.setStatus('error', 'Error al suscribirse a la sala MQTT.');
            return;
          }
          this.publishPresenceHeartbeat();
          this.handlers?.onBrokerConnected();
        }
      );

      this.startLoops();
    });

    client.on('reconnect', () => {
      if (this.client !== client) return;
      if (this.wantsConnection) {
        this.setStatus('reconnecting', null);
      }
    });

    client.on('offline', () => {
      if (this.client !== client) return;
      if (this.wantsConnection) {
        this.setStatus('reconnecting', null);
      }
    });

    client.on('close', () => {
      if (this.client !== client) return;
      if (!this.wantsConnection) {
        this.setStatus('disconnected', null);
      } else if (!client.connected) {
        this.setStatus('reconnecting', null);
      }
    });

    client.on('error', () => {
      if (this.client !== client) return;
      if (!client.connected && this.wantsConnection) {
        this.setStatus('reconnecting', 'Reconectando con servidor MQTT...');
      }
    });

    client.on('message', (_topic, payloadBuffer, packet) => {
      if (this.client !== client) return;
      let parsed: SyncMessage | null = null;
      try {
        const text =
          typeof payloadBuffer === 'string'
            ? payloadBuffer
            : new TextDecoder().decode(payloadBuffer);
        if (!text) return;
        parsed = JSON.parse(text) as SyncMessage;
      } catch {
        return;
      }

      if (!parsed || typeof parsed !== 'object') return;
      if (parsed.senderId === this.handlers?.clientId) return;

      const isRetained = Boolean(packet?.retain);

      if (parsed.type === 'HEARTBEAT') {
        this.touchRemotePeer(parsed.senderId, parsed.role, parsed.audioUnlocked);
        this.handlers?.onMessage(parsed, isRetained);
        return;
      }

      if (parsed.type === 'CLIENT_LEAVE') {
        if (this.remotePeers[parsed.senderId]) {
          delete this.remotePeers[parsed.senderId];
          this.handlers?.onRemotePeersChange({ ...this.remotePeers });
        }
        return;
      }

      if (parsed.type === 'STATE_UPDATE') {
        this.touchRemotePeer(parsed.senderId, parsed.role);
        const finalState = isRetained
          ? parsed.state
          : adjustRemoteStateTimers(parsed.state, parsed.sentAt);
        this.handlers?.onMessage({ ...parsed, state: finalState }, isRetained);
        return;
      }

      if (parsed.type === 'REQUEST_STATE') {
        this.touchRemotePeer(parsed.senderId, parsed.role);
        this.publishPresenceHeartbeat();
        this.handlers?.onMessage(parsed, isRetained);
        return;
      }

      this.handlers?.onMessage(parsed, isRetained);
    });
  }

  ensureDisplayRoom(requestedCode?: string, forceNew = false) {
    const code = forceNew
      ? generateRoomCode(4)
      : normalizeRoomCode(requestedCode || this.activeRoomCode || getOrCreateDisplayRoomCode()) ||
        generateRoomCode(4);
    this.connect('display', code, forceNew);
  }

  regenerateDisplayRoom() {
    this.ensureDisplayRoom(undefined, true);
  }

  disconnect() {
    if (this.client?.connected && this.activeRoomCode && this.role && this.handlers) {
      const topics = getRoomTopics(this.activeRoomCode);
      this.publishRaw(
        topics.presence,
        {
          type: 'CLIENT_LEAVE',
          senderId: this.handlers.clientId,
          role: this.role,
        },
        false
      );
    }

    this.wantsConnection = false;
    if (this.role === 'host') {
      saveLastHostRoomCode('');
    }
    this.activeRoomCode = '';
    this.remotePeers = {};
    this.handlers?.onRemotePeersChange({});
    this.teardownClientOnly();
    this.setStatus('disconnected', null);
  }

  private teardownClientOnly() {
    this.clearFlushTimers();
    this.stopLoops();
    if (this.client) {
      const old = this.client;
      this.client = null;
      try {
        old.removeAllListeners();
        old.end(true);
      } catch {
        // ignorar
      }
    }
  }

  private resolveTopicAndRetain(msg: SyncMessage): { topic: string; retain: boolean } | null {
    if (!this.activeRoomCode) return null;
    const topics = getRoomTopics(this.activeRoomCode);

    switch (msg.type) {
      case 'STATE_UPDATE':
        return { topic: topics.state, retain: true };
      case 'SOUND_CUE':
      case 'SCORE_FLASH':
        return { topic: topics.sfx, retain: false };
      case 'MUSIC_CONTROL':
      case 'MUSIC_CATALOG':
      case 'MUSIC_REMOVE':
      case 'MUSIC_REQUEST':
        return { topic: topics.music, retain: false };
      case 'HEARTBEAT':
      case 'REQUEST_STATE':
      case 'CLIENT_LEAVE':
      case 'PING':
      case 'PONG':
        return { topic: topics.presence, retain: false };
      default:
        return null;
    }
  }

  private publishRaw(topic: string, msg: SyncMessage, retain: boolean) {
    if (!this.client?.connected) return;
    try {
      const payload =
        msg.type === 'STATE_UPDATE' ? { ...msg, sentAt: Date.now() } : msg;
      this.client.publish(topic, JSON.stringify(payload), { qos: 0, retain });
    } catch {
      // ignorar si el socket se está reconectando
    }
  }

  /**
   * Publicación inmediata (sin throttle), usada al conectar/reconectar para empujar estado completo.
   */
  publishImmediate(msg: SyncMessage) {
    if (msg.type === 'MUSIC_TRACK_DATA' || !this.client?.connected) return;
    const target = this.resolveTopicAndRetain(msg);
    if (!target) return;
    if (msg.type === 'STATE_UPDATE') {
      this.lastStateSentAt = Date.now();
      this.pendingStateMsg = null;
      if (this.stateFlushTimer !== null) {
        window.clearTimeout(this.stateFlushTimer);
        this.stateFlushTimer = null;
      }
    }
    this.publishRaw(target.topic, msg, target.retain);
  }

  private flushPendingState() {
    this.stateFlushTimer = null;
    if (!this.pendingStateMsg || !this.client?.connected) return;
    const msg = this.pendingStateMsg;
    this.pendingStateMsg = null;
    this.lastStateSentAt = Date.now();
    const target = this.resolveTopicAndRetain(msg);
    if (target) this.publishRaw(target.topic, msg, target.retain);
  }

  private flushPendingMusicCtrl() {
    this.musicCtrlFlushTimer = null;
    if (!this.pendingMusicCtrlMsg || !this.client?.connected) return;
    const msg = this.pendingMusicCtrlMsg;
    this.pendingMusicCtrlMsg = null;
    this.lastMusicCtrlSentAt = Date.now();
    const target = this.resolveTopicAndRetain(msg);
    if (target) this.publishRaw(target.topic, msg, target.retain);
  }

  send(msg: SyncMessage) {
    // Nunca enviar archivos binarios de audio por el broker MQTT público
    if (msg.type === 'MUSIC_TRACK_DATA' || !this.client?.connected) return;
    const target = this.resolveTopicAndRetain(msg);
    if (!target) return;

    if (msg.type === 'STATE_UPDATE') {
      const now = Date.now();
      const elapsed = now - this.lastStateSentAt;
      if (elapsed >= STATE_THROTTLE_MS && this.stateFlushTimer === null) {
        this.lastStateSentAt = now;
        this.pendingStateMsg = null;
        this.publishRaw(target.topic, msg, target.retain);
      } else {
        this.pendingStateMsg = msg;
        if (this.stateFlushTimer === null) {
          const wait = Math.max(20, STATE_THROTTLE_MS - elapsed);
          this.stateFlushTimer = window.setTimeout(() => this.flushPendingState(), wait);
        }
      }
      return;
    }

    if (msg.type === 'MUSIC_CONTROL') {
      const now = Date.now();
      const elapsed = now - this.lastMusicCtrlSentAt;
      if (elapsed >= MUSIC_CONTROL_THROTTLE_MS && this.musicCtrlFlushTimer === null) {
        this.lastMusicCtrlSentAt = now;
        this.pendingMusicCtrlMsg = null;
        this.publishRaw(target.topic, msg, target.retain);
      } else {
        this.pendingMusicCtrlMsg = msg;
        if (this.musicCtrlFlushTimer === null) {
          const wait = Math.max(20, MUSIC_CONTROL_THROTTLE_MS - elapsed);
          this.musicCtrlFlushTimer = window.setTimeout(() => this.flushPendingMusicCtrl(), wait);
        }
      }
      return;
    }

    this.publishRaw(target.topic, msg, target.retain);
  }
}

export const mqttManager = new MqttSyncSingleton();
