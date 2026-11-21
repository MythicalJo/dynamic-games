import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Trophy } from 'lucide-react';
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

  const topScore = Math.max(1, ...state.teams.map((t) => Math.max(0, t.score)));
  const useTwoColumns = rankedTeams.length > 6;
  const compactMode = rankedTeams.length > 4 && !useTwoColumns;

  return (
    <div className="flex h-full w-full flex-col px-10 py-8 md:px-16 md:py-10">
      {/* Header Bar */}
      <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-sm font-bold tracking-[0.28em] text-cyan-300 uppercase">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>{state.eventMeta.title}</span>
          </div>
          <h1
            className="mt-1 font-display font-black tracking-wide text-gradient-gold uppercase"
            style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.75rem)', lineHeight: 0.95 }}
          >
            {t.leaderboard.title}
          </h1>
        </div>

        <div className="hidden items-center gap-3 rounded-2xl border border-cyan-400/25 bg-studio-900/80 px-5 py-3 backdrop-blur-md sm:flex">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_#00e5ff]" />
          <span className="font-mono text-sm font-bold tracking-widest text-cyan-200 uppercase">
            {t.leaderboard.pairsCompeting(state.teams.length)}
          </span>
        </div>
      </div>

      {/* Leaderboard List */}
      {rankedTeams.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-studio-900/50 text-center">
          <Trophy className="mb-4 h-16 w-16 text-amber-400/40" />
          <p className="font-display text-4xl font-bold tracking-wider text-slate-300 uppercase">
            {t.leaderboard.noTeamsTitle}
          </p>
          <p className="mt-2 text-lg text-slate-400">{t.leaderboard.noTeamsSubtitle}</p>
        </div>
      ) : (
        <div
          className={`grid flex-1 content-center gap-4 ${
            useTwoColumns ? 'grid-cols-1 lg:grid-cols-2 gap-x-8' : 'mx-auto w-full max-w-6xl grid-cols-1'
          }`}
        >
          {rankedTeams.map(({ team, rank }) => {
            const isFirst = rank === 1 && team.score > 0;
            const isSecond = rank === 2;
            const isThird = rank === 3;
            const accent = TEAM_ACCENTS[team.accent];
            const flash = recentFlashes.find((f) => f.teamId === team.id);
            const barWidth = Math.max(4, Math.min(100, Math.round((Math.max(0, team.score) / topScore) * 100)));

            const cardFrame = isFirst
              ? 'border-amber-400/75 bg-gradient-to-r from-amber-500/20 via-studio-900/90 to-studio-900/85 glow-gold'
              : isSecond
                ? 'border-cyan-400/45 bg-gradient-to-r from-cyan-500/12 via-studio-900/85 to-studio-900/80'
                : isThird
                  ? 'border-amber-700/50 bg-studio-900/80'
                  : 'border-white/12 bg-studio-900/70';

            const rankBadgeStyle = isFirst
              ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-studio-950 shadow-[0_0_24px_rgba(255,201,51,0.5)]'
              : isSecond
                ? 'bg-gradient-to-b from-cyan-200 to-cyan-500 text-studio-950'
                : isThird
                  ? 'bg-gradient-to-b from-amber-300/80 to-amber-700 text-studio-950'
                  : 'bg-studio-800 text-slate-300 border border-white/10';

            return (
              <motion.div
                key={team.id}
                layout
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-md ${cardFrame} ${
                  compactMode || useTwoColumns ? 'px-6 py-4' : 'px-8 py-5'
                }`}
              >
                {/* Shimmer on #1 */}
                {isFirst && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-200/15 to-transparent animate-shimmer" />
                  </div>
                )}

                {/* Team Accent Stripe */}
                <div className={`absolute inset-y-0 left-0 w-2 bg-gradient-to-b ${accent.bar}`} />

                <div className="relative flex items-center justify-between gap-6 pl-2">
                  {/* Left: Rank + Team Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-5">
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-xl font-display font-black ${rankBadgeStyle} ${
                        compactMode || useTwoColumns ? 'h-14 w-14 text-3xl' : 'h-16 w-16 text-4xl'
                      }`}
                    >
                      {isFirst ? <Crown className="h-8 w-8 stroke-[2.5]" /> : `#${rank}`}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h2
                          className={`truncate font-display font-black tracking-wide uppercase ${
                            isFirst ? 'text-amber-200' : 'text-white'
                          } ${compactMode || useTwoColumns ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}
                        >
                          {team.name}
                        </h2>
                        {isFirst && (
                          <span className="hidden rounded-md bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase md:inline-block">
                            {t.leaderboard.leader}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2.5 text-lg font-semibold text-slate-300 md:text-xl">
                        <span className="truncate">{team.playerA}</span>
                        <span className={`font-black ${accent.text}`}>•</span>
                        <span className="truncate">{team.playerB}</span>
                      </div>

                      {/* Subtle Score Proportion Bar */}
                      <div className="mt-2.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            isFirst ? 'from-yellow-300 via-amber-400 to-amber-500' : accent.bar
                          }`}
                          initial={false}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Animated Score + Live Delta Pop */}
                  <div className="relative flex shrink-0 items-center gap-3 text-right">
                    <AnimatePresence>
                      {flash && (
                        <motion.div
                          key={flash.id}
                          initial={{ opacity: 0, y: 12, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -18, scale: 0.9 }}
                          className={`rounded-xl px-3 py-1 font-mono text-xl font-extrabold shadow-lg ${
                            flash.delta > 0
                              ? 'bg-emerald-400/25 text-emerald-300 border border-emerald-400/50'
                              : 'bg-rose-500/25 text-rose-300 border border-rose-400/50'
                          }`}
                        >
                          {flash.delta > 0 ? `+${flash.delta}` : flash.delta}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <div
                        className={`font-mono font-extrabold tracking-tight ${
                          isFirst ? 'text-gradient-gold drop-shadow-[0_4px_16px_rgba(255,201,51,0.4)]' : 'text-white'
                        } ${compactMode || useTwoColumns ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'}`}
                      >
                        <AnimatedScore value={team.score} />
                      </div>
                      <div className="font-mono text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">
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
