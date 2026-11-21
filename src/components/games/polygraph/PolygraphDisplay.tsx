import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Clock, Lock, ShieldAlert, ShieldCheck, Trophy } from 'lucide-react';
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
      ? '#34d399'
      : '#ff3358'
    : isCritical || isTimeUp
      ? '#ff3358'
      : '#00e5ff';

  return (
    <div className="relative flex h-full w-full flex-col justify-between px-10 py-7 md:px-16 md:py-9">
      {/* Top Broadcast Header + Live Polygraph ECG Line */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-5 py-2 ${
                isRevealed
                  ? isTruth
                    ? 'border-emerald-400/70 bg-emerald-500/20'
                    : 'border-rose-500/80 bg-rose-500/20 glow-live'
                  : 'border-rose-400/50 bg-rose-500/15 glow-live'
              }`}
            >
              <Activity
                className={`h-6 w-6 ${isRevealed && isTruth ? 'text-emerald-300' : 'text-rose-300'}`}
              />
              <span className="font-display text-3xl font-black tracking-wider text-white uppercase leading-none">
                {t.polygraph.title}
              </span>
            </div>
            <span className="hidden font-mono text-sm font-bold tracking-[0.26em] text-amber-300/90 uppercase lg:inline-block">
              {t.polygraph.subtitle}
            </span>
          </div>

          {activeTeam && teamAccent && (
            <div
              className={`flex items-center gap-4 rounded-2xl border ${teamAccent.border} bg-studio-900/90 px-5 py-2 backdrop-blur-md ${teamAccent.glow}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-3 w-3 rounded-full ${teamAccent.dot}`} />
                <div>
                  <div className="font-display text-2xl font-black tracking-wide text-white uppercase leading-none">
                    {activeTeam.name}
                  </div>
                  <div className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                    {activeTeam.playerA} &amp; {activeTeam.playerB}
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="font-mono text-3xl font-black text-amber-300 leading-none">
                <AnimatedScore value={activeTeam.score} />
              </div>
            </div>
          )}
        </div>

        {/* Animated Polygraph ECG Heartbeat Waveform */}
        <div className="mt-3 h-8 w-full overflow-hidden rounded-lg bg-studio-950/60 px-2">
          <svg viewBox="0 0 1200 44" className="h-full w-full" preserveAspectRatio="none">
            <motion.path
              d="M0,22 L120,22 L135,22 L145,8 L156,38 L168,4 L180,34 L190,22 L340,22 L355,22 L365,10 L376,36 L388,5 L400,32 L412,22 L560,22 L575,22 L585,8 L596,38 L608,4 L620,34 L630,22 L780,22 L795,22 L805,10 L816,36 L828,5 L840,32 L852,22 L1000,22 L1015,22 L1025,8 L1036,38 L1048,4 L1060,34 L1072,22 L1200,22"
              fill="none"
              stroke={waveColor}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0.25, pathOffset: 0 }}
              animate={{ pathLength: 1, pathOffset: [0, 1] }}
              transition={{
                repeat: Infinity,
                ease: 'linear',
                duration: isCritical || (isRevealed && !isTruth) ? 1.4 : 3.2,
              }}
              style={{ filter: `drop-shadow(0 0 8px ${waveColor})` }}
            />
          </svg>
        </div>
      </div>

      {/* Main Center Interrogation Dossier Stage */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="rounded-full border border-amber-400/50 bg-amber-400/15 px-6 py-1.5 font-display text-2xl font-black tracking-wider text-amber-200 uppercase glow-gold">
            {t.polygraph.hotSeat}: {speakerName}
          </div>
          <span className="font-mono text-sm font-bold text-slate-500">VS</span>
          <div className="rounded-full border border-cyan-400/50 bg-cyan-400/15 px-6 py-1.5 font-display text-2xl font-black tracking-wider text-cyan-200 uppercase glow-cyan">
            {t.polygraph.interrogator}: {interrogatorName}
          </div>
        </div>

        {/* Dramatic Statement Card with STAMP Overlay */}
        <div className="relative w-full max-w-6xl">
          <motion.div
            key={activeStatement?.id ?? 'empty-poly'}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative overflow-hidden rounded-[2.25rem] border-2 px-10 py-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-colors md:px-16 md:py-14 ${
              isRevealed
                ? isTruth
                  ? 'border-emerald-400/80 bg-gradient-to-b from-emerald-500/15 via-studio-900/95 to-studio-950/95 shadow-[0_0_70px_rgba(52,211,153,0.28)]'
                  : 'border-rose-500/85 bg-gradient-to-b from-rose-500/20 via-studio-900/95 to-studio-950/95 shadow-[0_0_75px_rgba(255,51,88,0.34)]'
                : 'border-white/20 bg-studio-900/90'
            }`}
          >
            <div className="mb-3 font-mono text-sm font-extrabold tracking-[0.32em] text-slate-400 uppercase">
              {t.polygraph.display.swornStatement}
            </div>
            <blockquote
              className="font-sans font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.5rem)' }}
            >
              &ldquo;{activeStatement?.statement || t.polygraph.display.selectStatement}&rdquo;
            </blockquote>
          </motion.div>

          {/* HIGH-IMPACT ANIMATED "VERDAD"/"TRUTH" OR "MENTIRA"/"LIE" STAMP */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                key={`stamp-${verdict}`}
                initial={{ scale: 2.6, opacity: 0, rotate: isTruth ? -22 : 22 }}
                animate={{ scale: 1, opacity: 1, rotate: isTruth ? -8 : 8 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
              >
                <div
                  className={`flex items-center gap-4 rounded-3xl border-[6px] px-12 py-5 backdrop-blur-md ${
                    isTruth
                      ? 'border-emerald-300 bg-studio-950/90 text-emerald-300 shadow-[0_0_80px_rgba(52,211,153,0.75)]'
                      : 'border-rose-400 bg-studio-950/90 text-rose-400 shadow-[0_0_85px_rgba(255,51,88,0.8)]'
                  }`}
                >
                  {isTruth ? (
                    <ShieldCheck className="h-16 w-16 stroke-[2.5] md:h-20 md:w-20" />
                  ) : (
                    <ShieldAlert className="h-16 w-16 stroke-[2.5] md:h-20 md:w-20" />
                  )}
                  <span
                    className="font-display font-black tracking-[0.12em] uppercase leading-none"
                    style={{ fontSize: 'clamp(4rem, 8.8vw, 7.8rem)' }}
                  >
                    {isTruth ? t.polygraph.truth : t.polygraph.lie}
                  </span>
                </div>

                {polyState.lockedGuess && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`mt-5 inline-flex items-center gap-2.5 rounded-full border-2 px-7 py-2 font-mono text-xl font-black uppercase shadow-2xl ${
                      guessMatched
                        ? 'border-amber-300 bg-gradient-to-r from-amber-400 to-yellow-400 text-studio-950'
                        : 'border-rose-400/70 bg-studio-950/95 text-rose-300'
                    }`}
                  >
                    {guessMatched ? (
                      <>
                        <Trophy className="h-6 w-6" />
                        <span>
                          {t.polygraph.display.calledIt(interrogatorName, polyState.awardedPoints)}
                        </span>
                      </>
                    ) : (
                      <span>{t.polygraph.display.fooledBy(speakerName)}</span>
                    )}
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
          className={`flex items-center justify-between gap-5 rounded-2xl border-2 px-6 py-4 backdrop-blur-xl md:col-span-7 ${
            isTimeUp || isCritical
              ? 'border-rose-500/80 bg-rose-500/18 glow-live'
              : 'border-cyan-400/45 bg-studio-900/90 glow-cyan'
          }`}
        >
          <div className="flex items-center gap-4">
            <Clock
              className={`h-8 w-8 ${isTimeUp || isCritical ? 'text-rose-400' : 'text-cyan-300'}`}
            />
            <div>
              <div className="font-mono text-xs font-bold tracking-[0.24em] text-slate-400 uppercase">
                {t.polygraph.display.interrogationClock}
              </div>
              <div className="mt-1 h-2.5 w-48 overflow-hidden rounded-full bg-white/10 sm:w-64">
                <div
                  className={`h-full rounded-full transition-[width] duration-75 ${
                    isTimeUp || isCritical ? 'bg-rose-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`font-mono text-5xl font-black tabular-nums leading-none md:text-6xl ${
              isTimeUp || isCritical ? 'text-rose-400' : 'text-white'
            }`}
          >
            {isTimeUp ? t.common.timeBang : `${formatBroadcastTimer(remainingMs)}s`}
          </div>
        </div>

        <div
          className={`flex items-center justify-between gap-4 rounded-2xl border-2 px-6 py-4 backdrop-blur-xl md:col-span-5 ${
            polyState.lockedGuess === 'truth'
              ? 'border-emerald-400/75 bg-emerald-500/18'
              : polyState.lockedGuess === 'lie'
                ? 'border-rose-500/75 bg-rose-500/18'
                : 'border-white/12 bg-studio-900/85'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
              <Lock className="h-3.5 w-3.5" />
              <span>{t.polygraph.display.lockedGuessHeader(interrogatorName)}</span>
            </div>
            <div className="mt-1 font-display text-3xl font-black tracking-wider uppercase leading-none">
              {polyState.lockedGuess === 'truth' && (
                <span className="text-emerald-300">{t.polygraph.display.calledTruth}</span>
              )}
              {polyState.lockedGuess === 'lie' && (
                <span className="text-rose-300">{t.polygraph.display.calledLie}</span>
              )}
              {!polyState.lockedGuess && (
                <span className="text-slate-500">{t.polygraph.display.awaitingVerdict}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
