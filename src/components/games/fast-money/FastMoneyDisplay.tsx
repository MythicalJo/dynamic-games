import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FastForward, Flame, Lock, Sparkles, Trophy, XCircle, Zap } from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { TEAM_ACCENTS } from '../../../types/show';
import { AnimatedScore } from '../../shared/AnimatedScore';
import { useFastMoney } from './useFastMoney';

function formatDisplayClock(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe === 0) return '00';
  if (safe < 10000) return (safe / 1000).toFixed(1);
  return String(Math.ceil(safe / 1000)).padStart(2, '0');
}

export function FastMoneyDisplay() {
  const { t } = useShow();
  const {
    fmState,
    selectedTeam,
    activeSession,
    activeRoundState,
    remainingMs,
    activeRoundTotal,
    combinedTotal,
    guessingPlayerName,
    secretOwnerName,
    getActualAnswerForRound,
  } = useFastMoney();

  if (!selectedTeam) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-12 text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-400/50 bg-amber-400/15 glow-gold">
          <Flame className="h-12 w-12 text-amber-300" />
        </div>
        <h1 className="font-display text-7xl font-black tracking-wide text-gradient-gold uppercase">
          {t.fastMoney.title}
        </h1>
        <p className="mt-3 font-display text-2xl font-bold tracking-[0.2em] text-cyan-300 uppercase">
          {t.fastMoney.display.selectPair}
        </p>
      </div>
    );
  }

  const teamAccent = TEAM_ACCENTS[selectedTeam.accent];
  const remainingSec = remainingMs / 1000;
  const totalMs = Math.max(1000, fmState.timer.totalSeconds * 1000);
  const progressPct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  const isTimeUp = remainingMs === 0;
  const isCritical = !isTimeUp && remainingSec <= 5;
  const isWarning = !isTimeUp && !isCritical && remainingSec <= 10;

  const answeredCount = activeRoundState.slots.filter((s) => s.status === 'answered').length;
  const passedCount = activeRoundState.slots.filter((s) => s.status === 'passed').length;

  return (
    <div className="flex h-full w-full flex-col justify-between px-8 py-6 md:px-14 md:py-8">
      {/* TOP BROADCAST HEADER */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 px-5 py-2 glow-gold">
            <Flame className="h-6 w-6 text-amber-300" />
            <span className="font-display text-3xl font-black tracking-wider text-gradient-gold uppercase leading-none">
              {t.fastMoney.title}
            </span>
          </div>

          <div className="rounded-xl border border-cyan-400/45 bg-cyan-400/15 px-4 py-1.5 font-mono text-sm font-extrabold tracking-[0.22em] text-cyan-200 uppercase">
            {t.fastMoney.live.roundOfTwo(fmState.activeRound)}
          </div>
        </div>

        <div
          className={`flex items-center gap-5 rounded-2xl border ${teamAccent.border} bg-studio-900/90 px-5 py-2 backdrop-blur-md ${teamAccent.glow}`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`h-3 w-3 rounded-full ${teamAccent.dot}`} />
            <div>
              <div className="font-display text-2xl font-black tracking-wide text-white uppercase leading-none">
                {selectedTeam.name}
              </div>
              <div className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                {selectedTeam.playerA} &amp; {selectedTeam.playerB}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/15" />

          <div className="text-right">
            <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              {t.common.teamScore}
            </div>
            <div className="font-mono text-3xl font-black text-amber-300 leading-none">
              <AnimatedScore value={selectedTeam.score} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN STAGE */}
      <AnimatePresence mode="wait">
        {fmState.phase === 'play' ? (
          <motion.div
            key="fm-play-stage"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.35 }}
            className="grid flex-1 grid-cols-1 items-center gap-8 py-6 lg:grid-cols-12"
          >
            {/* LEFT HERO: Active Player + GIANT Countdown Timer */}
            <div className="flex flex-col items-center justify-center text-center lg:col-span-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-studio-900/85 px-5 py-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    fmState.timer.isRunning ? 'animate-ping bg-rose-400' : 'bg-cyan-400'
                  }`}
                />
                <span className="font-mono text-sm font-extrabold tracking-[0.25em] text-cyan-200 uppercase">
                  {fmState.timer.isRunning
                    ? t.fastMoney.display.onTheClock
                    : isTimeUp
                      ? t.common.buzzer
                      : t.fastMoney.display.upToPlay}
                </span>
              </div>

              <h2
                className="font-display font-black tracking-wide text-white uppercase drop-shadow-[0_6px_28px_rgba(0,229,255,0.25)]"
                style={{ fontSize: 'clamp(3.2rem, 6vw, 5.5rem)', lineHeight: 0.95 }}
              >
                {guessingPlayerName}
              </h2>
              <p className="mt-2 font-display text-2xl font-bold tracking-[0.14em] text-amber-300 uppercase">
                {t.fastMoney.display.guessingAnswers(secretOwnerName)}
              </p>

              <motion.div
                animate={
                  isCritical && fmState.timer.isRunning ? { scale: [1, 1.03, 1] } : { scale: 1 }
                }
                transition={{
                  repeat: isCritical && fmState.timer.isRunning ? Infinity : 0,
                  duration: 0.6,
                }}
                className={`relative mt-7 flex w-full max-w-md flex-col items-center overflow-hidden rounded-[2.25rem] border-2 px-8 py-8 backdrop-blur-xl transition-colors ${
                  isTimeUp || isCritical
                    ? 'border-rose-500 bg-gradient-to-b from-rose-500/25 via-studio-900/95 to-studio-950/95 shadow-[0_0_65px_rgba(255,51,88,0.45)]'
                    : isWarning
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 via-studio-900/95 to-studio-950/95 glow-gold'
                      : 'border-cyan-400/75 bg-gradient-to-b from-cyan-500/15 via-studio-900/95 to-studio-950/95 glow-cyan'
                }`}
              >
                {isTimeUp ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-5 text-center"
                  >
                    <div
                      className="font-display font-black tracking-wider text-rose-400 uppercase drop-shadow-[0_0_30px_rgba(255,51,88,0.65)]"
                      style={{ fontSize: 'clamp(2.8rem, 5.2vw, 4.6rem)', lineHeight: 0.95 }}
                    >
                      {t.common.timesUp}
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className={`font-mono font-black tracking-tight tabular-nums leading-none ${
                      isCritical
                        ? 'text-rose-400 drop-shadow-[0_0_35px_rgba(255,51,88,0.65)]'
                        : isWarning
                          ? 'text-amber-300 drop-shadow-[0_0_30px_rgba(255,201,51,0.5)]'
                          : 'text-white drop-shadow-[0_0_35px_rgba(0,229,255,0.45)]'
                    }`}
                    style={{ fontSize: 'clamp(5.5rem, 11vw, 9.25rem)' }}
                  >
                    {formatDisplayClock(remainingMs)}
                  </div>
                )}

                <div className="mt-6 h-3.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-[width] duration-75 ${
                      isTimeUp || isCritical
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : isWarning
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                          : 'bg-gradient-to-r from-cyan-500 to-sky-300'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </motion.div>
            </div>

            {/* RIGHT STAGE: 5 Masked Slots */}
            <div className="flex flex-col justify-center gap-4 lg:col-span-7">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-sm font-extrabold tracking-[0.26em] text-cyan-300 uppercase">
                  {t.fastMoney.display.slotsHeading}
                </span>
                <div className="flex items-center gap-3 font-mono text-sm font-bold">
                  <span className="text-emerald-300">
                    {t.fastMoney.live.lockedBadge(answeredCount)}
                  </span>
                  {passedCount > 0 && (
                    <span className="text-amber-300">
                      • {t.fastMoney.live.passedBadge(passedCount)}
                    </span>
                  )}
                </div>
              </div>

              {activeRoundState.slots.map((slot, idx) => {
                const isCurrent = activeRoundState.activeSlotIndex === idx && !isTimeUp;
                const isAnswered = slot.status === 'answered';
                const isPassed = slot.status === 'passed';

                return (
                  <motion.div
                    key={idx}
                    layout
                    animate={
                      isAnswered
                        ? { scale: [1, 1.018, 1] }
                        : isPassed
                          ? { x: [0, -5, 5, 0] }
                          : { scale: 1 }
                    }
                    transition={{ duration: 0.35 }}
                    className={`relative flex items-center justify-between overflow-hidden rounded-2xl border-2 px-6 py-5 backdrop-blur-md transition-all ${
                      isAnswered
                        ? 'border-emerald-400/75 bg-gradient-to-r from-emerald-500/20 via-studio-900/90 to-studio-900/85 shadow-[0_0_28px_rgba(52,211,153,0.22)]'
                        : isPassed
                          ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-studio-900/90 to-studio-900/85 shadow-[0_0_26px_rgba(255,201,51,0.24)]'
                          : isCurrent
                            ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 via-studio-900/90 to-studio-900/85 glow-cyan'
                            : 'border-white/12 bg-studio-900/70'
                    }`}
                  >
                    {isCurrent && !isAnswered && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent animate-shimmer" />
                      </div>
                    )}

                    <div className="relative flex items-center gap-5">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-3xl font-black ${
                          isAnswered
                            ? 'bg-emerald-400 text-studio-950'
                            : isPassed
                              ? 'bg-amber-400 text-studio-950'
                              : isCurrent
                                ? 'bg-cyan-400 text-studio-950'
                                : 'bg-studio-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex items-center gap-2">
                        {isAnswered ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-3.5 w-32 rounded-full bg-emerald-300/60 sm:w-48" />
                            <div className="h-3.5 w-16 rounded-full bg-emerald-300/35 sm:w-24" />
                          </div>
                        ) : isPassed ? (
                          <span className="font-display text-3xl font-black tracking-[0.2em] text-amber-300 uppercase">
                            {t.fastMoney.display.passedComeBack}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2.5 opacity-45">
                            <div className="h-3 w-28 rounded-full bg-slate-500/60 sm:w-44" />
                            <div className="h-3 w-14 rounded-full bg-slate-500/40 sm:w-20" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center gap-2.5">
                      {isAnswered && (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-400/20 px-4 py-1.5">
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399]" />
                          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                          <span className="font-mono text-sm font-black tracking-widest text-emerald-200 uppercase">
                            {t.fastMoney.display.lockedIn}
                          </span>
                        </div>
                      )}

                      {isPassed && (
                        <div className="flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-400/20 px-4 py-1.5">
                          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-300" />
                          <FastForward className="h-5 w-5 text-amber-300" />
                          <span className="font-mono text-sm font-black tracking-widest text-amber-200 uppercase">
                            {t.fastMoney.display.passedPill}
                          </span>
                        </div>
                      )}

                      {!isAnswered && !isPassed && isCurrent && (
                        <div className="flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-400/20 px-4 py-1.5">
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
                          <span className="font-mono text-sm font-extrabold tracking-widest text-cyan-200 uppercase">
                            {t.common.active}
                          </span>
                        </div>
                      )}

                      {!isAnswered && !isPassed && !isCurrent && (
                        <Lock className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* REVEAL & SCORING BOARD */
          <motion.div
            key="fm-reveal-board"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.38 }}
            className="flex flex-1 flex-col justify-between py-4"
          >
            <div className="mb-3 grid grid-cols-12 items-center gap-4 px-2">
              <div className="col-span-5 flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00e5ff]" />
                <span className="font-display text-2xl font-black tracking-[0.14em] text-cyan-200 uppercase md:text-3xl">
                  {t.fastMoney.display.guessCol(guessingPlayerName)}
                </span>
              </div>
              <div className="col-span-5 flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_#ffc933]" />
                <span className="font-display text-2xl font-black tracking-[0.14em] text-amber-200 uppercase md:text-3xl">
                  {t.fastMoney.display.actualCol(secretOwnerName)}
                </span>
              </div>
              <div className="col-span-2 text-center font-display text-2xl font-black tracking-[0.16em] text-slate-300 uppercase md:text-3xl">
                {t.common.points}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-3">
              {activeRoundState.slots.map((slot, idx) => {
                const q = activeSession.questions[idx];
                const actualAnswer = getActualAnswerForRound(idx);
                const isExact = slot.rating === 'exact';
                const isClose = slot.rating === 'close';
                const isMiss = slot.rating === 'miss';

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 items-stretch gap-3.5 rounded-2xl border p-2.5 transition-all ${
                      isExact
                        ? 'border-amber-400/75 bg-gradient-to-r from-amber-500/15 via-studio-900/90 to-emerald-500/15 glow-gold'
                        : isClose
                          ? 'border-cyan-400/60 bg-gradient-to-r from-cyan-500/12 via-studio-900/90 to-studio-900/85 glow-cyan'
                          : isMiss
                            ? 'border-rose-500/45 bg-rose-500/8'
                            : 'border-white/10 bg-studio-900/65'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3.5" style={{ perspective: 900 }}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-studio-850 font-display text-2xl font-black text-cyan-300">
                        {idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        {q?.question && (
                          <div className="mb-1 truncate font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            {q.question}
                          </div>
                        )}

                        <AnimatePresence mode="wait">
                          {slot.guessRevealed ? (
                            <motion.div
                              key="guess-open"
                              initial={{ rotateX: -85, opacity: 0 }}
                              animate={{ rotateX: 0, opacity: 1 }}
                              exit={{ rotateX: 85, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                              className="flex min-h-[3.25rem] items-center rounded-xl border border-cyan-400/50 bg-studio-950/90 px-4 py-2 shadow-inner"
                            >
                              {slot.guess.trim() ? (
                                <span className="truncate font-display text-3xl font-extrabold tracking-wide text-white uppercase md:text-4xl">
                                  {slot.guess}
                                </span>
                              ) : (
                                <span className="font-display text-2xl font-extrabold tracking-widest text-amber-300/80 uppercase">
                                  {slot.status === 'passed'
                                    ? t.fastMoney.display.passedPill
                                    : t.fastMoney.display.noGuess}
                                </span>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="guess-locked"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ rotateX: 70, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border border-white/12 bg-studio-850/85 px-4 py-2"
                            >
                              <Lock className="h-4 w-4 text-slate-500" />
                              <span className="font-mono text-xs font-bold tracking-[0.22em] text-slate-500 uppercase">
                                {t.fastMoney.display.guessCol(guessingPlayerName)}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="col-span-5 flex flex-col justify-end" style={{ perspective: 900 }}>
                      <div className="mb-1 hidden font-mono text-[11px] font-bold tracking-wider text-amber-300/60 uppercase sm:block">
                        {slot.actualRevealed
                          ? t.fastMoney.display.realAnswer(secretOwnerName)
                          : t.fastMoney.display.secretAnswer}
                      </div>

                      <AnimatePresence mode="wait">
                        {slot.actualRevealed ? (
                          <motion.div
                            key="actual-open"
                            initial={{ rotateX: -85, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={{ rotateX: 85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            className="relative flex min-h-[3.25rem] items-center overflow-hidden rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-500/20 via-studio-950/95 to-amber-500/15 px-4 py-2"
                          >
                            <span className="truncate font-display text-3xl font-extrabold tracking-wide text-amber-100 uppercase md:text-4xl">
                              {actualAnswer.trim() || '—'}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="actual-locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ rotateX: 70, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-studio-850/80 px-4 py-2"
                          >
                            <Sparkles className="h-4 w-4 text-amber-400/50" />
                            <span className="font-mono text-xs font-bold tracking-[0.22em] text-amber-300/45 uppercase">
                              {t.fastMoney.display.secretAnswer}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {slot.rating === 'exact' && (
                          <motion.div
                            key="pts-exact"
                            initial={{ scale: 0.35, rotate: -10, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 16 }}
                            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-amber-300 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 px-2 py-1 text-studio-950 shadow-[0_0_32px_rgba(255,201,51,0.65)]"
                          >
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                              <div className="h-full w-1/2 bg-white/35 animate-shimmer" />
                            </div>
                            <div className="relative flex items-center gap-1 font-mono text-3xl font-black leading-none md:text-4xl">
                              <Zap className="h-5 w-5 fill-current" />
                              +20
                            </div>
                            <span className="relative mt-0.5 font-mono text-[10px] font-black tracking-[0.18em] uppercase">
                              {t.fastMoney.display.exactMatchStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === 'close' && (
                          <motion.div
                            key="pts-close"
                            initial={{ scale: 0.45, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-cyan-300 bg-gradient-to-b from-cyan-300 to-sky-500 px-2 py-1 text-studio-950 shadow-[0_0_26px_rgba(0,229,255,0.5)]"
                          >
                            <div className="font-mono text-3xl font-black leading-none md:text-4xl">
                              +10
                            </div>
                            <span className="mt-0.5 font-mono text-[10px] font-black tracking-[0.18em] uppercase">
                              {t.fastMoney.display.closeMatchStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === 'miss' && (
                          <motion.div
                            key="pts-miss"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: [0, -8, 8, -5, 5, 0], opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-rose-500/80 bg-rose-500/20 px-2 py-1 text-rose-300"
                          >
                            <div className="flex items-center gap-1 font-mono text-3xl font-black leading-none">
                              <XCircle className="h-6 w-6" />0
                            </div>
                            <span className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                              {t.fastMoney.display.missStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === null && (
                          <motion.div
                            key="pts-pending"
                            className="flex h-full w-full items-center justify-center rounded-xl border border-white/10 bg-studio-950/60 font-mono text-2xl font-bold text-slate-600"
                          >
                            —
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-studio-900/90 px-6 py-3 backdrop-blur-xl glow-gold">
              <div className="flex items-center gap-3">
                <Trophy className="h-7 w-7 text-amber-400" />
                <div>
                  <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-slate-400 uppercase">
                    {t.fastMoney.display.roundPoints(fmState.activeRound)}
                  </div>
                  <div className="font-display text-3xl font-black tracking-wide text-white uppercase leading-none">
                    {t.fastMoney.display.playerRun(guessingPlayerName)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-cyan-300 uppercase">
                    {t.fastMoney.display.roundTotal(fmState.activeRound)}
                  </div>
                  <div className="font-mono text-4xl font-black text-cyan-300 leading-none">
                    +<AnimatedScore value={activeRoundTotal} />
                  </div>
                </div>

                <div className="h-10 w-px bg-white/15" />

                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-amber-300 uppercase">
                    {t.fastMoney.display.combinedTotal}
                  </div>
                  <div className="font-mono text-5xl font-black text-gradient-gold leading-none">
                    <AnimatedScore value={combinedTotal} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
