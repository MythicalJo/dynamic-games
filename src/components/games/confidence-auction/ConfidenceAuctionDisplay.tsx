import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Gavel, Target, Trophy, XCircle } from 'lucide-react';
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
    <div className="flex h-full w-full flex-col justify-between px-10 py-7 md:px-16 md:py-9">
      {/* Top Studio Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 px-5 py-2 glow-gold">
            <Gavel className="h-6 w-6 text-amber-300" />
            <span className="font-display text-3xl font-black tracking-wider text-gradient-gold uppercase leading-none">
              {t.auction.title}
            </span>
          </div>
          <span className="hidden font-mono text-sm font-bold tracking-[0.25em] text-cyan-300/90 uppercase lg:inline-block">
            {t.auction.subtitle}
          </span>
        </div>

        {winningTeam && teamAccent && (
          <div
            className={`flex items-center gap-5 rounded-2xl border ${teamAccent.border} bg-studio-900/90 px-5 py-2 backdrop-blur-md ${teamAccent.glow}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`h-3 w-3 rounded-full ${teamAccent.dot}`} />
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase">
                  {t.auction.display.winningBidder}
                </div>
                <div className="font-display text-2xl font-black tracking-wide text-white uppercase leading-none">
                  {winningTeam.name}{' '}
                  <span className={`text-lg font-bold ${teamAccent.text}`}>
                    ({winningTeam.playerA} &amp; {winningTeam.playerB})
                  </span>
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="text-right">
              <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                {t.common.score}
              </div>
              <div className="font-mono text-3xl font-black text-amber-300 leading-none">
                <AnimatedScore value={winningTeam.score} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Stage */}
      <div className="my-auto flex flex-col gap-6 py-4">
        <motion.div
          key={activeCategory?.id ?? 'no-cat'}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-[2rem] border-2 border-cyan-400/40 bg-studio-900/85 px-10 py-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="mb-1.5 font-mono text-sm font-extrabold tracking-[0.3em] text-cyan-300 uppercase">
            {t.auction.display.categoryOnBlock}
          </div>
          <h1
            className="font-display font-black tracking-wide text-white uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            style={{ fontSize: 'clamp(2.5rem, 5.2vw, 4.8rem)', lineHeight: 1.02 }}
          >
            {activeCategory?.title || t.auction.display.selectCategory}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 px-8 py-6 backdrop-blur-xl transition-all ${
              targetHit || auctionState.outcome === 'won'
                ? 'border-emerald-400/85 bg-gradient-to-b from-emerald-500/20 via-studio-900/95 to-studio-950/95 shadow-[0_0_50px_rgba(52,211,153,0.3)]'
                : 'border-amber-400/60 bg-gradient-to-b from-amber-500/15 via-studio-900/95 to-studio-950/95 glow-gold'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-sm font-extrabold tracking-[0.26em] text-amber-300 uppercase">
              <Target className="h-5 w-5" />
              <span>{t.auction.display.currentBidTarget}</span>
            </div>

            <div className="mt-2 flex items-baseline gap-4">
              <motion.span
                key={auctionState.hits}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                className={`font-mono font-black tabular-nums leading-none ${
                  targetHit ? 'text-emerald-300' : 'text-white'
                }`}
                style={{ fontSize: 'clamp(4.5rem, 8.5vw, 7.5rem)' }}
              >
                {auctionState.hits}
              </motion.span>
              <span
                className="font-mono font-extrabold text-slate-500 leading-none"
                style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)' }}
              >
                /
              </span>
              <motion.span
                key={bidTarget}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                className="font-mono font-black text-gradient-gold tabular-nums leading-none"
                style={{ fontSize: 'clamp(4.5rem, 8.5vw, 7.5rem)' }}
              >
                {bidTarget}
              </motion.span>
            </div>

            <div className="mt-2 font-mono text-xs font-bold tracking-[0.25em] text-slate-300 uppercase">
              {t.auction.display.validHitsSub}
            </div>
          </div>

          <motion.div
            animate={
              isCritical && auctionState.timer.isRunning ? { scale: [1, 1.025, 1] } : { scale: 1 }
            }
            transition={{
              repeat: isCritical && auctionState.timer.isRunning ? Infinity : 0,
              duration: 0.6,
            }}
            className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 px-8 py-6 backdrop-blur-xl transition-colors ${
              isTimeUp || isCritical
                ? 'border-rose-500 bg-gradient-to-b from-rose-500/25 via-studio-900/95 to-studio-950/95 shadow-[0_0_55px_rgba(255,51,88,0.4)]'
                : isWarning
                  ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 via-studio-900/95 to-studio-950/95 glow-gold'
                  : 'border-cyan-400/70 bg-gradient-to-b from-cyan-500/15 via-studio-900/95 to-studio-950/95 glow-cyan'
            }`}
          >
            <div className="font-mono text-sm font-extrabold tracking-[0.26em] text-cyan-200 uppercase">
              {auctionState.timer.isRunning
                ? t.auction.display.clockRunning
                : isTimeUp
                  ? t.common.buzzer
                  : t.auction.display.clock30s}
            </div>

            {isTimeUp ? (
              <div
                className="mt-2 text-center font-display font-black tracking-wider text-rose-400 uppercase"
                style={{ fontSize: 'clamp(2.8rem, 5.2vw, 4.6rem)', lineHeight: 1 }}
              >
                {t.common.timesUp}
              </div>
            ) : (
              <div
                className={`mt-2 font-mono font-black tabular-nums leading-none ${
                  isCritical
                    ? 'text-rose-400'
                    : isWarning
                      ? 'text-amber-300'
                      : 'text-white drop-shadow-[0_0_28px_rgba(0,229,255,0.4)]'
                }`}
                style={{ fontSize: 'clamp(4.5rem, 8.5vw, 7.5rem)' }}
              >
                {formatBroadcastTimer(remainingMs)}
              </div>
            )}

            <div className="mt-4 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-[width] duration-75 ${
                  isTimeUp || isCritical
                    ? 'bg-rose-500'
                    : isWarning
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                }`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual Target Progress Bar */}
      <div className="rounded-3xl border border-white/15 bg-studio-900/90 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-2xl font-black tracking-wider text-slate-200 uppercase">
            {t.auction.display.progressMeter}
          </span>

          <AnimatePresence mode="wait">
            {auctionState.outcome === 'won' ? (
              <motion.span
                key="won-pill"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-1 font-mono text-base font-black text-studio-950 shadow-[0_0_25px_rgba(255,201,51,0.55)]"
              >
                <Trophy className="h-5 w-5" />
                {t.auction.display.bidClearedBanner(auctionState.awardedPoints)}
              </motion.span>
            ) : auctionState.outcome === 'failed' ? (
              <motion.span
                key="fail-pill"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-400 bg-rose-500/25 px-5 py-1 font-mono text-base font-black text-rose-200"
              >
                <XCircle className="h-5 w-5" />
                {t.auction.display.bustBanner}
              </motion.span>
            ) : targetHit ? (
              <motion.span
                key="hit-pill"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-400/20 px-5 py-1 font-mono text-base font-black text-emerald-200"
              >
                <CheckCircle2 className="h-5 w-5" />
                {t.auction.display.targetReachedBanner}
              </motion.span>
            ) : (
              <span key="rem-pill" className="font-mono text-lg font-extrabold text-cyan-300">
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
                  animate={{ scale: filled ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                  className={`relative flex h-12 items-center justify-center overflow-hidden rounded-xl border font-mono text-lg font-black transition-all ${
                    filled
                      ? targetHit
                        ? 'border-amber-300 bg-gradient-to-b from-yellow-300 via-amber-400 to-emerald-400 text-studio-950 shadow-[0_0_20px_rgba(255,201,51,0.5)]'
                        : 'border-emerald-300 bg-gradient-to-b from-emerald-300 to-cyan-400 text-studio-950 shadow-[0_0_16px_rgba(52,211,153,0.4)]'
                      : 'border-white/10 bg-studio-950/80 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="relative h-12 w-full overflow-hidden rounded-2xl border border-white/15 bg-studio-950">
            <motion.div
              className={`relative h-full overflow-hidden rounded-xl ${
                targetHit
                  ? 'bg-gradient-to-r from-emerald-400 via-amber-300 to-yellow-400 shadow-[0_0_32px_rgba(255,201,51,0.5)]'
                  : 'bg-gradient-to-r from-cyan-500 via-cyan-300 to-emerald-400 shadow-[0_0_24px_rgba(0,229,255,0.4)]'
              }`}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            >
              <div className="h-full w-1/3 bg-white/30 animate-shimmer" />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xl font-black text-white drop-shadow">
              {Math.round(progressPct)}% ({auctionState.hits} / {bidTarget})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
