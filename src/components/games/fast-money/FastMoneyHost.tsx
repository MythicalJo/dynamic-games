import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  FastForward,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import {
  FAST_MONEY_QUESTION_BANK,
  type FastMoneyCategory,
} from '../../../lib/spanishBank';
import type { GameHostProps } from '../../../modules/registry';
import type { FastMoneyStage } from '../../../types/fastMoney';
import { useFastMoney } from './useFastMoney';

function formatClock(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < 10000 && safe > 0) return (safe / 1000).toFixed(1);
  return String(Math.ceil(safe / 1000)).padStart(2, '0');
}

const CATEGORIES: ('Todas' | FastMoneyCategory)[] = [
  'Todas',
  'Fáciles',
  'Comida',
  'Cultura Popular',
  'Hábitos',
  'Anécdotas',
  'Gustos',
  'Personalidad',
  'Hipotéticas',
  'Amistad',
];

export function FastMoneyHost({ mode }: GameHostProps) {
  const { state, triggerCue, t } = useShow();
  const {
    fmState,
    stage,
    selectedTeam,
    activeSession,
    activeRoundState,
    remainingMs,
    round1Total,
    round2Total,
    combinedTotal,
    round1AnsweredCount,
    round2AnsweredCount,
    isFinalRevealComplete,
    guessingPlayerName,
    secretOwnerName,
    getActualAnswerForRound,
    selectTeam,
    updateQuestionItem,
    loadRandomFiveQuestions,
    setStage,
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
    resetTeamSession,
  } = useFastMoney();

  const [maskSecrets, setMaskSecrets] = useState(false);
  const [confirmResetRound, setConfirmResetRound] = useState(false);
  const [showBankBrowser, setShowBankBrowser] = useState(false);
  const [selectedBankCat, setSelectedBankCat] = useState<'Todas' | FastMoneyCategory>('Todas');
  const [targetSlotForPick, setTargetSlotForPick] = useState<number>(0);

  const liveInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setConfirmResetRound(false);
  }, [stage]);

  const focusSlotInput = (index: number) => {
    window.setTimeout(() => {
      const el = liveInputRefs.current[index];
      if (el) {
        el.focus();
        el.select();
      }
    }, 15);
  };

  if (!selectedTeam) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-ink-subtle" />
        <h3 className="text-lg font-bold text-ink">{t.fastMoney.needTeamTitle}</h3>
        <p className="mt-1 text-xs text-ink-muted">{t.fastMoney.needTeamDesc}</p>
      </div>
    );
  }

  /* ===================================================================== */
  /* SETUP MODE: 5 Preguntas + Respuestas Secretas + Banco de 40 preguntas */
  /* ===================================================================== */
  if (mode === 'setup') {
    const filteredBank =
      selectedBankCat === 'Todas'
        ? FAST_MONEY_QUESTION_BANK
        : FAST_MONEY_QUESTION_BANK.filter((q) => q.category === selectedBankCat);

    const remainingFreshCount = Math.max(
      0,
      FAST_MONEY_QUESTION_BANK.length -
        new Set(fmState.recentQuestions).size
    );

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                {t.fastMoney.setup.heading(selectedTeam.name)}
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.fastMoney.setup.desc} ({FAST_MONEY_QUESTION_BANK.length} preguntas en el banco ·{' '}
                {remainingFreshCount} sin usar)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTeam.id}
                onChange={(e) => selectTeam(e.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-bold text-ink outline-none focus:border-accent"
              >
                {state.teams.map((teamItem) => (
                  <option key={teamItem.id} value={teamItem.id}>
                    {teamItem.name} ({teamItem.playerA} y {teamItem.playerB})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadRandomFiveQuestions}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-95"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Cargar 5 al azar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBankBrowser((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  showBankBrowser
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-line bg-canvas text-ink hover:border-line-strong'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Banco ({FAST_MONEY_QUESTION_BANK.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMaskSecrets((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
              >
                {maskSecrets ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {maskSecrets ? t.fastMoney.setup.showSecrets : t.fastMoney.setup.hideSecrets}
              </button>
            </div>
          </div>

          {/* 5 Preguntas y Respuestas Secretas */}
          <div className="space-y-3">
            {activeSession.questions.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-canvas p-4 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <label className="mb-1 block text-xs font-semibold text-ink-muted">
                    {idx + 1}. {t.fastMoney.setup.shortQuestion}
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateQuestionItem(idx, { question: e.target.value })}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="mb-1 block text-xs font-semibold text-ink-muted">
                    {t.fastMoney.setup.playerASecret(selectedTeam.playerA)}
                  </label>
                  <input
                    type={maskSecrets ? 'password' : 'text'}
                    value={item.playerAAnswer}
                    onChange={(e) => updateQuestionItem(idx, { playerAAnswer: e.target.value })}
                    placeholder={`Respuesta real de ${selectedTeam.playerA}...`}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="mb-1 block text-xs font-semibold text-ink-muted">
                    {t.fastMoney.setup.playerBSecret(selectedTeam.playerB)}
                  </label>
                  <input
                    type={maskSecrets ? 'password' : 'text'}
                    value={item.playerBAnswer}
                    onChange={(e) => updateQuestionItem(idx, { playerBAnswer: e.target.value })}
                    placeholder={`Respuesta real de ${selectedTeam.playerB}...`}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explorador opcional del banco de 40 preguntas */}
        {showBankBrowser && (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Banco de preguntas de Dinero Rápido ({filteredBank.length})
                </h3>
                <p className="text-xs text-ink-muted">
                  Elige una fila destino y haz clic en cualquier pregunta para cargarla.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-ink-muted">Colocar en fila:</span>
                {[0, 1, 2, 3, 4].map((slotIdx) => (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => setTargetSlotForPick(slotIdx)}
                    className={`h-7 w-7 rounded-lg font-mono text-xs font-bold transition ${
                      targetSlotForPick === slotIdx
                        ? 'bg-ink text-canvas'
                        : 'border border-line bg-canvas text-ink-muted hover:text-ink'
                    }`}
                  >
                    {slotIdx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedBankCat(cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    selectedBankCat === cat
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-line bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {filteredBank.map((entry, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    updateQuestionItem(targetSlotForPick, { question: entry.question });
                    setTargetSlotForPick((prev) => (prev + 1) % 5);
                  }}
                  className="flex items-start justify-between gap-2 rounded-xl border border-line bg-canvas p-3 text-left transition hover:border-accent"
                >
                  <span className="text-xs font-medium text-ink">{entry.question}</span>
                  <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-subtle">
                    {entry.category}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* ===================================================================== */
  /* LIVE MODE: Flujo secuencial de 4 Fases claras                         */
  /* ===================================================================== */
  const remainingSec = remainingMs / 1000;
  const isCritical = remainingMs > 0 && remainingSec <= 5;
  const isWarn = remainingMs > 0 && remainingSec <= 10 && !isCritical;

  const stages: {
    id: FastMoneyStage;
    shortTitle: string;
    detail: string;
    meta: string;
  }[] = [
    {
      id: 1,
      shortTitle: '1. Ronda 1',
      detail: `${selectedTeam.playerA} adivina a ${selectedTeam.playerB}`,
      meta: `${round1AnsweredCount}/5`,
    },
    {
      id: 2,
      shortTitle: '2. Ronda 2',
      detail: `${selectedTeam.playerB} adivina a ${selectedTeam.playerA}`,
      meta: `${round2AnsweredCount}/5`,
    },
    {
      id: 3,
      shortTitle: '3. Revelación 1',
      detail: `${selectedTeam.playerA} sobre ${selectedTeam.playerB}`,
      meta: `+${round1Total} pts`,
    },
    {
      id: 4,
      shortTitle: '4. Revelación 2',
      detail: `${selectedTeam.playerB} sobre ${selectedTeam.playerA}`,
      meta: `+${round2Total} pts`,
    },
  ];

  const currentStageInfo = stages[stage - 1];

  return (
    <div className="w-full max-w-full space-y-5">
      {/* Header + 4-Phase Step Indicator */}
      <section className="w-full max-w-full rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">{t.fastMoney.title}</h2>
            <select
              value={selectedTeam.id}
              onChange={(e) => selectTeam(e.target.value)}
              className="w-full max-w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-bold text-ink outline-none focus:border-accent sm:w-auto sm:py-1.5"
            >
              {state.teams.map((teamItem) => (
                <option key={teamItem.id} value={teamItem.id}>
                  {teamItem.name} ({teamItem.playerA} y {teamItem.playerB})
                </option>
              ))}
            </select>
          </div>

          <span className="rounded-full border border-line bg-canvas px-3 py-1 font-mono text-xs font-bold text-ink">
            Combinado: +{combinedTotal} pts
          </span>
        </div>

        {/* 4-Phase Sequential Stepper */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stages.map((item) => {
            const isCurrent = stage === item.id;
            const isPast = stage > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStage(item.id)}
                className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                  isCurrent
                    ? 'border-accent bg-accent text-accent-fg'
                    : isPast
                      ? 'border-ok/40 bg-ok-soft text-ink hover:border-ok'
                      : 'border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold">{item.shortTitle}</span>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isCurrent ? 'opacity-85' : isPast ? 'text-ok' : 'text-ink-subtle'
                    }`}
                  >
                    {item.meta}
                  </span>
                </div>
                <span
                  className={`mt-1 truncate text-[11px] font-medium ${
                    isCurrent ? 'opacity-90' : 'text-ink-muted'
                  }`}
                >
                  {item.detail}
                </span>
              </button>
            );
          })}
        </div>

        {/* BIG TIMER (Phases 1 & 2 only — thumb-friendly on mobile) */}
        {(stage === 1 || stage === 2) && (
          <div
            className={`mt-5 flex flex-col gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
              remainingMs === 0 || isCritical
                ? 'border-err bg-err-soft'
                : isWarn
                  ? 'border-warn bg-warn-soft'
                  : 'border-line bg-canvas'
            }`}
          >
            <div className="text-center sm:text-left">
              <div className="font-mono text-[11px] font-bold tracking-wider text-accent uppercase">
                Fase {stage} de 4 · {currentStageInfo.detail}
              </div>
              <div
                className={`mt-1 font-mono text-6xl font-extrabold tabular-nums leading-none ${
                  remainingMs === 0 || isCritical
                    ? 'text-err'
                    : isWarn
                      ? 'text-warn'
                      : 'text-ink'
                }`}
              >
                {formatClock(remainingMs)}
                <span className="ml-1 text-lg font-semibold text-ink-subtle">s</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {fmState.timer.isRunning ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-warn px-6 py-3 text-base font-extrabold text-warn-fg transition hover:opacity-90 active:scale-[0.98] sm:min-h-[48px] sm:w-auto sm:text-sm"
                >
                  <Pause className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                  {t.common.pause}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    startTimer();
                    focusSlotInput(activeRoundState.activeSlotIndex);
                  }}
                  className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-extrabold text-accent-fg transition hover:opacity-90 active:scale-[0.98] sm:min-h-[48px] sm:w-auto sm:text-sm"
                >
                  <Play className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                  {t.fastMoney.live.start30s}
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={addFiveSeconds}
                  className="inline-flex min-h-[46px] items-center justify-center gap-1 rounded-xl border border-line bg-surface px-4 py-3 font-mono text-sm font-bold text-ink hover:border-line-strong active:scale-95 sm:text-xs"
                >
                  <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  5s
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:text-ink active:scale-95 sm:text-xs"
                >
                  <RotateCcw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  {t.common.reset}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* PHASES 1 & 2: LIVE 30S GUESSING (NO ANSWERS REVEALED YET)         */}
      {/* ================================================================= */}
      {stage === 1 || stage === 2 ? (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-muted">
              Anota las 5 respuestas de <strong>{guessingPlayerName}</strong> (pulsa Intro para
              saltar a la siguiente o usa <strong>PASO</strong>). Todavía no se revela nada en
              pantalla.
            </p>
          </div>

          <div className="space-y-2.5">
            {activeRoundState.slots.map((slot, idx) => {
              const q = activeSession.questions[idx];
              const isActive = activeRoundState.activeSlotIndex === idx;
              const secretRef = getActualAnswerForRound(idx);

              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlotIndex(idx)}
                  className={`rounded-xl border p-3.5 transition-colors ${
                    isActive
                      ? 'border-accent bg-accent-soft'
                      : slot.status === 'answered'
                        ? 'border-ok/40 bg-ok-soft'
                        : slot.status === 'passed'
                          ? 'border-warn/50 bg-warn-soft'
                          : 'border-line bg-canvas'
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${
                          isActive
                            ? 'bg-accent text-accent-fg'
                            : 'border border-line bg-surface text-ink-muted'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {q?.question || `Pregunta ${idx + 1}`}
                      </span>
                    </div>

                    {secretRef && (
                      <span className="hidden text-[11px] text-ink-subtle md:inline">
                        {t.fastMoney.live.secretRef(secretOwnerName)}{' '}
                        <strong className="text-ink-muted">{secretRef}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex w-full max-w-full flex-wrap items-center gap-2 sm:flex-nowrap">
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
                      className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-base font-semibold text-ink outline-none focus:border-accent sm:min-h-0 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextIdx = passSlot(idx);
                        focusSlotInput(nextIdx);
                      }}
                      className="inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl border border-warn/45 bg-warn-soft px-4 py-2.5 font-mono text-xs font-bold text-warn transition hover:opacity-90 active:scale-95 sm:min-h-0 sm:px-3.5"
                    >
                      <FastForward className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      {t.fastMoney.live.passBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            {confirmResetRound ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-err">
                  {t.fastMoney.live.resetRoundConfirm(fmState.activeRound)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetCurrentRound();
                    setConfirmResetRound(false);
                  }}
                  className="rounded-lg bg-err px-3 py-1.5 text-xs font-bold text-err-fg"
                >
                  {t.fastMoney.live.yesReset}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetRound(false)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetRound(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-muted hover:text-err"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.fastMoney.live.resetRoundBtn(fmState.activeRound)}
              </button>
            )}

            {stage === 1 ? (
              <button
                type="button"
                onClick={() => setStage(2)}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-canvas transition hover:opacity-90 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:text-xs"
              >
                <span>Siguiente: Ronda 2 ({selectedTeam.playerB} adivina)</span>
                <ArrowRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStage(3)}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-fg transition hover:opacity-90 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:text-xs"
              >
                <span>Siguiente: Revelación 1 ({selectedTeam.playerA} sobre {selectedTeam.playerB})</span>
                <ArrowRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </button>
            )}
          </div>
        </section>
      ) : (
        /* ================================================================= */
        /* PHASES 3 & 4: REVEAL 1 (A sobre B) & REVEAL 2 (B sobre A + TOTAL) */
        /* ================================================================= */
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-ink">
                {stage === 3
                  ? `Revelación 1: ${selectedTeam.playerA} sobre ${selectedTeam.playerB}`
                  : `Revelación 2: ${selectedTeam.playerB} sobre ${selectedTeam.playerA}`}
              </h3>
              <p className="text-xs text-ink-muted">{t.fastMoney.reveal.desc}</p>
            </div>
            <span className="rounded-full border border-line bg-canvas px-3 py-1 font-mono text-xs font-bold text-ink">
              R1: +{round1Total} · R2: +{round2Total} · Total: +{combinedTotal} pts
            </span>
          </div>

          <div className="space-y-3">
            {activeRoundState.slots.map((slot, idx) => {
              const q = activeSession.questions[idx];
              const actualAnswer = getActualAnswerForRound(idx);

              return (
                <div key={idx} className="rounded-xl border border-line bg-canvas p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface font-mono text-xs font-bold text-ink-muted">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {q?.question || `Pregunta ${idx + 1}`}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-bold text-ink-subtle">
                      {slot.rating === 'exact' && t.fastMoney.reveal.exactBadge}
                      {slot.rating === 'close' && t.fastMoney.reveal.closeBadge}
                      {slot.rating === 'miss' && t.fastMoney.reveal.missBadge}
                      {slot.rating === null && t.fastMoney.reveal.unscored}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-3 md:col-span-4">
                      <div>
                        <div className="text-[11px] font-semibold text-ink-subtle">
                          {t.fastMoney.reveal.playerGuessLabel(guessingPlayerName)}
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-ink">
                          {slot.guess.trim() || (
                            <span className="font-normal text-ink-subtle italic">
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
                        className={`mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition active:scale-[0.98] sm:mt-2.5 sm:min-h-[36px] sm:rounded-lg sm:text-xs ${
                          slot.guessRevealed
                            ? 'border-ink bg-ink text-canvas'
                            : 'border-line bg-canvas text-ink hover:border-line-strong'
                        }`}
                      >
                        {slot.guessRevealed ? <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <EyeOff className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
                        {slot.guessRevealed
                          ? t.fastMoney.reveal.hideGuessBtn
                          : t.fastMoney.reveal.revealGuessBtn}
                      </button>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-3 md:col-span-4">
                      <div>
                        <div className="text-[11px] font-semibold text-ink-subtle">
                          {t.fastMoney.reveal.actualAnswerLabel(secretOwnerName)}
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-ink">
                          {actualAnswer.trim() || (
                            <span className="font-normal text-ink-subtle italic">
                              {t.fastMoney.reveal.notPrefilled}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRevealActual(idx)}
                        className={`mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition active:scale-[0.98] sm:mt-2.5 sm:min-h-[36px] sm:rounded-lg sm:text-xs ${
                          slot.actualRevealed
                            ? 'border-accent bg-accent text-accent-fg'
                            : 'border-line bg-canvas text-ink hover:border-line-strong'
                        }`}
                      >
                        {slot.actualRevealed ? <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <EyeOff className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
                        {slot.actualRevealed
                          ? t.fastMoney.reveal.hideActualBtn
                          : t.fastMoney.reveal.revealActualBtn}
                      </button>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-3 md:col-span-4">
                      <div className="text-[11px] font-semibold text-ink-subtle">
                        {t.fastMoney.reveal.awardRowScore}
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-2 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'exact')}
                          className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border py-2 transition active:scale-95 sm:min-h-[48px] sm:rounded-lg ${
                            slot.rating === 'exact'
                              ? 'border-ok bg-ok text-ok-fg'
                              : 'border-line bg-canvas text-ink hover:border-ok'
                          }`}
                        >
                          <span className="font-mono text-sm font-extrabold sm:text-xs">+20</span>
                          <span className="text-[11px] font-semibold sm:text-[10px]">
                            {t.fastMoney.reveal.exactLabel}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'close')}
                          className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border py-2 transition active:scale-95 sm:min-h-[48px] sm:rounded-lg ${
                            slot.rating === 'close'
                              ? 'border-accent bg-accent text-accent-fg'
                              : 'border-line bg-canvas text-ink hover:border-accent'
                          }`}
                        >
                          <span className="font-mono text-sm font-extrabold sm:text-xs">+10</span>
                          <span className="text-[11px] font-semibold sm:text-[10px]">
                            {t.fastMoney.reveal.closeLabel}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => scoreSlot(idx, 'miss')}
                          className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border py-2 transition active:scale-95 sm:min-h-[48px] sm:rounded-lg ${
                            slot.rating === 'miss'
                              ? 'border-err bg-err text-err-fg'
                              : 'border-line bg-canvas text-ink-muted hover:border-err hover:text-err'
                          }`}
                        >
                          <span className="flex items-center font-mono text-sm font-extrabold sm:text-xs">
                            <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />0
                          </span>
                          <span className="text-[11px] font-semibold sm:text-[10px]">
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

          {/* Final Combined Score Summary Box on Phase 4 */}
          {stage === 4 && (
            <div
              className={`mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${
                isFinalRevealComplete
                  ? 'border-ok bg-ok-soft'
                  : 'border-line bg-canvas'
              }`}
            >
              <div>
                <div className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                  Resultado final combinado · {selectedTeam.name}
                </div>
                <div className="mt-1 text-lg font-extrabold text-ink">
                  Ronda 1 (+{round1Total}) + Ronda 2 (+{round2Total}) ={' '}
                  <span className="text-accent">+{combinedTotal} pts</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerCue('fanfare')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-fg hover:opacity-90"
                >
                  <Trophy className="h-4 w-4" />
                  Tocar fanfarria
                </button>
              </div>
            </div>
          )}

          {/* Phase Footer Navigation */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            {stage === 3 ? (
              <>
                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:border-line-strong"
                >
                  ← Volver a Ronda 2
                </button>
                <button
                  type="button"
                  onClick={() => setStage(4)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-fg transition hover:opacity-90 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:text-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    Siguiente: Revelación 2 ({selectedTeam.playerB} sobre {selectedTeam.playerA})
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStage(3)}
                  className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:border-line-strong"
                >
                  ← Volver a Revelación 1
                </button>
                <button
                  type="button"
                  onClick={resetTeamSession}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-err"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reiniciar partida de esta pareja
                </button>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
