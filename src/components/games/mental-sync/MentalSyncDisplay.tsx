import { AnimatePresence, motion } from 'framer-motion';
import { Brain, CheckCircle2, Clock, Sparkles, XCircle, Zap } from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import { MENTAL_SYNC_MATCH_POINTS } from '../../../types/mentalSync';
import { TEAM_ACCENTS } from '../../../types/show';
import { AnimatedScore } from '../../shared/AnimatedScore';
import { useMentalSync } from './useMentalSync';

export function MentalSyncDisplay() {
  const { t } = useShow();
  const { syncState, activeTeam, activePrompt, remainingMs } = useMentalSync();

  const teamAccent = activeTeam ? TEAM_ACCENTS[activeTeam.accent] : null;
  const isTimeUp = remainingMs === 0;
  const remainingSec = remainingMs / 1000;
  const isCritical = !isTimeUp && remainingSec <= 5;
  const hasWhiteboardText =
    Boolean(syncState.playerAAnswer.trim()) || Boolean(syncState.playerBAnswer.trim());

  return (
    <div className="relative flex h-full w-full flex-col justify-between px-10 py-8 md:px-16 md:py-10">
      {/* Top Broadcast Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-violet-500/15 px-5 py-2 glow-cyan">
            <Brain className="h-6 w-6 text-cyan-300" />
            <span className="font-display text-3xl font-black tracking-wider text-gradient-cyan uppercase leading-none">
              {t.mentalSync.title}
            </span>
          </div>
          <span className="hidden font-mono text-sm font-bold tracking-[0.25em] text-amber-300/90 uppercase lg:inline-block">
            {t.mentalSync.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {syncState.timerEnabled && (
            <div
              className={`flex items-center gap-2.5 rounded-2xl border-2 px-5 py-2 backdrop-blur-md transition-colors ${
                isTimeUp || isCritical
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 glow-live'
                  : 'border-cyan-400/60 bg-studio-900/90 text-cyan-200 glow-cyan'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="font-mono text-3xl font-black tabular-nums leading-none">
                {isTimeUp ? t.common.timeBang : `${formatBroadcastTimer(remainingMs)}s`}
              </span>
            </div>
          )}

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
      </div>

      {/* Centered Bold Prompt Stage */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-7 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePrompt?.id ?? 'no-prompt'}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-6xl flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/45 bg-cyan-400/15 px-6 py-2 glow-cyan">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="font-mono text-base font-extrabold tracking-[0.26em] text-cyan-200 uppercase">
                {activePrompt?.type === 'fill' ? t.mentalSync.fillTag : t.mentalSync.whoTag}
              </span>
              <span className="rounded-full bg-amber-400/25 px-3 py-0.5 font-mono text-xs font-black text-amber-200">
                +{MENTAL_SYNC_MATCH_POINTS} {t.common.pts}
              </span>
            </div>

            <div className="relative w-full overflow-hidden rounded-[2.25rem] border-2 border-cyan-400/40 bg-studio-900/85 px-10 py-12 text-center shadow-[0_28px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl md:px-16 md:py-16">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

              <h1
                className="font-sans font-black leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
                style={{ fontSize: 'clamp(2.2rem, 4.7vw, 4.4rem)' }}
              >
                {activePrompt?.text || t.mentalSync.display.readyPrompt}
              </h1>
            </div>

            <AnimatePresence>
              {syncState.showWhiteboardsOnDisplay && hasWhiteboardText && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="grid w-full grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <div className="rounded-3xl border-2 border-cyan-400/60 bg-studio-900/90 px-8 py-6 text-center backdrop-blur-xl glow-cyan">
                    <div className="font-mono text-sm font-extrabold tracking-[0.25em] text-cyan-300 uppercase">
                      {t.mentalSync.display.wroteLabel(activeTeam?.playerA || 'A')}
                    </div>
                    <div className="mt-2 font-display text-4xl font-black tracking-wide text-white uppercase md:text-5xl">
                      {syncState.playerAAnswer.trim() || '—'}
                    </div>
                  </div>

                  <div className="rounded-3xl border-2 border-amber-400/60 bg-studio-900/90 px-8 py-6 text-center backdrop-blur-xl glow-gold">
                    <div className="font-mono text-sm font-extrabold tracking-[0.25em] text-amber-300 uppercase">
                      {t.mentalSync.display.wroteLabel(activeTeam?.playerB || 'B')}
                    </div>
                    <div className="mt-2 font-display text-4xl font-black tracking-wide text-amber-100 uppercase md:text-5xl">
                      {syncState.playerBAnswer.trim() || '—'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center font-mono text-sm font-bold tracking-[0.28em] text-slate-400 uppercase">
        {t.mentalSync.display.footerCue}
      </div>

      {/* DRAMATIC RESULT OVERLAY: "¡SINCRONIZADOS!" / "SYNCED!" OR "NO COINCIDEN" / "NO MATCH" */}
      <AnimatePresence>
        {syncState.result === 'match' && (
          <motion.div
            key="overlay-synced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-studio-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="pointer-events-none absolute h-96 w-96 rounded-full border-4 border-emerald-400"
            />
            <motion.div
              initial={{ scale: 0.5, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="relative flex flex-col items-center overflow-hidden rounded-[2.75rem] border-4 border-emerald-300 bg-gradient-to-b from-emerald-500/35 via-studio-900/95 to-amber-500/25 px-14 py-12 text-center shadow-[0_0_90px_rgba(52,211,153,0.55)]"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="h-full w-1/3 bg-white/20 animate-shimmer" />
              </div>

              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-studio-950 shadow-[0_0_35px_rgba(52,211,153,0.75)]">
                <CheckCircle2 className="h-12 w-12 stroke-[2.8]" />
              </div>

              <div
                className="font-display font-black tracking-[0.05em] text-gradient-gold uppercase drop-shadow-[0_10px_30px_rgba(255,201,51,0.45)]"
                style={{ fontSize: 'clamp(3.6rem, 9.5vw, 8.2rem)', lineHeight: 0.92 }}
              >
                {t.mentalSync.display.syncedHeadline}
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-400 px-7 py-2 font-mono text-2xl font-black text-studio-950 shadow-[0_0_25px_rgba(255,201,51,0.5)]">
                <Zap className="h-6 w-6 fill-current" />
                <span>{t.mentalSync.display.pointsAwarded(MENTAL_SYNC_MATCH_POINTS)}</span>
              </div>

              {activeTeam && (
                <div className="mt-4 font-display text-3xl font-extrabold tracking-widest text-emerald-200 uppercase">
                  {t.mentalSync.display.telepathyConfirmed(activeTeam.name)}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {syncState.result === 'mismatch' && (
          <motion.div
            key="overlay-mismatch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-studio-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: [0, -14, 14, -10, 10, -4, 4, 0],
              }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center rounded-[2.75rem] border-4 border-rose-500 bg-gradient-to-b from-rose-500/35 via-studio-900/95 to-studio-950/95 px-14 py-12 text-center shadow-[0_0_90px_rgba(255,51,88,0.55)]"
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_0_35px_rgba(255,51,88,0.7)]">
                <XCircle className="h-12 w-12 stroke-[2.8]" />
              </div>

              <div
                className="font-display font-black tracking-[0.05em] text-rose-400 uppercase drop-shadow-[0_10px_30px_rgba(255,51,88,0.5)]"
                style={{ fontSize: 'clamp(3.6rem, 9.2vw, 8rem)', lineHeight: 0.92 }}
              >
                {t.mentalSync.display.noMatchHeadline}
              </div>

              <div className="mt-4 rounded-full border border-rose-400/50 bg-rose-500/20 px-7 py-2 font-mono text-2xl font-black text-rose-200">
                {t.mentalSync.display.signalLost}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
