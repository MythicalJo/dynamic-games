import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, Tv2, Zap } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';
import { AnimatedScore } from '../shared/AnimatedScore';

export function RapidStageDisplay() {
  const { state, recentFlashes, t } = useShow();
  const { stageState, questions, teams, eventMeta } = state;

  const activeQuestion = questions.find((q) => q.id === stageState.selectedQuestionId) ?? null;
  const spotlightTeam = teams.find((t) => t.id === stageState.spotlightTeamId) ?? null;
  const spotlightAccent = spotlightTeam ? TEAM_ACCENTS[spotlightTeam.accent] : null;

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 py-8 md:px-16 md:py-9">
      {/* Top Broadcast Stage Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/15 px-4 py-1.5">
            <Zap className="h-4 w-4 text-amber-300" />
            <span className="font-display text-xl font-extrabold tracking-widest text-amber-200 uppercase">
              {eventMeta.title}
            </span>
          </div>
          <span className="font-mono text-sm font-bold tracking-[0.22em] text-cyan-300 uppercase">
            {stageState.roundLabel || 'LIVE STAGE'}
          </span>
        </div>

        {/* Spotlighted Team Badge */}
        <AnimatePresence mode="wait">
          {spotlightTeam && spotlightAccent && (
            <motion.div
              key={spotlightTeam.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`flex items-center gap-3 rounded-2xl border ${spotlightAccent.border} bg-studio-900/90 px-5 py-2 backdrop-blur-md ${spotlightAccent.glow}`}
            >
              <Star className={`h-5 w-5 ${spotlightAccent.text}`} />
              <div className="text-right">
                <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase">
                  {t.rapidStage.display.onStageNow}
                </div>
                <div className="font-display text-2xl font-extrabold leading-none text-white uppercase">
                  {spotlightTeam.name}{' '}
                  <span className={`text-lg font-semibold ${spotlightAccent.text}`}>
                    ({spotlightTeam.playerA} &amp; {spotlightTeam.playerB})
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Center Broadcast Stage */}
      <div className="my-auto flex w-full flex-1 flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {activeQuestion && stageState.promptVisible ? (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full max-w-6xl flex-col items-center gap-6"
            >
              {/* Category + Points Value Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="rounded-full border border-cyan-400/50 bg-cyan-400/15 px-6 py-1.5 font-mono text-base font-bold tracking-[0.24em] text-cyan-200 uppercase glow-cyan">
                  {activeQuestion.category}
                </span>
                <span className="rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/25 to-yellow-400/20 px-6 py-1.5 font-mono text-base font-extrabold tracking-[0.18em] text-amber-200 uppercase glow-gold">
                  +{activeQuestion.points.toLocaleString()} PTS
                </span>
              </div>

              {/* Giant High-Contrast Question Board */}
              <div className="relative w-full overflow-hidden rounded-[2rem] border-2 border-cyan-400/35 bg-studio-900/85 px-10 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:px-16 md:py-14">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                <p
                  className="font-sans font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  style={{ fontSize: 'clamp(2rem, 4.1vw, 3.85rem)' }}
                >
                  {activeQuestion.prompt}
                </p>
              </div>

              {/* Dramatic Answer Reveal Panel */}
              <AnimatePresence>
                {stageState.answerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="relative w-full overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/25 via-studio-900/95 to-amber-500/25 px-10 py-7 text-center glow-gold backdrop-blur-xl"
                  >
                    <div className="mb-1.5 flex items-center justify-center gap-2 font-mono text-sm font-extrabold tracking-[0.3em] text-amber-300 uppercase">
                      <Sparkles className="h-4 w-4" />
                      <span>{t.rapidStage.display.answerReveal}</span>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <p
                      className="font-display font-extrabold tracking-wide text-amber-100"
                      style={{ fontSize: 'clamp(1.75rem, 3.3vw, 3rem)' }}
                    >
                      {activeQuestion.answer || t.rapidStage.display.hostCall}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="stage-standby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-cyan-400/25 bg-studio-900/75 px-16 py-14 text-center backdrop-blur-xl glow-cyan"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/15">
                <Tv2 className="h-10 w-10 text-amber-300" />
              </div>
              <p className="font-mono text-sm font-bold tracking-[0.3em] text-cyan-300 uppercase">
                {t.rapidStage.display.activeGameStage}
              </p>
              <h2 className="mt-2 font-display text-6xl font-black tracking-wide text-gradient-gold uppercase md:text-7xl">
                {t.rapidStage.display.getReadyTitle}
              </h2>
              <p className="mt-3 text-xl font-medium text-slate-300">
                {t.rapidStage.display.getReadySub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optional Compact Lower-Third Live Score Ticker */}
      {stageState.showBottomScores && sortedTeams.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {sortedTeams.map((team) => {
            const accent = TEAM_ACCENTS[team.accent];
            const isSpotlight = team.id === stageState.spotlightTeamId;
            const flash = recentFlashes.find((f) => f.teamId === team.id);
            return (
              <div
                key={team.id}
                className={`relative flex items-center gap-3.5 rounded-xl border px-4 py-2 backdrop-blur-md transition ${
                  isSpotlight
                    ? `${accent.border} bg-studio-800/95 ${accent.glow}`
                    : 'border-white/12 bg-studio-900/80'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <span className="font-display text-xl font-extrabold tracking-wide text-white uppercase">
                  {team.name}
                </span>
                <span className="font-mono text-xl font-extrabold text-amber-300">
                  <AnimatedScore value={team.score} />
                </span>
                <AnimatePresence>
                  {flash && (
                    <motion.span
                      key={flash.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: -2 }}
                      exit={{ opacity: 0, y: -14 }}
                      className={`font-mono text-sm font-black ${
                        flash.delta > 0 ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {flash.delta > 0 ? `+${flash.delta}` : flash.delta}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
