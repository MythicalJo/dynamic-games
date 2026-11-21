import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, X } from 'lucide-react';
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
  const displayPromptText = activePrompt?.text
    ? activePrompt.text.replace(/\[Nombre\]/gi, activeTeam?.playerA || 'tu pareja')
    : t.mentalSync.display.readyPrompt;

  return (
    <div className="relative flex h-full w-full flex-col justify-between px-12 py-9 md:px-20 md:py-11">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
            {t.mentalSync.title}
          </h1>
          <span className="hidden rounded-full border border-line bg-surface px-4 py-1 font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase lg:inline-block">
            {t.mentalSync.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {syncState.timerEnabled && (
            <div
              className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 font-mono text-2xl font-extrabold tabular-nums leading-none ${
                isTimeUp || isCritical
                  ? 'border-err bg-err-soft text-err'
                  : 'border-line-strong bg-surface text-ink'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>{isTimeUp ? t.common.timeBang : `${formatBroadcastTimer(remainingMs)}s`}</span>
            </div>
          )}

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
      </div>

      {/* Main Centered Bold Prompt */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePrompt?.id ?? 'no-prompt'}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32 }}
            className="flex w-full max-w-5xl flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-1.5">
              <span className="font-mono text-xs font-bold tracking-[0.22em] text-ink-muted uppercase">
                {activePrompt?.type === 'fill' ? t.mentalSync.fillTag : t.mentalSync.whoTag}
              </span>
              <span className="rounded-full bg-accent px-3 py-0.5 font-mono text-xs font-bold text-accent-fg">
                +{MENTAL_SYNC_MATCH_POINTS} {t.common.pts}
              </span>
            </div>

            <div className="w-full rounded-3xl border border-line bg-surface px-10 py-14 text-center md:px-16 md:py-16">
              <h2
                className="font-extrabold leading-tight tracking-tight text-ink"
                style={{ fontSize: 'clamp(2.2rem, 4.6vw, 4.2rem)' }}
              >
                {displayPromptText}
              </h2>
            </div>

            <AnimatePresence>
              {syncState.showWhiteboardsOnDisplay && hasWhiteboardText && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid w-full grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <div className="rounded-2xl border border-line-strong bg-canvas px-8 py-6 text-center">
                    <div className="font-mono text-xs font-bold tracking-[0.22em] text-accent uppercase">
                      {t.mentalSync.display.wroteLabel(activeTeam?.playerA || 'A')}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold tracking-tight text-ink uppercase md:text-4xl">
                      {syncState.playerAAnswer.trim() || '—'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line-strong bg-canvas px-8 py-6 text-center">
                    <div className="font-mono text-xs font-bold tracking-[0.22em] text-accent uppercase">
                      {t.mentalSync.display.wroteLabel(activeTeam?.playerB || 'B')}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold tracking-tight text-ink uppercase md:text-4xl">
                      {syncState.playerBAnswer.trim() || '—'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center font-mono text-xs font-bold tracking-[0.26em] text-ink-subtle uppercase">
        {t.mentalSync.display.footerCue}
      </div>

      {/* CLEAN HIGH-IMPACT OVERLAY: "¡SINCRONIZADOS!" OR "NO COINCIDEN" */}
      <AnimatePresence>
        {syncState.result === 'match' && (
          <motion.div
            key="overlay-synced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-canvas/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="flex flex-col items-center rounded-3xl border-4 border-ok bg-surface px-14 py-12 text-center shadow-2xl"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ok text-ok-fg">
                <Check className="h-9 w-9 stroke-[3]" />
              </div>

              <div
                className="font-extrabold tracking-tight text-ok uppercase"
                style={{ fontSize: 'clamp(3.2rem, 8.5vw, 7.2rem)', lineHeight: 0.95 }}
              >
                {t.mentalSync.display.syncedHeadline}
              </div>

              <div className="mt-5 rounded-full bg-accent px-7 py-2 font-mono text-2xl font-extrabold text-accent-fg">
                {t.mentalSync.display.pointsAwarded(MENTAL_SYNC_MATCH_POINTS)}
              </div>

              {activeTeam && (
                <div className="mt-4 font-mono text-base font-bold tracking-[0.18em] text-ink-muted uppercase">
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
            className="fixed inset-0 z-40 flex items-center justify-center bg-canvas/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: [0, -10, 10, -6, 6, 0] }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center rounded-3xl border-4 border-err bg-surface px-14 py-12 text-center shadow-2xl"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-err text-err-fg">
                <X className="h-9 w-9 stroke-[3]" />
              </div>

              <div
                className="font-extrabold tracking-tight text-err uppercase"
                style={{ fontSize: 'clamp(3.2rem, 8.5vw, 7.2rem)', lineHeight: 0.95 }}
              >
                {t.mentalSync.display.noMatchHeadline}
              </div>

              <div className="mt-5 rounded-full border border-err/40 bg-err-soft px-7 py-2 font-mono text-xl font-bold text-err">
                {t.mentalSync.display.signalLost}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
