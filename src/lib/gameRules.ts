import { Activity, Brain, Gavel, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import { FAST_MONEY_MODULE_ID } from '../types/fastMoney';
import { CONFIDENCE_AUCTION_MODULE_ID } from '../types/confidenceAuction';
import { MENTAL_SYNC_MODULE_ID } from '../types/mentalSync';
import { POLYGRAPH_MODULE_ID } from '../types/polygraph';

export interface GameRulesEntry {
  moduleId: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bullets: [string, string, string];
}

export const GAME_RULES_MAP: Record<string, GameRulesEntry> = {
  [FAST_MONEY_MODULE_ID]: {
    moduleId: FAST_MONEY_MODULE_ID,
    title: 'Dinero Rápido',
    subtitle: '30 SEGUNDOS · 5 PREGUNTAS',
    icon: Zap,
    bullets: [
      '30 segundos por ronda para adivinar 5 respuestas de tu amigo.',
      'Primero adivina Jugador A, luego Jugador B.',
      'Al final revelamos todo: +20 exacta, +10 casi igual.',
    ],
  },
  [CONFIDENCE_AUCTION_MODULE_ID]: {
    moduleId: CONFIDENCE_AUCTION_MODULE_ID,
    title: 'Subasta de Confianza',
    subtitle: 'APUESTA Y CONTRA RELOJ',
    icon: Gavel,
    bullets: [
      'Anunciamos una categoría y los equipos subastan cuántos elementos pueden nombrar.',
      'El equipo con la apuesta más alta intenta cumplirla antes de que acabe el tiempo.',
      'Si falla, todos los demás equipos ganan +10 puntos.',
    ],
  },
  [MENTAL_SYNC_MODULE_ID]: {
    moduleId: MENTAL_SYNC_MODULE_ID,
    title: 'Sincronía Mental',
    subtitle: 'PIZARRAS FÍSICAS',
    icon: Brain,
    bullets: [
      'Sale una pregunta en pantalla para todos los equipos.',
      'Cada jugador escribe su respuesta en su pizarra física antes de que acabe el tiempo (sin ver la de su amigo).',
      'A la señal, muestran sus pizarras al mismo tiempo: si escribieron lo mismo, ganan puntos; si no, cero.',
    ],
  },
  [POLYGRAPH_MODULE_ID]: {
    moduleId: POLYGRAPH_MODULE_ID,
    title: 'El Polígrafo',
    subtitle: 'VERDAD O MENTIRA',
    icon: Activity,
    bullets: [
      'Un jugador cuenta una anécdota (verdad o mentira).',
      'Los demás tienen tiempo para hacer preguntas e interrogarlo.',
      'Votan si es verdad o mentira antes de revelar la respuesta.',
    ],
  },
  'rapid-stage': {
    moduleId: 'rapid-stage',
    title: 'Escenario Rápido',
    subtitle: 'RONDA ABIERTA',
    icon: Sparkles,
    bullets: [
      'Aparece una pregunta o reto sorpresa en la pantalla principal.',
      'Los equipos responden antes de revelar la respuesta oficial.',
      'El conductor asigna los puntos en juego al equipo ganador.',
    ],
  },
};

export function getGameRules(moduleId: string | null): GameRulesEntry | null {
  if (!moduleId) return null;
  return GAME_RULES_MAP[moduleId] ?? null;
}
