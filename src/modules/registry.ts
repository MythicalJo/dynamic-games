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

export interface GameModuleMeta {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  accent: 'gold' | 'cyan' | 'rose' | 'emerald';
  status: 'active' | 'slot';
  HostComponent?: React.ComponentType;
  DisplayComponent?: React.ComponentType;
}

/**
 * Central Game Module Registry.
 * Every playable game round plugs in cleanly with its own Host & Display views.
 */
export const GAME_MODULES: GameModuleMeta[] = [
  {
    id: FAST_MONEY_MODULE_ID,
    name: 'Friend Fast Money',
    shortName: 'Friend Fast Money',
    subtitle: '30s • 5 Questions',
    description:
      'Family Feud / Mogul Money speed round: 30s timer, masked live slots, PASS skips, and 2-column flip reveals (+20/+10/0).',
    accent: 'gold',
    status: 'active',
    HostComponent: FastMoneyHost,
    DisplayComponent: FastMoneyDisplay,
  },
  {
    id: CONFIDENCE_AUCTION_MODULE_ID,
    name: 'Confidence Auction',
    shortName: 'Confidence Auction',
    subtitle: 'Subasta de Confianza',
    description:
      'Outbid rival pairs on a category, then race a 30-second clock while a live progress bar fills with every +1 Hit.',
    accent: 'emerald',
    status: 'active',
    HostComponent: ConfidenceAuctionHost,
    DisplayComponent: ConfidenceAuctionDisplay,
  },
  {
    id: MENTAL_SYNC_MODULE_ID,
    name: 'Mental Sync',
    shortName: 'Mental Sync',
    subtitle: 'Sincronía Mental',
    description:
      'Bold centered prompts, optional 15s clock & whiteboard reveals, plus dramatic SYNCED! (+15) / NO MATCH overlays.',
    accent: 'cyan',
    status: 'active',
    HostComponent: MentalSyncHost,
    DisplayComponent: MentalSyncDisplay,
  },
  {
    id: POLYGRAPH_MODULE_ID,
    name: 'The Polygraph',
    shortName: 'The Polygraph',
    subtitle: 'Truth or Lie',
    description:
      '60-second interrogation timer, secret Truth/Lie dossier, friend guess lock-in, and high-impact animated stamp reveal.',
    accent: 'rose',
    status: 'active',
    HostComponent: PolygraphHost,
    DisplayComponent: PolygraphDisplay,
  },
  {
    id: 'rapid-stage',
    name: 'Rapid Stage — Freeform Prompts',
    shortName: 'Rapid Stage',
    subtitle: 'Bonus Q&A Board',
    description:
      'General-purpose Q&A stage board for warm-ups, tiebreakers, and custom bonus questions.',
    accent: 'cyan',
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
