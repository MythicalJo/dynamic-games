import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FastForward,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trophy,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { TEAM_ACCENTS } from '../../../types/show';
import { useFastMoney } from './useFastMoney';

type HostSubView = 'setup' | 'live' | 'reveal';

function formatClock(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < 10000 && safe > 0) {
    return (safe / 1000).toFixed(1);
  }
  return String(Math.ceil(safe / 1000)).padStart(2, '0');
}

export function FastMoneyHost() {
  const { state, setDisplayMode, t } = useShow();
  const {
    fmState,
    selectedTeam,
    activeSession,
    activeRoundState,
    remainingMs,
    round1Total,
    round2Total,
    activeRoundTotal,
    combinedTotal,
    guessingPlayerName,
    secretOwnerName,
    getActualAnswerForRound,
    selectTeam,
    updateQuestionItem,
    loadSampleQuestions,
    setActiveRound,
    setPhase,
    startTimer,
    pauseTimer,
    resetTimer,
    addFiveSeconds,
    setActiveSlotIndex,
    updateSlotGuess,
    passSlot,
    toggleRevealGuess,
    toggleRevealActual,
    scoreSlot,
    resetCurrentRound,
  } = useFastMoney();

  const [subView, setSubView] = useState<HostSubView>(() =>
    fmState.phase === 'reveal' ? 'reveal' : 'live'
  );
  const [maskSecrets, setMaskSecrets] = useState(false);
  const [confirmResetRound, setConfirmResetRound] = useState(false);
  const prevPhaseRef = useRef(fmState.phase);

  useEffect(() => {
    if (fmState.phase !== prevPhaseRef.current) {
      prevPhaseRef.current = fmState.phase;
      setSubView(fmState.phase === 'reveal' ? 'reveal' : 'live');
    }
  }, [fmState.phase]);

  const liveInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSwitchSubView = (view: HostSubView) => {
    setSubView(view);
    if (view === 'live' && fmState.phase !== 'play') {
      setPhase('play');
    } else if (view === 'reveal' && fmState.phase !== 'reveal') {
      setPhase('reveal');
    }
  };

  const focusSlotInput = (index: number) => {
    window.setTimeout(() => {
      const el = liveInputRefs.current[index];
      if (el) {
        el.focus();
        el.select();
      }
    }, 15);
  };

  const answeredCount = activeRoundState.slots.filter((s) => s.status === 'answered').length;
  const passedCount = activeRoundState.slots.filter((s) => s.status === 'passed').length;
  const remainingSec = remainingMs / 1000;
  const timerUrgent = remainingMs > 0 && remainingSec <= 5;
  const timerWarn = remainingMs > 0 && remainingSec <= 10 && !timerUrgent;

  if (!selectedTeam) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-400/40 bg-studio-900/80 p-8 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-amber-400/70" />
        <h3 className="font-display text-2xl font-extrabold text-white uppercase">
          {t.fastMoney.needTeamTitle}
        </h3>
        <p className="mt-1 text-sm text-slate-400">{t.fastMoney.needTeamDesc}</p>
      </div>
    );
  }

  const teamAccent = TEAM_ACCENTS[selectedTeam.accent];

  return (
    <div className="space-y-5">
      {/* Top Command Header */}
      <section className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-studio-900 to-studio-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-400/15 glow-gold">
              <Flame className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-3xl font-black tracking-wide text-gradient-gold uppercase leading-none">
                  {t.fastMoney.title}
                </h2>
                <span className="rounded-md border border-cyan-400/35 bg-cyan-400/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-cyan-200 uppercase">
                  {fmState.phase === 'play'
                    ? t.fastMoney.liveModeBadge
                    : t.fastMoney.revealModeBadge}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{t.fastMoney.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[210px]">
              <label className="mb-1 block font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {t.fastMoney.playingTeam}
              </label>
              <select
                value={selectedTeam.id}
                onChange={(e) => selectTeam(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-studio-950 px-3 py-2 text-sm font-bold text-white outline-none focus:border-amber-400"
              >
                {state.teams.map((teamItem) => (
                  <option key={teamItem.id} value={teamItem.id}>
                    {teamItem.name} ({teamItem.playerA} &amp; {teamItem.playerB})
                  </option>
                ))}
              </select>
            </div>

            <div className={`rounded-xl border ${teamAccent.border} bg-studio-950/90 px-4 py-2 text-right`}>
              <div className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {t.common.globalScore}
              </div>
              <div className="font-mono text-2xl font-extrabold text-amber-300 tabular-nums leading-tight">
                {selectedTeam.score.toLocaleString()}
              </div>
            </div>

            {state.displayMode !== 'game' && (
              <button
                type="button"
                onClick={() => setDisplayMode('game')}
                className="rounded-xl bg-cyan-400 px-3.5 py-2.5 text-xs font-extrabold text-studio-950 transition hover:brightness-110"
              >
                {t.common.pushToDisplay}
              </button>
            )}
          </div>
        </div>

        {/* Workflow Step Tabs */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleSwitchSubView('setup')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              subView === 'setup'
                ? 'border-cyan-400/70 bg-cyan-400/20 text-cyan-100 glow-cyan'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            <span>{t.fastMoney.tabs.setup}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchSubView('live')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              subView === 'live'
                ? 'border-amber-400/80 bg-amber-400/20 text-amber-100 glow-gold'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t.fastMoney.tabs.live(answeredCount)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchSubView('reveal')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              subView === 'reveal'
                ? 'border-emerald-400/75 bg-emerald-400/20 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>{t.fastMoney.tabs.reveal(activeRoundTotal)}</span>
          </button>
        </div>
      </section>

      {/* VIEW 1: PRE-GAME SETUP */}
      {subView === 'setup' && (
        <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {t.fastMoney.setup.heading(selectedTeam.name)}
              </h3>
              <p className="text-xs text-slate-400">{t.fastMoney.setup.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMaskSecrets((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                {maskSecrets ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {maskSecrets ? t.fastMoney.setup.showSecrets : t.fastMoney.setup.hideSecrets}
              </button>

              <button
                type="button"
                onClick={loadSampleQuestions}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/12 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.fastMoney.setup.loadSamples}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {activeSession.questions.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-studio-950/75 p-4 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <label className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300 uppercase">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/20 text-[11px]">
                      {idx + 1}
                    </span>
                    {t.fastMoney.setup.shortQuestion}
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateQuestionItem(idx, { question: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="mb-1 block font-mono text-[11px] font-bold text-amber-300 uppercase">
                    {t.fastMoney.setup.playerASecret(selectedTeam.playerA)}
                  </label>
                  <input
                    type={maskSecrets ? 'password' : 'text'}
                    value={item.playerAAnswer}
                    onChange={(e) => updateQuestionItem(idx, { playerAAnswer: e.target.value })}
                    className="w-full rounded-xl border border-amber-400/25 bg-studio-900 px-3 py-2 text-sm font-medium text-amber-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="mb-1 block font-mono text-[11px] font-bold text-fuchsia-300 uppercase">
                    {t.fastMoney.setup.playerBSecret(selectedTeam.playerB)}
                  </label>
                  <input
                    type={maskSecrets ? 'password' : 'text'}
                    value={item.playerBAnswer}
                    onChange={(e) => updateQuestionItem(idx, { playerBAnswer: e.target.value })}
                    className="w-full rounded-xl border border-fuchsia-400/25 bg-studio-900 px-3 py-2 text-sm font-medium text-fuchsia-100 outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => handleSwitchSubView('live')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2.5 text-sm font-extrabold text-studio-950 shadow-[0_0_20px_rgba(255,201,51,0.3)] transition hover:brightness-110"
            >
              <span>{t.fastMoney.setup.readyGoLive}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </section>
      )}

      {/* VIEW 2: LIVE 30S ROUND */}
      {subView === 'live' && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="rounded-2xl border border-white/10 bg-studio-900/90 p-5 xl:col-span-6">
              <div className="mb-3 font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t.fastMoney.live.selectRound}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveRound(1)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    fmState.activeRound === 1
                      ? 'border-cyan-400/80 bg-cyan-400/15 glow-cyan'
                      : 'border-white/10 bg-studio-950/65 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-cyan-300 uppercase">
                      {t.fastMoney.live.round(1)}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {round1Total} {t.common.pts.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-xl font-black text-white uppercase">
                    {t.fastMoney.live.guessesTitle(selectedTeam.playerA)}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t.fastMoney.live.guessingPartner(selectedTeam.playerB)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRound(2)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    fmState.activeRound === 2
                      ? 'border-amber-400/80 bg-amber-400/15 glow-gold'
                      : 'border-white/10 bg-studio-950/65 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-amber-300 uppercase">
                      {t.fastMoney.live.round(2)}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {round2Total} {t.common.pts.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-xl font-black text-white uppercase">
                    {t.fastMoney.live.guessesTitle(selectedTeam.playerB)}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t.fastMoney.live.guessingPartner(selectedTeam.playerA)}
                  </div>
                </button>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 transition xl:col-span-6 ${
                timerUrgent
                  ? 'border-rose-500/80 bg-rose-500/15 glow-live'
                  : timerWarn
                    ? 'border-amber-400/70 bg-amber-500/12'
                    : 'border-cyan-400/35 bg-studio-900/90'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                    {t.fastMoney.live.clockLabel} (
                    {fmState.timer.isRunning
                      ? t.common.running
                      : remainingMs === 0
                        ? t.common.timesUp
                        : t.common.ready}
                    )
                  </div>
                  <div
                    className={`mt-1 font-mono text-6xl font-black tabular-nums leading-none ${
                      remainingMs === 0 || timerUrgent
                        ? 'text-rose-400'
                        : timerWarn
                          ? 'text-amber-300'
                          : 'text-cyan-300'
                    }`}
                  >
                    {formatClock(remainingMs)}
                    <span className="ml-1 text-xl font-bold text-slate-400">s</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {fmState.timer.isRunning ? (
                    <button
                      type="button"
                      onClick={pauseTimer}
                      className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-studio-950 transition hover:brightness-110 active:scale-95"
                    >
                      <Pause className="h-4 w-4 fill-current" />
                      {t.common.pause}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        startTimer();
                        focusSlotInput(activeRoundState.activeSlotIndex);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-extrabold text-studio-950 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition hover:brightness-110 active:scale-95"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      {t.fastMoney.live.start30s}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={addFiveSeconds}
                    className="flex items-center gap-1 rounded-xl border border-cyan-400/50 bg-cyan-400/15 px-3.5 py-3 font-mono text-sm font-extrabold text-cyan-200 transition hover:bg-cyan-400/25 active:scale-95"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    5s
                  </button>

                  <button
                    type="button"
                    onClick={resetTimer}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t.common.reset}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                  {t.fastMoney.live.liveAnswersTitle(guessingPlayerName, secretOwnerName)}
                </h3>
                <p className="text-xs text-slate-400">{t.fastMoney.live.liveAnswersDesc}</p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs font-bold">
                <span className="rounded-lg border border-emerald-400/35 bg-emerald-400/15 px-2.5 py-1 text-emerald-300">
                  {t.fastMoney.live.lockedBadge(answeredCount)}
                </span>
                {passedCount > 0 && (
                  <span className="rounded-lg border border-amber-400/35 bg-amber-400/15 px-2.5 py-1 text-amber-300">
                    {t.fastMoney.live.passedBadge(passedCount)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {activeRoundState.slots.map((slot, idx) => {
                const q = activeSession.questions[idx];
                const isActive = activeRoundState.activeSlotIndex === idx;
                const secretRef = getActualAnswerForRound(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlotIndex(idx)}
                    className={`rounded-2xl border p-3.5 transition ${
                      isActive
                        ? 'border-cyan-400/80 bg-cyan-400/10 glow-cyan'
                        : slot.status === 'answered'
                          ? 'border-emerald-400/35 bg-emerald-400/5'
                          : slot.status === 'passed'
                            ? 'border-amber-400/45 bg-amber-400/8'
                            : 'border-white/10 bg-studio-950/70'
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
                            isActive
                              ? 'bg-cyan-400 text-studio-950'
                              : slot.status === 'answered'
                                ? 'bg-emerald-400/25 text-emerald-200'
                                : slot.status === 'passed'
                                  ? 'bg-amber-400/25 text-amber-200'
                                  : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {q?.question || `#${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {secretRef && (
                          <span className="hidden rounded-md border border-white/10 bg-studio-950/90 px-2 py-0.5 text-[11px] text-slate-400 md:inline-block">
                            {t.fastMoney.live.secretRef(secretOwnerName)}{' '}
                            <strong className="text-amber-300/90">{secretRef}</strong>
                          </span>
                        )}

                        {slot.status === 'answered' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase">
                            <CheckCircle2 className="h-3 w-3" /> {t.fastMoney.live.answered}
                          </span>
                        )}
                        {slot.status === 'passed' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/25 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-200 uppercase">
                            <FastForward className="h-3 w-3" /> {t.fastMoney.live.passed}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        ref={(el) => {
                          liveInputRefs.current[idx] = el;
                        }}
                        type="text"
                        value={slot.guess}
                        onFocus={() => setActiveSlotIndex(idx)}
                        onChange={(e) => updateSlotGuess(idx, e.target.value, false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextIdx = updateSlotGuess(idx, slot.guess, true);
                            focusSlotInput(nextIdx);
                          }
                        }}
                        placeholder={t.fastMoney.live.typeGuessPlaceholder(guessingPlayerName)}
                        className="flex-1 rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none transition focus:border-cyan-400"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextIdx = passSlot(idx);
                          focusSlotInput(nextIdx);
                        }}
                        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/15 px-4 py-2.5 font-mono text-xs font-extrabold text-amber-200 transition hover:bg-amber-400/30 active:scale-95"
                      >
                        <FastForward className="h-3.5 w-3.5" />
                        {t.fastMoney.live.passBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              {confirmResetRound ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-300">
                    {t.fastMoney.live.resetRoundConfirm(fmState.activeRound)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      resetCurrentRound();
                      setConfirmResetRound(false);
                    }}
                    className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-extrabold text-white"
                  >
                    {t.fastMoney.live.yesReset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetRound(false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmResetRound(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.fastMoney.live.resetRoundBtn(fmState.activeRound)}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSwitchSubView('reveal')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-extrabold text-studio-950 shadow-[0_0_24px_rgba(0,229,255,0.28)] transition hover:brightness-110"
              >
                <span>{t.fastMoney.live.goToRevealBtn}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 3: REVEAL & SCORING */}
      {subView === 'reveal' && (
        <section className="rounded-2xl border border-emerald-400/30 bg-studio-900/90 p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {t.fastMoney.reveal.heading(fmState.activeRound)}
              </h3>
              <p className="text-xs text-slate-400">{t.fastMoney.reveal.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl border border-white/15 bg-studio-950 p-1">
                <button
                  type="button"
                  onClick={() => setActiveRound(1)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition ${
                    fmState.activeRound === 1
                      ? 'bg-cyan-400 text-studio-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.fastMoney.live.round(1)} ({round1Total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRound(2)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs font-extrabold transition ${
                    fmState.activeRound === 2
                      ? 'bg-amber-400 text-studio-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.fastMoney.live.round(2)} ({round2Total})
                </button>
              </div>

              <div className="rounded-xl border border-amber-400/40 bg-amber-400/12 px-4 py-1.5 text-right">
                <div className="font-mono text-[10px] font-bold tracking-widest text-amber-200/80 uppercase">
                  {t.fastMoney.reveal.r1r2Total}
                </div>
                <div className="font-mono text-xl font-black text-amber-300 tabular-nums leading-tight">
                  {combinedTotal} {t.common.pts.toLowerCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {activeRoundState.slots.map((slot, idx) => {
              const q = activeSession.questions[idx];
              const actualAnswer = getActualAnswerForRound(idx);

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/12 bg-studio-950/75 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 font-mono text-xs font-extrabold text-cyan-300">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        {q?.question || `#${idx + 1}`}
                      </span>
                    </div>

                    <span
                      className={`rounded-md px-2.5 py-0.5 font-mono text-xs font-extrabold ${
                        slot.rating === 'exact'
                          ? 'bg-amber-400/25 text-amber-200'
                          : slot.rating === 'close'
                            ? 'bg-cyan-400/25 text-cyan-200'
                            : slot.rating === 'miss'
                              ? 'bg-rose-500/25 text-rose-200'
                              : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {slot.rating === 'exact' && t.fastMoney.reveal.exactBadge}
                      {slot.rating === 'close' && t.fastMoney.reveal.closeBadge}
                      {slot.rating === 'miss' && t.fastMoney.reveal.missBadge}
                      {slot.rating === null && t.fastMoney.reveal.unscored}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="flex flex-col justify-between rounded-xl border border-cyan-400/25 bg-studio-900/90 p-3 lg:col-span-4">
                      <div>
                        <div className="font-mono text-[10px] font-bold tracking-wider text-cyan-300 uppercase">
                          {t.fastMoney.reveal.playerGuessLabel(guessingPlayerName)}
                        </div>
                        <div className="mt-1 text-base font-extrabold text-white">
                          {slot.guess.trim() ? (
                            slot.guess
                          ) : (
                            <span className="text-amber-300/80 italic">
                              {slot.status === 'passed'
                                ? t.fastMoney.live.passBtn
                                : t.fastMoney.reveal.noAnswer}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRevealGuess(idx)}
                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition ${
                          slot.guessRevealed
                            ? 'border-cyan-400 bg-cyan-400 text-studio-950'
                            : 'border-cyan-400/50 bg-cyan-400/12 text-cyan-200 hover:bg-cyan-400/25'
                        }`}
                      >
                        {slot.guessRevealed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {slot.guessRevealed
                          ? t.fastMoney.reveal.hideGuessBtn
                          : t.fastMoney.reveal.revealGuessBtn}
                      </button>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-amber-400/25 bg-studio-900/90 p-3 lg:col-span-4">
                      <div>
                        <div className="font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                          {t.fastMoney.reveal.actualAnswerLabel(secretOwnerName)}
                        </div>
                        <div className="mt-1 text-base font-extrabold text-amber-100">
                          {actualAnswer.trim() || (
                            <span className="text-slate-500 italic">
                              {t.fastMoney.reveal.notPrefilled}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRevealActual(idx)}
                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition ${
                          slot.actualRevealed
                            ? 'border-amber-400 bg-amber-400 text-studio-950'
                            : 'border-amber-400/50 bg-amber-400/12 text-amber-200 hover:bg-amber-400/25'
                        }`}
                      >
                        {slot.actualRevealed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {slot.actualRevealed
                          ? t.fastMoney.reveal.hideActualBtn
                          : t.fastMoney.reveal.revealActualBtn}
                      </button>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-studio-900/90 p-3 lg:col-span-4">
                      <div className="font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        {t.fastMoney.reveal.awardRowScore}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'exact')}
                          className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition active:scale-95 ${
                            slot.rating === 'exact'
                              ? 'border-amber-300 bg-gradient-to-b from-amber-300 to-amber-500 text-studio-950 shadow-[0_0_16px_rgba(255,201,51,0.45)]'
                              : 'border-amber-400/35 bg-amber-400/10 text-amber-200 hover:bg-amber-400/25'
                          }`}
                        >
                          <Zap className="mb-0.5 h-4 w-4" />
                          <span className="font-mono text-xs font-black">+20</span>
                          <span className="text-[10px] font-bold leading-tight">
                            {t.fastMoney.reveal.exactLabel}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'close')}
                          className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition active:scale-95 ${
                            slot.rating === 'close'
                              ? 'border-cyan-300 bg-gradient-to-b from-cyan-300 to-sky-500 text-studio-950 shadow-[0_0_16px_rgba(0,229,255,0.4)]'
                              : 'border-cyan-400/35 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/25'
                          }`}
                        >
                          <CheckCircle2 className="mb-0.5 h-4 w-4" />
                          <span className="font-mono text-xs font-black">+10</span>
                          <span className="text-[10px] font-bold leading-tight">
                            {t.fastMoney.reveal.closeLabel}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'miss')}
                          className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition active:scale-95 ${
                            slot.rating === 'miss'
                              ? 'border-rose-400 bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.45)]'
                              : 'border-rose-400/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/25'
                          }`}
                        >
                          <XCircle className="mb-0.5 h-4 w-4" />
                          <span className="font-mono text-xs font-black">0</span>
                          <span className="text-[10px] font-bold leading-tight">
                            {t.fastMoney.reveal.missLabel}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => handleSwitchSubView('live')}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
            >
              {t.fastMoney.reveal.backToLive}
            </button>

            {fmState.activeRound === 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveRound(2);
                  handleSwitchSubView('live');
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2.5 text-sm font-extrabold text-studio-950 shadow-[0_0_20px_rgba(255,201,51,0.3)] transition hover:brightness-110"
              >
                <span>{t.fastMoney.reveal.startRound2(selectedTeam.playerB)}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
