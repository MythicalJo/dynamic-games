import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import { TEAM_ACCENTS } from '../../../types/show';
import { AnimatedScore } from '../../shared/AnimatedScore';
import { usePolygraph } from './usePolygraph';

export function PolygraphDisplay() {
  const { t } = useShow();
  const {
    polyState,
    activeStatement,
    activeTeam,
    speakerName,
    interrogatorName,
    remainingMs,
  } = usePolygraph();

  const teamAccent = activeTeam ? TEAM_ACCENTS[activeTeam.accent] : null;
  const remainingSec = remainingMs / 1000;
  const isTimeUp = remainingMs === 0;
  const isCritical = !isTimeUp && remainingSec <= 10;
  const totalMs = Math.max(1000, polyState.timer.totalSeconds * 1000);
  const timerPct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));

  const isRevealed = polyState.verdictRevealed && Boolean(activeStatement);
  const verdict = activeStatement?.verdict ?? 'truth';
  const isTruth = verdict === 'truth';
  const guessMatched =
    isRevealed && polyState.lockedGuess !== null && polyState.lockedGuess === verdict;

  const waveColor = isRevealed
    ? isTruth
      ? 'var(--ok)'
      : 'var(--err)'
    : isCritical || isTimeUp
      ? 'var(--err)'
      : 'var(--accent)';

  return (
    <div className="relative flex h-full w-full flex-col justify-between px-12 py-8 md:px-18 md:py-10">
      {/* Header + Minimalist Polygraph Line */}
      <div className="border-b border-line pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
              {t.polygraph.title}
            </h1>
            <span className="hidden rounded-full border border-line bg-surface px-4 py-1 font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase lg:inline-block">
              {t.polygraph.subtitle}
            </span>
          </div>

          {activeTeam && teamAccent && (
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: teamAccent.hex }}
                />
                <div>
                  <div className="text-lg font-extrabold text-ink uppercase leading-none">
                    {activeTeam.name}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-ink-muted">
                    {activeTeam.playerA} y {activeTeam.playerB}
                  </div>
                </div>
              </div>
              <div className="h-7 w-px bg-line" />
              <div className="font-mono text-2xl font-extrabold text-ink leading-none">
                <AnimatedScore value={activeTeam.score} />
              </div>
            </div>
          )}
        </div>

        {/* Clean Editorial Polygraph ECG Waveform */}
        <div className="mt-3 h-7 w-full overflow-hidden">
          <svg viewBox="0 0 1200 44" className="h-full w-full" preserveAspectRatio="none">
            <motion.path
              d="M0,22 L120,22 L135,22 L145,8 L156,38 L168,4 L180,34 L190,22 L340,22 L355,22 L365,10 L376,36 L388,5 L400,32 L412,22 L560,22 L575,22 L585,8 L596,38 L608,4 L620,34 L630,22 L780,22 L795,22 L805,10 L816,36 L828,5 L840,32 L852,22 L1000,22 L1015,22 L1025,8 L1036,38 L1048,4 L1060,34 L1072,22 L1200,22"
              fill="none"
              stroke={waveColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0.25, pathOffset: 0 }}
              animate={{ pathLength: 1, pathOffset: [0, 1] }}
              transition={{
                repeat: Infinity,
                ease: 'linear',
                duration: isCritical || (isRevealed && !isTruth) ? 1.5 : 3.4,
              }}
            />
          </svg>
        </div>
      </div>

      {/* Center Statement Dossier */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-line bg-surface px-5 py-1.5 font-mono text-sm font-bold tracking-wider text-ink uppercase">
            {t.polygraph.hotSeat}: <strong className="text-accent">{speakerName}</strong>
          </span>
          <span className="font-mono text-xs text-ink-subtle">·</span>
          <span className="rounded-full border border-line bg-surface px-5 py-1.5 font-mono text-sm font-bold tracking-wider text-ink uppercase">
            {t.polygraph.interrogator}: <strong>{interrogatorName}</strong>
          </span>
        </div>

        <div className="relative w-full max-w-5xl">
          <motion.div
            key={activeStatement?.id ?? 'empty-poly'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl border-2 px-10 py-14 text-center transition-colors md:px-16 ${
              isRevealed
                ? isTruth
                  ? 'border-ok bg-ok-soft'
                  : 'border-err bg-err-soft'
                : 'border-line bg-surface'
            }`}
          >
            <div className="mb-3 font-mono text-xs font-bold tracking-[0.28em] text-ink-subtle uppercase">
              {t.polygraph.display.swornStatement}
            </div>
            <blockquote
              className="font-extrabold leading-tight tracking-tight text-ink"
              style={{ fontSize: 'clamp(1.85rem, 3.6vw, 3.3rem)' }}
            >
              «{activeStatement?.statement || t.polygraph.display.selectStatement}»
            </blockquote>
          </motion.div>

          {/* HIGH-IMPACT EDITORIAL "VERDAD" (GREEN) OR "MENTIRA" (RED) STAMP */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                key={`stamp-${verdict}`}
                initial={{ scale: 2.3, opacity: 0, rotate: isTruth ? -18 : 18 }}
                animate={{ scale: 1, opacity: 1, rotate: isTruth ? -7 : 7 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
              >
                <div
                  className={`flex items-center gap-4 rounded-3xl border-[6px] bg-canvas/95 px-12 py-5 shadow-2xl ${
                    isTruth ? 'border-ok text-ok' : 'border-err text-err'
                  }`}
                >
                  {isTruth ? (
                    <ShieldCheck className="h-14 w-14 stroke-[2.5] md:h-16 md:w-16" />
                  ) : (
                    <ShieldAlert className="h-14 w-14 stroke-[2.5] md:h-16 md:w-16" />
                  )}
                  <span
                    className="font-extrabold tracking-[0.08em] uppercase leading-none"
                    style={{ fontSize: 'clamp(3.6rem, 8.2vw, 7.2rem)' }}
                  >
                    {isTruth ? t.polygraph.truth : t.polygraph.lie}
                  </span>
                </div>

                {polyState.lockedGuess && (
                  <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18 }}
                    className={`mt-5 rounded-full px-6 py-2 font-mono text-lg font-bold uppercase shadow-lg ${
                      guessMatched ? 'bg-accent text-accent-fg' : 'bg-ink text-canvas'
                    }`}
                  >
                    {guessMatched
                      ? t.polygraph.display.calledIt(interrogatorName, polyState.awardedPoints)
                      : t.polygraph.display.fooledBy(speakerName)}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div
          className={`flex items-center justify-between gap-5 rounded-2xl border-2 px-6 py-4 md:col-span-7 ${
            isTimeUp || isCritical ? 'border-err bg-err-soft' : 'border-line bg-surface'
          }`}
        >
          <div className="flex items-center gap-4">
            <Clock className={`h-7 w-7 ${isTimeUp || isCritical ? 'text-err' : 'text-accent'}`} />
            <div>
              <div className="font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
                {t.polygraph.display.interrogationClock}
              </div>
              <div className="mt-1.5 h-2 w-48 overflow-hidden rounded-full bg-line sm:w-64">
                <div
                  className={`h-full rounded-full transition-[width] duration-75 ${
                    isTimeUp || isCritical ? 'bg-err' : 'bg-accent'
                  }`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`font-mono text-5xl font-extrabold tabular-nums leading-none ${
              isTimeUp || isCritical ? 'text-err' : 'text-ink'
            }`}
          >
            {isTimeUp ? t.common.timeBang : `${formatBroadcastTimer(remainingMs)}s`}
          </div>
        </div>

        <div
          className={`flex items-center rounded-2xl border-2 px-6 py-4 md:col-span-5 ${
            polyState.lockedGuess === 'truth'
              ? 'border-ok bg-ok-soft'
              : polyState.lockedGuess === 'lie'
                ? 'border-err bg-err-soft'
                : 'border-line bg-surface'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
              <Lock className="h-3.5 w-3.5" />
              <span>{t.polygraph.display.lockedGuessHeader(interrogatorName)}</span>
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight uppercase leading-none">
              {polyState.lockedGuess === 'truth' && (
                <span className="text-ok">{t.polygraph.display.calledTruth}</span>
              )}
              {polyState.lockedGuess === 'lie' && (
                <span className="text-err">{t.polygraph.display.calledLie}</span>
              )}
              {!polyState.lockedGuess && (
                <span className="text-ink-subtle">{t.polygraph.display.awaitingVerdict}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
