import { AUCTION_CATEGORY_BANK } from '../lib/spanishBank';
import { createTimerState, normalizeTimerState, type SyncedTimerState } from '../lib/timer';

export const CONFIDENCE_AUCTION_MODULE_ID = 'confidence-auction';
export const AUCTION_DEFAULT_SECONDS = 30;
export const AUCTION_DEFAULT_REWARD_POINTS = 25;

export interface AuctionCategory {
  id: string;
  title: string;
  hint?: string;
}

export type AuctionOutcome = 'pending' | 'won' | 'failed';

export interface ConfidenceAuctionState {
  categories: AuctionCategory[];
  selectedCategoryId: string | null;
  /** Historial de categorías ya jugadas para que "Categoría al azar" evite repetir */
  usedCategoryIds: string[];
  bidTarget: number;
  winningTeamId: string | null;
  hits: number;
  rewardPoints: number;
  awardedPoints: number;
  outcome: AuctionOutcome;
  timer: SyncedTimerState;
}

export const SAMPLE_AUCTION_CATEGORIES: AuctionCategory[] = AUCTION_CATEGORY_BANK;

export function createInitialConfidenceAuctionState(
  firstTeamId: string | null
): ConfidenceAuctionState {
  const firstId = AUCTION_CATEGORY_BANK[0]?.id ?? null;
  return {
    categories: AUCTION_CATEGORY_BANK.map((c) => ({ ...c })),
    selectedCategoryId: firstId,
    usedCategoryIds: firstId ? [firstId] : [],
    bidTarget: 8,
    winningTeamId: firstTeamId,
    hits: 0,
    rewardPoints: AUCTION_DEFAULT_REWARD_POINTS,
    awardedPoints: 0,
    outcome: 'pending',
    timer: createTimerState(AUCTION_DEFAULT_SECONDS),
  };
}

export function normalizeConfidenceAuctionState(
  raw: unknown,
  fallbackTeamId: string | null
): ConfidenceAuctionState {
  if (!raw || typeof raw !== 'object') {
    return createInitialConfidenceAuctionState(fallbackTeamId);
  }
  const obj = raw as Partial<ConfidenceAuctionState>;
  const categories: AuctionCategory[] = Array.isArray(obj.categories)
    ? obj.categories
        .filter((c): c is AuctionCategory => Boolean(c && typeof c === 'object' && typeof c.title === 'string'))
        .map((c, i) => ({
          id: typeof c.id === 'string' && c.id ? c.id : `cat_${i + 1}`,
          title: c.title,
          hint: typeof c.hint === 'string' ? c.hint : undefined,
        }))
    : AUCTION_CATEGORY_BANK.map((c) => ({ ...c }));

  const selectedCategoryId =
    typeof obj.selectedCategoryId === 'string' && categories.some((c) => c.id === obj.selectedCategoryId)
      ? obj.selectedCategoryId
      : categories[0]?.id ?? null;

  const validIds = new Set(categories.map((c) => c.id));
  const usedCategoryIds = Array.isArray(obj.usedCategoryIds)
    ? Array.from(
        new Set(
          obj.usedCategoryIds.filter(
            (id): id is string => typeof id === 'string' && validIds.has(id)
          )
        )
      )
    : selectedCategoryId
      ? [selectedCategoryId]
      : [];

  const outcome: AuctionOutcome =
    obj.outcome === 'won' || obj.outcome === 'failed' ? obj.outcome : 'pending';

  return {
    categories,
    selectedCategoryId,
    usedCategoryIds,
    bidTarget: typeof obj.bidTarget === 'number' && obj.bidTarget >= 1 ? Math.round(obj.bidTarget) : 8,
    winningTeamId:
      typeof obj.winningTeamId === 'string' && obj.winningTeamId.trim()
        ? obj.winningTeamId
        : fallbackTeamId,
    hits: typeof obj.hits === 'number' && obj.hits >= 0 ? Math.round(obj.hits) : 0,
    rewardPoints:
      typeof obj.rewardPoints === 'number' && obj.rewardPoints > 0
        ? Math.round(obj.rewardPoints)
        : AUCTION_DEFAULT_REWARD_POINTS,
    awardedPoints:
      typeof obj.awardedPoints === 'number' && Number.isFinite(obj.awardedPoints)
        ? Math.round(obj.awardedPoints)
        : 0,
    outcome,
    timer: normalizeTimerState(obj.timer, AUCTION_DEFAULT_SECONDS),
  };
}
