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
  bidTarget: number;
  winningTeamId: string | null;
  hits: number;
  rewardPoints: number;
  awardedPoints: number;
  outcome: AuctionOutcome;
  timer: SyncedTimerState;
}

export const SAMPLE_AUCTION_CATEGORIES: AuctionCategory[] = [
  {
    id: 'cat_fridge',
    title: "Things in Your Friend's Fridge Right Now",
    hint: 'Condiments, leftovers, mystery jars — anything goes!',
  },
  {
    id: 'cat_2000s_songs',
    title: '2000s Songs Everyone Knows',
    hint: 'Title or artist — fast fire!',
  },
  {
    id: 'cat_late_excuses',
    title: 'Classic Excuses for Being Late',
    hint: 'From traffic to "my dog hid my keys"',
  },
  {
    id: 'cat_pizza_toppings',
    title: 'Pizza Toppings (Good or Controversial)',
    hint: 'No repeats allowed!',
  },
  {
    id: 'cat_movies_quoted',
    title: 'Movies Everyone in This Room Has Seen',
    hint: 'Animated, classics, blockbusters!',
  },
  {
    id: 'cat_bag_items',
    title: 'Things Inside a Car Glovebox or Backpack',
    hint: 'Receipts, chargers, mystery coins...',
  },
];

export function createInitialConfidenceAuctionState(
  firstTeamId: string | null
): ConfidenceAuctionState {
  return {
    categories: SAMPLE_AUCTION_CATEGORIES.map((c) => ({ ...c })),
    selectedCategoryId: SAMPLE_AUCTION_CATEGORIES[0].id,
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
    : SAMPLE_AUCTION_CATEGORIES.map((c) => ({ ...c }));

  const selectedCategoryId =
    typeof obj.selectedCategoryId === 'string' && categories.some((c) => c.id === obj.selectedCategoryId)
      ? obj.selectedCategoryId
      : categories[0]?.id ?? null;

  const outcome: AuctionOutcome =
    obj.outcome === 'won' || obj.outcome === 'failed' ? obj.outcome : 'pending';

  return {
    categories,
    selectedCategoryId,
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
