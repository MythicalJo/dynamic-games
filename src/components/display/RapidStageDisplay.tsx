import { AnimatePresence, motion } from 'framer-motion';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';
import { AnimatedScore } from '../shared/AnimatedScore';

export function RapidStageDisplay() {
  const { state, recentFlashes, t } = useShow();
  const { stageState, questions, teams, eventMeta } = state;

  const activeQuestion = questions.find((q) => q.id === stageState.selectedQuestionId) ?? null;
  const spotlightTeam = teams.find((teamItem) => teamItem.id === stageState.spotlightTeamId) ?? null;
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="flex h-full w-full flex-col justify-between px-12 py-9 md:px-20 md:py-11">
      {/* Top Minimal Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold tracking-[0.24em] text-accent uppercase">
            {eventMeta.title}
          </span>
          <span className="text-ink-subtle">/</span>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
            {stageState.roundLabel || t.rapidStage.display.activeGameStage}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {spotlightTeam && (
            <motion.div
              key={spotlightTeam.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: TEAM_ACCENTS[spotlightTeam.accent].hex }}
              />
              <span className="font-mono text-xs font-bold tracking-wider text-ink-subtle uppercase">
                {t.rapidStage.display.onStageNow}:
              </span>
              <span className="text-sm font-extrabold text-ink uppercase">
                {spotlightTeam.name} ({spotlightTeam.playerA} y {spotlightTeam.playerB})
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Centered Question Card */}
      <div className="my-auto flex w-full flex-1 flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {activeQuestion && stageState.promptVisible ? (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="flex w-full max-w-5xl flex-col items-center gap-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="rounded-full border border-line bg-surface px-5 py-1.5 font-mono text-xs font-bold tracking-[0.22em] text-ink-muted uppercase">
                  {activeQuestion.category}
                </span>
                <span className="rounded-full bg-accent px-5 py-1.5 font-mono text-xs font-bold tracking-[0.16em] text-accent-fg uppercase">
                  +{activeQuestion.points.toLocaleString()} {t.common.pts}
                </span>
              </div>

              <div className="w-full rounded-3xl border border-line bg-surface px-10 py-14 text-center md:px-16">
                <p
                  className="font-extrabold leading-tight tracking-tight text-ink"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}
                >
                  {activeQuestion.prompt}
                </p>
              </div>

              <AnimatePresence>
                {stageState.answerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="w-full rounded-3xl border-2 border-accent bg-accent-soft px-10 py-7 text-center"
                  >
                    <div className="mb-1.5 font-mono text-xs font-bold tracking-[0.26em] text-accent uppercase">
                      {t.rapidStage.display.answerReveal}
                    </div>
                    <p
                      className="font-extrabold tracking-tight text-ink"
                      style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-line bg-surface px-14 py-14 text-center"
            >
              <p className="font-mono text-xs font-bold tracking-[0.28em] text-accent uppercase">
                {t.rapidStage.display.activeGameStage}
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-ink uppercase md:text-5xl">
                {t.rapidStage.display.getReadyTitle}
              </h2>
              <p className="mt-3 text-lg text-ink-muted">{t.rapidStage.display.getReadySub}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calm Lower-Third Score Strip */}
      {stageState.showBottomScores && sortedTeams.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-line pt-4">
          {sortedTeams.map((team) => {
            const accent = TEAM_ACCENTS[team.accent];
            const isSpotlight = team.id === stageState.spotlightTeamId;
            const flash = recentFlashes.find((f) => f.teamId === team.id);
            return (
              <div
                key={team.id}
                className={`flex items-center gap-3 rounded-full border px-4 py-1.5 ${
                  isSpotlight
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent.hex }}
                />
                <span className="text-sm font-bold text-ink uppercase">{team.name}</span>
                <span className="font-mono text-base font-extrabold text-accent">
                  <AnimatedScore value={team.score} />
                </span>
                <AnimatePresence>
                  {flash && (
                    <motion.span
                      key={flash.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`font-mono text-xs font-bold ${
                        flash.delta > 0 ? 'text-ok' : 'text-err'
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
