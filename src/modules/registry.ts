import type React from 'react';
import { RapidStageDisplay } from '../components/display/RapidStageDisplay';
import { RapidStageHost } from '../components/games/rapid-stage/RapidStageHost';
import { FastMoneyDisplay } from '../components/games/fast-money/FastMoneyDisplay';
import { FastMoneyHost } from '../components/games/fast-money/FastMoneyHost';
import { ConfidenceAuctionDisplay } from '../components/games/confidence-auction/ConfidenceAuctionDisplay';
import { ConfidenceAuctionHost } from '../components/games/confidence-auction/ConfidenceAuctionHost';
import { MentalSyncDisplay } from '../components/games/mental-sync/MentalSyncDisplay';
import { MentalSyncHost } from '../components/games/mental-sync/MentalSyncHost';
import { PolygraphDisplay } from '../components/games/polygraph/PolygraphDisplay';
import { PolygraphHost } from '../components/games/polygraph/PolygraphHost';
import { FAST_MONEY_MODULE_ID } from '../types/fastMoney';
import { CONFIDENCE_AUCTION_MODULE_ID } from '../types/confidenceAuction';
import { MENTAL_SYNC_MODULE_ID } from '../types/mentalSync';
import { POLYGRAPH_MODULE_ID } from '../types/polygraph';

export interface GameHostProps {
  mode: 'live' | 'setup';
}

export interface GameModuleMeta {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  status: 'active' | 'slot';
  HostComponent?: React.ComponentType<GameHostProps>;
  DisplayComponent?: React.ComponentType;
}

export const GAME_MODULES: GameModuleMeta[] = [
  {
    id: FAST_MONEY_MODULE_ID,
    name: 'Dinero Rápido',
    shortName: 'Dinero Rápido',
    subtitle: '30s · 5 Preguntas',
    description: 'Ronda relámpago de 30s con respuestas ocultas, botón PASO y revelación.',
    status: 'active',
    HostComponent: FastMoneyHost,
    DisplayComponent: FastMoneyDisplay,
  },
  {
    id: CONFIDENCE_AUCTION_MODULE_ID,
    name: 'Subasta de Confianza',
    shortName: 'Subasta de Confianza',
    subtitle: 'Apuesta y 30s',
    description: 'Subasta cuántas respuestas logras en 30 segundos y completa la barra.',
    status: 'active',
    HostComponent: ConfidenceAuctionHost,
    DisplayComponent: ConfidenceAuctionDisplay,
  },
  {
    id: MENTAL_SYNC_MODULE_ID,
    name: 'Sincronía Mental',
    shortName: 'Sincronía Mental',
    subtitle: 'Telepatía',
    description: 'Frases en pantalla, reloj opcional de 15s y avisos de sincronía.',
    status: 'active',
    HostComponent: MentalSyncHost,
    DisplayComponent: MentalSyncDisplay,
  },
  {
    id: POLYGRAPH_MODULE_ID,
    name: 'El Polígrafo',
    shortName: 'El Polígrafo',
    subtitle: 'Verdad o Mentira',
    description: 'Interrogatorio de 60 segundos y sello animado de Verdad o Mentira.',
    status: 'active',
    HostComponent: PolygraphHost,
    DisplayComponent: PolygraphDisplay,
  },
  {
    id: 'rapid-stage',
    name: 'Escenario Rápido',
    shortName: 'Escenario Rápido',
    subtitle: 'Preguntas Libres',
    description: 'Tablero de preguntas abiertas y revelaciones para rondas extra.',
    status: 'active',
    HostComponent: RapidStageHost,
    DisplayComponent: RapidStageDisplay,
  },
];

export function getActiveGameModule(moduleId: string): GameModuleMeta {
  return (
    GAME_MODULES.find((m) => m.id === moduleId && m.status === 'active') ??
    GAME_MODULES[0]
  );
}
