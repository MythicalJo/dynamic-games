import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Gavel, Zap } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { formatBroadcastTimer, useSyncedTimer } from '../../lib/timer';
import { TEAM_ACCENTS } from '../../types/show';
import { AnimatedScore } from '../shared/AnimatedScore';

export function TiebreakerDisplay() {
  const { state, role, triggerCue } = useShow();
  const tb = state.tiebreaker;

  const noopExpire = useCallback(() => {}, []);
  const remainingMs = useSyncedTimer({
    timer: tb.timer,
    role,
    triggerCue,
    onExpire: noopExpire,
  });

  const sortedTeams = useMemo(
    () => [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [state.teams]
  );

  const isTimeUp = remainingMs === 0;
  const remainingSec = remainingMs / 1000;
  const isCritical = !isTimeUp && remainingSec <= 5;
  const SourceIcon = tb.source === 'confidence-auction' ? Gavel : Brain;
  const sourceLabel =
    tb.source === 'confidence-auction' ? 'SUBASTA DE CONFIANZA' : 'SINCRONÍA MENTAL';

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 py-9 md:px-20 md:py-11">
      {/* Top Dramatic Minimalist Banner */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-fg">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold tracking-[0.26em] text-accent uppercase">
              RONDA DE DESEMPATE · +10 PTS AL GANADOR
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase md:text-4xl">
              ⚡ MUERTE SÚBITA ⚡
            </h1>
          </div>
        </div>

        {/* Synchronized Countdown */}
        <div
          className={`flex items-center gap-3 rounded-2xl border-2 px-6 py-3 font-mono text-3xl font-extrabold tabular-nums leading-none md:text-4xl ${
            isTimeUp || isCritical
              ? 'border-err bg-err-soft text-err'
              : 'border-line-strong bg-surface text-ink'
          }`}
        >
          <Clock className="h-6 w-6" />
          <span>{isTimeUp ? '¡TIEMPO!' : `${formatBroadcastTimer(remainingMs)}s`}</span>
        </div>
      </div>

      {/* Center Sudden Death Prompt */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <motion.div
          key={tb.promptText || 'empty-tb'}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex w-full max-w-5xl flex-col items-center gap-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-1.5">
            <SourceIcon className="h-4 w-4 text-accent" />
            <span className="font-mono text-xs font-bold tracking-[0.22em] text-ink-muted uppercase">
              {sourceLabel}
            </span>
          </div>

          <div className="w-full rounded-3xl border-2 border-accent/50 bg-surface px-10 py-14 text-center md:px-16 md:py-16">
            <h2
              className="font-extrabold leading-tight tracking-tight text-ink"
              style={{ fontSize: 'clamp(2.1rem, 4.6vw, 4.1rem)' }}
            >
              {tb.promptText || 'PREPARANDO PREGUNTA DE DESEMPATE...'}
            </h2>
            {tb.promptHint && (
              <p className="mt-4 font-mono text-sm font-semibold tracking-wide text-ink-muted uppercase">
                {tb.promptHint}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Live Standings Strip */}
      {sortedTeams.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-line pt-4">
          {sortedTeams.map((team) => {
            const accent = TEAM_ACCENTS[team.accent];
            const isWinner = tb.winnerTeamId === team.id;
            return (
              <div
                key={team.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-2 ${
                  isWinner ? 'border-ok bg-ok-soft' : 'border-line bg-surface'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent.hex }}
                />
                <span className="text-sm font-extrabold text-ink uppercase">{team.name}</span>
                <span className="font-mono text-base font-extrabold text-accent">
                  <AnimatedScore value={team.score} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
