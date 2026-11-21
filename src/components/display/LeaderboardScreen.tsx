import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';
import { AnimatedScore } from '../shared/AnimatedScore';

export function LeaderboardScreen() {
  const { state, recentFlashes, t } = useShow();

  const rankedTeams = useMemo(() => {
    const sorted = [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    let currentRank = 1;
    return sorted.map((team, idx) => {
      if (idx > 0 && team.score < sorted[idx - 1].score) {
        currentRank = idx + 1;
      }
      return { team, rank: currentRank };
    });
  }, [state.teams]);

  const topScore = Math.max(1, ...state.teams.map((item) => Math.max(0, item.score)));
  const useTwoColumns = rankedTeams.length > 6;
  const compactMode = rankedTeams.length > 4 && !useTwoColumns;

  return (
    <div className="flex h-full w-full flex-col px-12 py-10 md:px-20 md:py-12">
      {/* Editorial Header */}
      <div className="mb-8 flex items-end justify-between border-b border-line pb-6">
        <div>
          <div className="font-mono text-xs font-bold tracking-[0.26em] text-accent uppercase">
            {state.eventMeta.title}
          </div>
          <h1
            className="mt-1 font-extrabold tracking-tight text-ink uppercase"
            style={{ fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', lineHeight: 0.98 }}
          >
            {t.leaderboard.title}
          </h1>
        </div>

        <span className="hidden rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase sm:inline-block">
          {t.leaderboard.pairsCompeting(state.teams.length)}
        </span>
      </div>

      {rankedTeams.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-line bg-surface text-center">
          <p className="text-3xl font-extrabold text-ink uppercase">
            {t.leaderboard.noTeamsTitle}
          </p>
          <p className="mt-2 text-base text-ink-muted">{t.leaderboard.noTeamsSubtitle}</p>
        </div>
      ) : (
        <div
          className={`grid flex-1 content-center gap-4 ${
            useTwoColumns ? 'grid-cols-1 lg:grid-cols-2 gap-x-8' : 'mx-auto w-full max-w-5xl grid-cols-1'
          }`}
        >
          {rankedTeams.map(({ team, rank }) => {
            const isFirst = rank === 1 && team.score > 0;
            const accent = TEAM_ACCENTS[team.accent];
            const flash = recentFlashes.find((f) => f.teamId === team.id);
            const barWidth = Math.max(3, Math.min(100, Math.round((Math.max(0, team.score) / topScore) * 100)));

            return (
              <motion.div
                key={team.id}
                layout
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className={`relative overflow-hidden rounded-2xl border transition-colors ${
                  isFirst
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface'
                } ${compactMode || useTwoColumns ? 'px-6 py-4' : 'px-8 py-5'}`}
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Rank + Team Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-5">
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-xl font-mono font-extrabold ${
                        isFirst
                          ? 'bg-accent text-accent-fg'
                          : 'border border-line bg-canvas text-ink-muted'
                      } ${compactMode || useTwoColumns ? 'h-12 w-12 text-xl' : 'h-14 w-14 text-2xl'}`}
                    >
                      {isFirst ? <Crown className="h-6 w-6" /> : rank}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: accent.hex }}
                        />
                        <h2
                          className={`truncate font-extrabold tracking-tight text-ink uppercase ${
                            compactMode || useTwoColumns ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
                          }`}
                        >
                          {team.name}
                        </h2>
                        {isFirst && (
                          <span className="hidden rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.18em] text-accent-fg uppercase md:inline-block">
                            {t.leaderboard.leader}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 pl-6 text-base font-medium text-ink-muted md:text-lg">
                        {team.playerA} y {team.playerB}
                      </div>

                      {/* Thin Minimalist Score Proportion Line */}
                      <div className="mt-3 ml-6 h-1 w-full max-w-md overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: isFirst ? 'var(--accent)' : accent.hex }}
                          initial={false}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ type: 'spring', stiffness: 130, damping: 22 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Animated Score + Delta Flash */}
                  <div className="flex shrink-0 items-center gap-4 text-right">
                    <AnimatePresence>
                      {flash && (
                        <motion.span
                          key={flash.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          className={`rounded-full px-3 py-1 font-mono text-lg font-bold ${
                            flash.delta > 0
                              ? 'bg-ok-soft text-ok'
                              : 'bg-err-soft text-err'
                          }`}
                        >
                          {flash.delta > 0 ? `+${flash.delta}` : flash.delta}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <div>
                      <div
                        className={`font-mono font-extrabold tracking-tight text-ink ${
                          compactMode || useTwoColumns ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'
                        }`}
                      >
                        <AnimatedScore value={team.score} />
                      </div>
                      <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-ink-subtle uppercase">
                        {t.common.points}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
