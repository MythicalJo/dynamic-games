import { AnimatePresence, motion } from 'framer-motion';
import { Check, FastForward, Lock, Trophy, X } from 'lucide-react';
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
    stage,
    selectedTeam,
    activeSession,
    activeRoundState,
    remainingMs,
    round1Total,
    round2Total,
    activeRoundTotal,
    combinedTotal,
    isFinalRevealComplete,
    guessingPlayerName,
    secretOwnerName,
    getActualAnswerForRound,
  } = useFastMoney();

  if (!selectedTeam) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-12 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-ink uppercase">
          {t.fastMoney.title}
        </h1>
        <p className="mt-3 font-mono text-base font-semibold tracking-[0.2em] text-ink-muted uppercase">
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

  const stageLabel =
    stage === 1
      ? 'FASE 1 DE 4 · RONDA 1'
      : stage === 2
        ? 'FASE 2 DE 4 · RONDA 2'
        : stage === 3
          ? 'FASE 3 DE 4 · REVELACIÓN 1'
          : 'FASE 4 DE 4 · REVELACIÓN 2';

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 py-8 md:px-16 md:py-10">
      {/* Editorial Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
            {t.fastMoney.title}
          </h1>
          <span className="rounded-full border border-line bg-surface px-4 py-1 font-mono text-xs font-bold tracking-[0.18em] text-accent uppercase">
            {stageLabel}
          </span>
        </div>

        <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: teamAccent.hex }}
            />
            <div>
              <div className="text-lg font-extrabold tracking-tight text-ink uppercase leading-none">
                {selectedTeam.name}
              </div>
              <div className="mt-0.5 text-xs font-medium text-ink-muted">
                {selectedTeam.playerA} y {selectedTeam.playerB}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-line" />

          <div className="text-right">
            <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-subtle uppercase">
              {t.common.teamScore}
            </div>
            <div className="font-mono text-2xl font-extrabold text-ink leading-none">
              <AnimatedScore value={selectedTeam.score} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN STAGE */}
      <AnimatePresence mode="wait">
        {stage === 1 || stage === 2 ? (
          <motion.div
            key={`fm-play-r${stage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid flex-1 grid-cols-1 items-center gap-10 py-6 lg:grid-cols-12"
          >
            {/* LEFT: Active Player + Giant Minimalist Clock */}
            <div className="flex flex-col items-center justify-center text-center lg:col-span-5">
              <span className="rounded-full border border-line bg-surface px-4 py-1 font-mono text-xs font-bold tracking-[0.24em] text-accent uppercase">
                {fmState.timer.isRunning
                  ? t.fastMoney.display.onTheClock
                  : isTimeUp
                    ? t.common.buzzer
                    : t.fastMoney.display.upToPlay}
              </span>

              <h2
                className="mt-4 font-extrabold tracking-tight text-ink uppercase"
                style={{ fontSize: 'clamp(3rem, 5.5vw, 5rem)', lineHeight: 0.98 }}
              >
                {guessingPlayerName}
              </h2>
              <p className="mt-2 font-mono text-sm font-semibold tracking-[0.14em] text-ink-muted uppercase">
                {t.fastMoney.display.guessingAnswers(secretOwnerName)}
              </p>

              <div
                className={`mt-8 flex w-full max-w-sm flex-col items-center rounded-3xl border-2 px-8 py-9 transition-colors ${
                  isTimeUp || isCritical
                    ? 'border-err bg-err-soft'
                    : isWarning
                      ? 'border-warn bg-warn-soft'
                      : 'border-line-strong bg-surface'
                }`}
              >
                {isTimeUp ? (
                  <div
                    className="py-4 text-center font-extrabold tracking-tight text-err uppercase"
                    style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)', lineHeight: 1.05 }}
                  >
                    {t.common.timesUp}
                  </div>
                ) : (
                  <div
                    className={`font-mono font-extrabold tracking-tight tabular-nums leading-none ${
                      isCritical ? 'text-err' : isWarning ? 'text-warn' : 'text-ink'
                    }`}
                    style={{ fontSize: 'clamp(5.2rem, 10vw, 8.5rem)' }}
                  >
                    {formatDisplayClock(remainingMs)}
                  </div>
                )}

                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full transition-[width] duration-75 ${
                      isTimeUp || isCritical ? 'bg-err' : isWarning ? 'bg-warn' : 'bg-accent'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: 5 Masked Slots (No answers revealed during Phase 1 or 2) */}
            <div className="flex flex-col justify-center gap-3.5 lg:col-span-7">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-xs font-bold tracking-[0.22em] text-ink-subtle uppercase">
                  {t.fastMoney.display.slotsHeading}
                </span>
                <div className="flex items-center gap-3 font-mono text-xs font-bold">
                  <span className="text-ok">{t.fastMoney.live.lockedBadge(answeredCount)}</span>
                  {passedCount > 0 && (
                    <span className="text-warn">· {t.fastMoney.live.passedBadge(passedCount)}</span>
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
                    className={`flex items-center justify-between rounded-2xl border-2 px-6 py-5 transition-colors ${
                      isAnswered
                        ? 'border-ok bg-ok-soft'
                        : isPassed
                          ? 'border-warn bg-warn-soft'
                          : isCurrent
                            ? 'border-accent bg-accent-soft'
                            : 'border-line bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl font-mono text-xl font-extrabold ${
                          isAnswered
                            ? 'bg-ok text-ok-fg'
                            : isPassed
                              ? 'bg-warn text-warn-fg'
                              : isCurrent
                                ? 'bg-accent text-accent-fg'
                                : 'border border-line bg-canvas text-ink-subtle'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {isAnswered ? (
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-32 rounded-full bg-ok/40 sm:w-44" />
                          <span className="h-2.5 w-14 rounded-full bg-ok/25 sm:w-20" />
                        </div>
                      ) : isPassed ? (
                        <span className="text-xl font-extrabold tracking-wide text-warn uppercase">
                          {t.fastMoney.display.passedComeBack}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 opacity-35">
                          <span className="h-2.5 w-28 rounded-full bg-ink-subtle sm:w-40" />
                          <span className="h-2.5 w-12 rounded-full bg-ink-subtle sm:w-16" />
                        </div>
                      )}
                    </div>

                    <div>
                      {isAnswered && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-ok px-4 py-1 font-mono text-xs font-bold tracking-widest text-ok-fg uppercase">
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          {t.fastMoney.display.lockedIn}
                        </span>
                      )}
                      {isPassed && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-warn px-4 py-1 font-mono text-xs font-bold tracking-widest text-warn-fg uppercase">
                          <FastForward className="h-3.5 w-3.5" />
                          {t.fastMoney.display.passedPill}
                        </span>
                      )}
                      {!isAnswered && !isPassed && isCurrent && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1 font-mono text-xs font-bold tracking-widest text-accent-fg uppercase">
                          {t.common.active}
                        </span>
                      )}
                      {!isAnswered && !isPassed && !isCurrent && (
                        <Lock className="h-4 w-4 text-ink-subtle" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* PHASES 3 & 4: 2-COLUMN REVEAL BOARD */
          <motion.div
            key={`fm-reveal-s${stage}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col justify-between py-5"
          >
            {/* Column Headers */}
            <div className="mb-3 grid grid-cols-12 items-center gap-4 px-2 font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
              <div className="col-span-5">{t.fastMoney.display.guessCol(guessingPlayerName)}</div>
              <div className="col-span-5">{t.fastMoney.display.actualCol(secretOwnerName)}</div>
              <div className="col-span-2 text-center">{t.common.points}</div>
            </div>

            {/* 5 Reveal Rows */}
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
                    className={`grid grid-cols-12 items-stretch gap-3.5 rounded-2xl border p-2.5 transition-colors ${
                      isExact
                        ? 'border-ok bg-ok-soft'
                        : isClose
                          ? 'border-accent bg-accent-soft'
                          : isMiss
                            ? 'border-err/50 bg-err-soft'
                            : 'border-line bg-surface'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3.5" style={{ perspective: 900 }}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas font-mono text-lg font-bold text-ink-muted">
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        {q?.question && (
                          <div className="mb-1 truncate text-xs font-medium text-ink-muted">
                            {q.question}
                          </div>
                        )}

                        <AnimatePresence mode="wait">
                          {slot.guessRevealed ? (
                            <motion.div
                              key="g-open"
                              initial={{ rotateX: -80, opacity: 0 }}
                              animate={{ rotateX: 0, opacity: 1 }}
                              exit={{ rotateX: 80, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                              className="flex min-h-[3rem] items-center rounded-xl border border-line-strong bg-canvas px-4 py-2"
                            >
                              {slot.guess.trim() ? (
                                <span className="truncate text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
                                  {slot.guess}
                                </span>
                              ) : (
                                <span className="font-mono text-base font-bold text-warn uppercase">
                                  {slot.status === 'passed'
                                    ? t.fastMoney.display.passedPill
                                    : t.fastMoney.display.noGuess}
                                </span>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="g-locked"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ rotateX: 70, opacity: 0 }}
                              className="flex min-h-[3rem] items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2"
                            >
                              <Lock className="h-3.5 w-3.5 text-ink-subtle" />
                              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-subtle uppercase">
                                {t.fastMoney.display.guessCol(guessingPlayerName)}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="col-span-5 flex flex-col justify-end" style={{ perspective: 900 }}>
                      <div className="mb-1 hidden text-xs font-medium text-ink-subtle sm:block">
                        {slot.actualRevealed
                          ? t.fastMoney.display.realAnswer(secretOwnerName)
                          : t.fastMoney.display.secretAnswer}
                      </div>

                      <AnimatePresence mode="wait">
                        {slot.actualRevealed ? (
                          <motion.div
                            key="a-open"
                            initial={{ rotateX: -80, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={{ rotateX: 80, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            className="flex min-h-[3rem] items-center rounded-xl border border-accent bg-canvas px-4 py-2"
                          >
                            <span className="truncate text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
                              {actualAnswer.trim() || '—'}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="a-locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ rotateX: 70, opacity: 0 }}
                            className="flex min-h-[3rem] items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2"
                          >
                            <Lock className="h-3.5 w-3.5 text-ink-subtle" />
                            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-subtle uppercase">
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
                            key="p-exact"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-ok px-2 py-1 text-ok-fg"
                          >
                            <div className="font-mono text-3xl font-extrabold leading-none">+20</div>
                            <span className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase">
                              {t.fastMoney.display.exactMatchStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === 'close' && (
                          <motion.div
                            key="p-close"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-accent px-2 py-1 text-accent-fg"
                          >
                            <div className="font-mono text-3xl font-extrabold leading-none">+10</div>
                            <span className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
                              {t.fastMoney.display.closeMatchStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === 'miss' && (
                          <motion.div
                            key="p-miss"
                            initial={{ x: -8, opacity: 0 }}
                            animate={{ x: [0, -6, 6, -3, 3, 0], opacity: 1 }}
                            transition={{ duration: 0.35 }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-err bg-err-soft px-2 py-1 text-err"
                          >
                            <div className="flex items-center gap-0.5 font-mono text-2xl font-extrabold leading-none">
                              <X className="h-5 w-5" />0
                            </div>
                            <span className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                              {t.fastMoney.display.missStamp}
                            </span>
                          </motion.div>
                        )}

                        {slot.rating === null && (
                          <div className="flex h-full w-full items-center justify-center rounded-xl border border-line bg-canvas font-mono text-xl font-semibold text-ink-subtle">
                            —
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Totals Bar (Phase 3 shows Round 1 total; Phase 4 shows R1 + R2 = Combined Final Total) */}
            <div
              className={`mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 px-6 py-4 transition-colors ${
                isFinalRevealComplete
                  ? 'border-ok bg-ok-soft'
                  : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                {isFinalRevealComplete && (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ok text-ok-fg">
                    <Trophy className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink-subtle uppercase">
                    {stage === 3
                      ? `REVELACIÓN 1 · ${selectedTeam.playerA} SOBRE ${selectedTeam.playerB}`
                      : isFinalRevealComplete
                        ? `MARCADOR FINAL DE DINERO RÁPIDO · ${selectedTeam.name}`
                        : `REVELACIÓN 2 · ${selectedTeam.playerB} SOBRE ${selectedTeam.playerA}`}
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-ink uppercase">
                    {t.fastMoney.display.playerRun(guessingPlayerName)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-7">
                {stage === 4 && (
                  <>
                    <div className="text-right">
                      <div className="font-mono text-[11px] font-bold tracking-[0.18em] text-ink-subtle uppercase">
                        RONDA 1
                      </div>
                      <div className="font-mono text-3xl font-bold text-ink-muted leading-none">
                        +{round1Total}
                      </div>
                    </div>

                    <div className="h-9 w-px bg-line" />
                  </>
                )}

                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold tracking-[0.18em] text-ink-muted uppercase">
                    {stage === 3 ? 'TOTAL RONDA 1' : 'RONDA 2'}
                  </div>
                  <div className="font-mono text-4xl font-extrabold text-accent leading-none">
                    +<AnimatedScore value={stage === 3 ? activeRoundTotal : round2Total} />
                  </div>
                </div>

                {stage === 4 && (
                  <>
                    <div className="h-10 w-px bg-line" />

                    <div className="text-right">
                      <div className="font-mono text-[11px] font-bold tracking-[0.18em] text-ok uppercase">
                        TOTAL COMBINADO
                      </div>
                      <div className="font-mono text-5xl font-extrabold text-ink leading-none">
                        +<AnimatedScore value={combinedTotal} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
