import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import { TEAM_ACCENTS } from '../../../types/show';
import { AnimatedScore } from '../../shared/AnimatedScore';
import { useConfidenceAuction } from './useConfidenceAuction';

export function ConfidenceAuctionDisplay() {
  const { t } = useShow();
  const { auctionState, winningTeam, activeCategory, remainingMs } = useConfidenceAuction();

  const teamAccent = winningTeam ? TEAM_ACCENTS[winningTeam.accent] : null;
  const bidTarget = Math.max(1, auctionState.bidTarget);
  const progressPct = Math.min(100, (auctionState.hits / bidTarget) * 100);
  const targetHit = auctionState.hits >= bidTarget;
  const isTimeUp = remainingMs === 0;
  const remainingSec = remainingMs / 1000;
  const isCritical = !isTimeUp && remainingSec <= 5;
  const isWarning = !isTimeUp && !isCritical && remainingSec <= 10;

  const totalMs = Math.max(1000, auctionState.timer.totalSeconds * 1000);
  const timerPct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  const showSegments = bidTarget <= 15;

  return (
    <div className="flex h-full w-full flex-col justify-between px-12 py-8 md:px-18 md:py-10">
      {/* Top Editorial Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
            {t.auction.title}
          </h1>
          <span className="hidden rounded-full border border-line bg-surface px-4 py-1 font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase lg:inline-block">
            {t.auction.subtitle}
          </span>
        </div>

        {winningTeam && teamAccent && (
          <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface px-5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: teamAccent.hex }}
              />
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-subtle uppercase">
                  {t.auction.display.winningBidder}
                </div>
                <div className="text-lg font-extrabold text-ink uppercase leading-tight">
                  {winningTeam.name}{' '}
                  <span className="text-sm font-medium text-ink-muted">
                    ({winningTeam.playerA} y {winningTeam.playerB})
                  </span>
                </div>
              </div>
            </div>
            <div className="h-7 w-px bg-line" />
            <div className="font-mono text-2xl font-extrabold text-ink leading-none">
              <AnimatedScore value={winningTeam.score} />
            </div>
          </div>
        )}
      </div>

      {/* Center Stage: Category + Dual Telemetry */}
      <div className="my-auto flex flex-col gap-6 py-4">
        <motion.div
          key={activeCategory?.id ?? 'no-cat'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-line bg-surface px-10 py-8 text-center"
        >
          <div className="mb-2 font-mono text-xs font-bold tracking-[0.28em] text-accent uppercase">
            {t.auction.display.categoryOnBlock}
          </div>
          <h2
            className="font-extrabold tracking-tight text-ink uppercase"
            style={{ fontSize: 'clamp(2.2rem, 4.6vw, 4.2rem)', lineHeight: 1.04 }}
          >
            {activeCategory?.title || t.auction.display.selectCategory}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Bid Target & Hits */}
          <div
            className={`flex flex-col items-center justify-center rounded-3xl border-2 px-8 py-7 transition-colors ${
              targetHit || auctionState.outcome === 'won'
                ? 'border-ok bg-ok-soft'
                : 'border-line bg-surface'
            }`}
          >
            <div className="font-mono text-xs font-bold tracking-[0.24em] text-ink-muted uppercase">
              {t.auction.display.currentBidTarget}
            </div>

            <div className="mt-2 flex items-baseline gap-4">
              <motion.span
                key={auctionState.hits}
                initial={{ scale: 1.18 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className={`font-mono font-extrabold tabular-nums leading-none ${
                  targetHit ? 'text-ok' : 'text-ink'
                }`}
                style={{ fontSize: 'clamp(4.4rem, 8vw, 7rem)' }}
              >
                {auctionState.hits}
              </motion.span>
              <span
                className="font-mono font-semibold text-ink-subtle leading-none"
                style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)' }}
              >
                /
              </span>
              <span
                className="font-mono font-extrabold text-accent tabular-nums leading-none"
                style={{ fontSize: 'clamp(4.4rem, 8vw, 7rem)' }}
              >
                {bidTarget}
              </span>
            </div>

            <div className="mt-2 font-mono text-xs font-semibold tracking-[0.22em] text-ink-subtle uppercase">
              {t.auction.display.validHitsSub}
            </div>
          </div>

          {/* Giant 30s Timer */}
          <div
            className={`flex flex-col items-center justify-center rounded-3xl border-2 px-8 py-7 transition-colors ${
              isTimeUp || isCritical
                ? 'border-err bg-err-soft'
                : isWarning
                  ? 'border-warn bg-warn-soft'
                  : 'border-line bg-surface'
            }`}
          >
            <div className="font-mono text-xs font-bold tracking-[0.24em] text-ink-muted uppercase">
              {auctionState.timer.isRunning
                ? t.auction.display.clockRunning
                : isTimeUp
                  ? t.common.buzzer
                  : t.auction.display.clock30s}
            </div>

            {isTimeUp ? (
              <div
                className="mt-2 text-center font-extrabold tracking-tight text-err uppercase"
                style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4rem)', lineHeight: 1.05 }}
              >
                {t.common.timesUp}
              </div>
            ) : (
              <div
                className={`mt-2 font-mono font-extrabold tabular-nums leading-none ${
                  isCritical ? 'text-err' : isWarning ? 'text-warn' : 'text-ink'
                }`}
                style={{ fontSize: 'clamp(4.4rem, 8vw, 7rem)' }}
              >
                {formatBroadcastTimer(remainingMs)}
              </div>
            )}

            <div className="mt-4 h-2 w-full max-w-sm overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full transition-[width] duration-75 ${
                  isTimeUp || isCritical ? 'bg-err' : isWarning ? 'bg-warn' : 'bg-accent'
                }`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Target Progress Bar */}
      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-[0.22em] text-ink-muted uppercase">
            {t.auction.display.progressMeter}
          </span>

          <AnimatePresence mode="wait">
            {auctionState.outcome === 'won' ? (
              <motion.span
                key="won"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-ok px-4 py-1 font-mono text-sm font-bold text-ok-fg"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                {t.auction.display.bidClearedBanner(auctionState.awardedPoints)}
              </motion.span>
            ) : auctionState.outcome === 'failed' ? (
              <motion.span
                key="fail"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-err px-4 py-1.5 font-mono text-sm font-bold text-err-fg md:text-base"
              >
                <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
                {t.auction.display.bustBanner}
              </motion.span>
            ) : targetHit ? (
              <motion.span
                key="hit"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-ok px-4 py-1 font-mono text-sm font-bold text-ok-fg"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                {t.auction.display.targetReachedBanner}
              </motion.span>
            ) : (
              <span key="rem" className="font-mono text-sm font-bold text-accent">
                {t.auction.display.moreToWin(bidTarget - auctionState.hits)}
              </span>
            )}
          </AnimatePresence>
        </div>

        {showSegments ? (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${bidTarget}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: bidTarget }, (_, idx) => {
              const filled = idx < auctionState.hits;
              return (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{ scale: filled ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex h-12 items-center justify-center rounded-xl border font-mono text-base font-bold transition-colors ${
                    filled
                      ? targetHit
                        ? 'border-ok bg-ok text-ok-fg'
                        : 'border-accent bg-accent text-accent-fg'
                      : 'border-line bg-canvas text-ink-subtle'
                  }`}
                >
                  {idx + 1}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="relative h-12 w-full overflow-hidden rounded-2xl border border-line bg-canvas">
            <motion.div
              className={`h-full rounded-xl ${targetHit ? 'bg-ok' : 'bg-accent'}`}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-base font-extrabold text-ink">
              {Math.round(progressPct)}% ({auctionState.hits} / {bidTarget})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
