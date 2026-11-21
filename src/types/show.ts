export type TeamAccent = 'cyan' | 'gold' | 'magenta' | 'emerald' | 'coral' | 'violet';

export type DisplayMode = 'lobby' | 'leaderboard' | 'game';

export type Language = 'es' | 'en';

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
  /** Active UI & broadcast language synchronized across /host and /display */
  language: Language;
  /** Global mute switch synchronized to /display and /host */
  audioMuted: boolean;
  /** Extensible container for future custom game modules */
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
  | 'timeUp'
  | 'cardFlip'
  | 'bidHit'
  | 'targetHit'
  | 'stampTruth'
  | 'stampLie';

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
  dot: string;
  border: string;
  bgSoft: string;
  text: string;
  glow: string;
  bar: string;
}

export const TEAM_ACCENTS: Record<TeamAccent, AccentStyle> = {
  cyan: {
    label: 'Electric Cyan',
    dot: 'bg-cyan-400',
    border: 'border-cyan-400/50',
    bgSoft: 'bg-cyan-400/10',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_24px_rgba(0,229,255,0.28)]',
    bar: 'from-cyan-400 to-sky-500',
  },
  gold: {
    label: 'Studio Gold',
    dot: 'bg-amber-400',
    border: 'border-amber-400/50',
    bgSoft: 'bg-amber-400/10',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_24px_rgba(255,201,51,0.28)]',
    bar: 'from-yellow-300 to-amber-500',
  },
  magenta: {
    label: 'Neon Magenta',
    dot: 'bg-fuchsia-400',
    border: 'border-fuchsia-400/50',
    bgSoft: 'bg-fuchsia-400/10',
    text: 'text-fuchsia-300',
    glow: 'shadow-[0_0_24px_rgba(232,121,249,0.28)]',
    bar: 'from-fuchsia-400 to-pink-500',
  },
  emerald: {
    label: 'Hyper Emerald',
    dot: 'bg-emerald-400',
    border: 'border-emerald-400/50',
    bgSoft: 'bg-emerald-400/10',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.28)]',
    bar: 'from-emerald-400 to-teal-500',
  },
  coral: {
    label: 'Solar Coral',
    dot: 'bg-rose-400',
    border: 'border-rose-400/50',
    bgSoft: 'bg-rose-400/10',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.28)]',
    bar: 'from-rose-400 to-orange-500',
  },
  violet: {
    label: 'Ultra Violet',
    dot: 'bg-violet-400',
    border: 'border-violet-400/50',
    bgSoft: 'bg-violet-400/10',
    text: 'text-violet-300',
    glow: 'shadow-[0_0_24px_rgba(167,139,250,0.28)]',
    bar: 'from-violet-400 to-indigo-500',
  },
};

export const ACCENT_ORDER: TeamAccent[] = [
  'cyan',
  'gold',
  'magenta',
  'emerald',
  'coral',
  'violet',
];
