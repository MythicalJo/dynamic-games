export type TeamAccent = 'cyan' | 'gold' | 'magenta' | 'emerald' | 'coral' | 'violet';

export type DisplayMode = 'lobby' | 'leaderboard' | 'game';

export type Language = 'es' | 'en';

export type ThemeId = 'blanco' | 'sepia' | 'negro' | 'pizarra';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  bgSwatch: string;
  accentSwatch: string;
}

export const THEMES: ThemeDefinition[] = [
  { id: 'blanco', label: 'Blanco', bgSwatch: '#FFFFFF', accentSwatch: '#2563EB' },
  { id: 'sepia', label: 'Sepia', bgSwatch: '#F4EFE6', accentSwatch: '#C2592B' },
  { id: 'negro', label: 'Negro', bgSwatch: '#0A0A0A', accentSwatch: '#D4AF37' },
  { id: 'pizarra', label: 'Pizarra', bgSwatch: '#111827', accentSwatch: '#34D399' },
];

export const THEME_IDS: ThemeId[] = ['blanco', 'sepia', 'negro', 'pizarra'];

export interface Team {
  id: string;
  name: string;
  playerA: string;
  playerB: string;
  score: number;
  accent: TeamAccent;
}

export interface EventMeta {
  title: string;
  subtitle: string;
  tagline: string;
  lobbyMessage: string;
}

export interface PreparedQuestion {
  id: string;
  category: string;
  prompt: string;
  answer: string;
  points: number;
  hostNote?: string;
}

export interface ActiveStageState {
  roundLabel: string;
  selectedQuestionId: string | null;
  promptVisible: boolean;
  answerRevealed: boolean;
  spotlightTeamId: string | null;
  showBottomScores: boolean;
}

export interface ShowState {
  schemaVersion: 1;
  updatedAt: number;
  eventMeta: EventMeta;
  teams: Team[];
  displayMode: DisplayMode;
  activeModuleId: string;
  questions: PreparedQuestion[];
  stageState: ActiveStageState;
  /** Active UI & display language ('es' default) */
  language: Language;
  /** Active minimalist visual palette synced across /host and /display */
  theme: ThemeId;
  /** Global mute switch synchronized to /display and /host */
  audioMuted: boolean;
  /** Extensible container for custom game modules */
  moduleData: Record<string, unknown>;
}

export interface ScoreFlash {
  id: string;
  teamId: string;
  delta: number;
  timestamp: number;
}

export type SoundCue =
  | 'scoreUp'
  | 'scoreDown'
  | 'switch'
  | 'reveal'
  | 'fanfare'
  | 'exactMatch'
  | 'closeMatch'
  | 'miss'
  | 'pass'
  | 'timerTick'
  | 'timerTock'
  | 'timeUp'
  | 'cardFlip'
  | 'bidHit'
  | 'targetHit'
  | 'stampTruth'
  | 'stampLie';

export interface MusicControlPayload {
  trackId: string | null;
  trackName: string | null;
  isPlaying: boolean;
  loop: boolean;
  volume: number;
  seekTime?: number;
}

export type ClientRole = 'host' | 'display';

export type SyncMessage =
  | {
      type: 'STATE_UPDATE';
      senderId: string;
      role: ClientRole;
      state: ShowState;
    }
  | {
      type: 'REQUEST_STATE';
      senderId: string;
      role: ClientRole;
    }
  | {
      type: 'SCORE_FLASH';
      senderId: string;
      flash: ScoreFlash;
    }
  | {
      type: 'SOUND_CUE';
      senderId: string;
      cue: SoundCue;
    }
  | {
      type: 'MUSIC_TRACK_DATA';
      senderId: string;
      trackId: string;
      name: string;
      mimeType: string;
      buffer: ArrayBuffer;
      control: MusicControlPayload;
    }
  | {
      type: 'MUSIC_CONTROL';
      senderId: string;
      control: MusicControlPayload;
    }
  | {
      type: 'MUSIC_REQUEST';
      senderId: string;
    }
  | {
      type: 'HEARTBEAT';
      senderId: string;
      role: ClientRole;
      timestamp: number;
      audioUnlocked?: boolean;
    }
  | {
      type: 'CLIENT_LEAVE';
      senderId: string;
      role: ClientRole;
    };

export interface AccentStyle {
  label: string;
  hex: string;
  dot: string;
}

/** Refined editorial team swatch markers readable across light & dark palettes */
export const TEAM_ACCENTS: Record<TeamAccent, AccentStyle> = {
  cyan: {
    label: 'Azul real',
    hex: '#2563EB',
    dot: 'bg-blue-600',
  },
  gold: {
    label: 'Ámbar',
    hex: '#D97706',
    dot: 'bg-amber-500',
  },
  magenta: {
    label: 'Ciruela',
    hex: '#9333EA',
    dot: 'bg-purple-600',
  },
  emerald: {
    label: 'Esmeralda',
    hex: '#059669',
    dot: 'bg-emerald-600',
  },
  coral: {
    label: 'Terracota',
    hex: '#DC2626',
    dot: 'bg-red-600',
  },
  violet: {
    label: 'Índigo',
    hex: '#4F46E5',
    dot: 'bg-indigo-600',
  },
};

export const ACCENT_ORDER: TeamAccent[] = [
  'cyan',
  'gold',
  'emerald',
  'coral',
  'magenta',
  'violet',
];
