import { createTimerState, normalizeTimerState, type SyncedTimerState } from '../lib/timer';

export const POLYGRAPH_MODULE_ID = 'the-polygraph';
export const POLYGRAPH_DEFAULT_SECONDS = 60;
export const POLYGRAPH_DEFAULT_POINTS = 20;

export type PolygraphVerdict = 'truth' | 'lie';
export type PolygraphPlayerSlot = 'A' | 'B';

export interface PolygraphStatement {
  id: string;
  statement: string;
  verdict: PolygraphVerdict;
  teamId: string | null;
  speakerSlot: PolygraphPlayerSlot;
}

export interface PolygraphState {
  statements: PolygraphStatement[];
  activeStatementId: string | null;
  lockedGuess: PolygraphVerdict | null;
  verdictRevealed: boolean;
  rewardPoints: number;
  awardedPoints: number;
  timer: SyncedTimerState;
}

export function createSamplePolygraphStatements(firstTeamId: string | null): PolygraphStatement[] {
  return [
    {
      id: 'poly_1',
      statement:
        'Una vez entré por error a la recepción de una boda equivocada, comí bocadillos gratis durante 20 minutos y salí sin que nadie lo notara.',
      verdict: 'truth',
      teamId: firstTeamId,
      speakerSlot: 'A',
    },
    {
      id: 'poly_2',
      statement:
        'Nunca en mi vida he visto un solo episodio completo de Stranger Things, Juego de Tronos ni Breaking Bad.',
      verdict: 'lie',
      teamId: firstTeamId,
      speakerSlot: 'B',
    },
    {
      id: 'poly_3',
      statement:
        'A los 12 años intenté cortarme el fleco la noche antes de la foto escolar y culpé al perro de la casa.',
      verdict: 'truth',
      teamId: firstTeamId,
      speakerSlot: 'A',
    },
    {
      id: 'poly_4',
      statement:
        'Me quedé encerrado 40 minutos en el baño de una librería después de la hora de cierre y tuve que llamar por teléfono a la recepción.',
      verdict: 'lie',
      teamId: firstTeamId,
      speakerSlot: 'B',
    },
  ];
}

export function createInitialPolygraphState(firstTeamId: string | null): PolygraphState {
  const statements = createSamplePolygraphStatements(firstTeamId);
  return {
    statements,
    activeStatementId: statements[0]?.id ?? null,
    lockedGuess: null,
    verdictRevealed: false,
    rewardPoints: POLYGRAPH_DEFAULT_POINTS,
    awardedPoints: 0,
    timer: createTimerState(POLYGRAPH_DEFAULT_SECONDS),
  };
}

export function normalizePolygraphState(
  raw: unknown,
  fallbackTeamId: string | null
): PolygraphState {
  if (!raw || typeof raw !== 'object') {
    return createInitialPolygraphState(fallbackTeamId);
  }
  const obj = raw as Partial<PolygraphState>;
  const statements: PolygraphStatement[] = Array.isArray(obj.statements)
    ? obj.statements
        .filter((s): s is PolygraphStatement => Boolean(s && typeof s === 'object' && typeof s.statement === 'string'))
        .map((s, i) => ({
          id: typeof s.id === 'string' && s.id ? s.id : `poly_${i + 1}`,
          statement: s.statement,
          verdict: s.verdict === 'lie' ? 'lie' : 'truth',
          teamId: typeof s.teamId === 'string' && s.teamId.trim() ? s.teamId : fallbackTeamId,
          speakerSlot: s.speakerSlot === 'B' ? 'B' : 'A',
        }))
    : createSamplePolygraphStatements(fallbackTeamId);

  const activeStatementId =
    typeof obj.activeStatementId === 'string' && statements.some((s) => s.id === obj.activeStatementId)
      ? obj.activeStatementId
      : statements[0]?.id ?? null;

  const lockedGuess: PolygraphVerdict | null =
    obj.lockedGuess === 'truth' || obj.lockedGuess === 'lie' ? obj.lockedGuess : null;

  return {
    statements,
    activeStatementId,
    lockedGuess,
    verdictRevealed: Boolean(obj.verdictRevealed),
    rewardPoints:
      typeof obj.rewardPoints === 'number' && obj.rewardPoints > 0
        ? Math.round(obj.rewardPoints)
        : POLYGRAPH_DEFAULT_POINTS,
    awardedPoints:
      typeof obj.awardedPoints === 'number' && Number.isFinite(obj.awardedPoints)
        ? Math.round(obj.awardedPoints)
        : 0,
    timer: normalizeTimerState(obj.timer, POLYGRAPH_DEFAULT_SECONDS),
  };
}
