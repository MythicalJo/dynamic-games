import React, { useState } from 'react';
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { MENTAL_SYNC_PROMPT_BANK } from '../../../lib/spanishBank';
import { formatBroadcastTimer } from '../../../lib/timer';
import type { GameHostProps } from '../../../modules/registry';
import { MENTAL_SYNC_MATCH_POINTS } from '../../../types/mentalSync';
import { TEAM_ACCENTS } from '../../../types/show';
import { useMentalSync } from './useMentalSync';

const TIMER_PRESETS = [10, 15, 20, 30];

export function MentalSyncHost({ mode }: GameHostProps) {
  const { state, t } = useShow();
  const {
    syncState,
    activeTeam,
    activePrompt,
    unusedBankCount,
    remainingMs,
    addPrompt,
    updatePrompt,
    deletePrompt,
    loadSamplePrompts,
    loadRandomTwelvePrompts,
    selectPrompt,
    setTimerEnabled,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    setWhiteboardAnswers,
    scoreTeamForPrompt,
    clearResultOverlay,
  } = useMentalSync();

  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const currentIdx = syncState.prompts.findIndex((p) => p.id === syncState.selectedPromptId);

  const stepPrompt = (dir: -1 | 1) => {
    if (syncState.prompts.length === 0) return;
    const len = syncState.prompts.length;
    const nextIdx = ((currentIdx >= 0 ? currentIdx : 0) + dir + len) % len;
    selectPrompt(syncState.prompts[nextIdx].id);
  };

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addPrompt('who', newText);
    setNewText('');
  };

  /* ===================================================================== */
  /* SETUP MODE: Mazo de 12 Preguntas + "Cargar 12 al azar"                */
  /* ===================================================================== */
  if (mode === 'setup') {
    return (
      <section className="w-full max-w-full rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
              <Brain className="h-5 w-5 shrink-0 text-accent" />
              <span>
                {t.mentalSync.setupTitle} ({syncState.prompts.length})
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t.mentalSync.setupDesc} ({MENTAL_SYNC_PROMPT_BANK.length} en banco ·{' '}
              {unusedBankCount} sin usar)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadRandomTwelvePrompts}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-95 sm:min-h-0"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Cargar 12 al azar</span>
            </button>

            <button
              type="button"
              onClick={loadSamplePrompts}
              className="min-h-[40px] rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-2 sm:min-h-0"
            >
              {t.mentalSync.resetSamples}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAddPrompt}
          className="mb-5 grid w-full max-w-full grid-cols-1 gap-3 rounded-xl border border-line bg-canvas p-4 md:grid-cols-12"
        >
          <div className="min-w-0 md:col-span-10">
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              {t.mentalSync.promptText}
            </label>
            <input
              type="text"
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={t.mentalSync.promptPlaceholder}
              className="w-full max-w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink outline-none focus:border-accent sm:text-sm"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-fg sm:min-h-[38px]"
            >
              <Plus className="h-4 w-4" />
              {t.common.add}
            </button>
          </div>
        </form>

        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
          {syncState.prompts.map((p, idx) => {
            const isSelected = p.id === syncState.selectedPromptId;
            const isEditing = editingId === p.id;

            if (isEditing) {
              return (
                <div key={p.id} className="flex flex-col gap-2 bg-surface p-3 sm:flex-row">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-base text-ink outline-none focus:border-accent sm:text-sm"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (editText.trim()) updatePrompt(p.id, { type: 'who', text: editText });
                        setEditingId(null);
                      }}
                      className="rounded-lg bg-accent p-2 text-accent-fg"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-line p-2 text-ink-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink-subtle">#{idx + 1}</span>
                    <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted uppercase">
                      {t.mentalSync.whoTag}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm font-medium text-ink">{p.text}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectPrompt(p.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-ink text-canvas'
                        : 'border border-line bg-surface text-ink hover:border-line-strong'
                    }`}
                  >
                    {isSelected ? t.common.onStage : t.common.loadLive}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditText(p.text);
                    }}
                    className="rounded-lg border border-line p-1.5 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePrompt(p.id)}
                    className="rounded-lg border border-line p-1.5 text-ink-subtle hover:border-err/40 hover:bg-err-soft hover:text-err"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  /* ===================================================================== */
  /* LIVE MODE: Current Question + Multi-Team 1-Tap Scoring + Timer        */
  /* ===================================================================== */
  const resolvePromptText = (text: string) =>
    text.replace(/\[Nombre\]/gi, activeTeam?.playerA || 'tu pareja');
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;

  const checkedCount = state.teams.filter((teamItem) => {
    const res = syncState.teamResults[teamItem.id];
    return res === 'match' || res === 'mismatch';
  }).length;

  return (
    <div className="w-full max-w-full space-y-5">
      {/* Row 1: Current Question + Editable Timer */}
      <section className="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-12">
        {/* Current Prompt + Deck Navigation */}
        <div className="w-full max-w-full min-w-0 space-y-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5 md:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
              <Brain className="h-5 w-5 shrink-0 text-accent" />
              <span>{t.mentalSync.title}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={loadRandomTwelvePrompts}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-95"
                title={`Quedan ${unusedBankCount} preguntas sin usar en el banco`}
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Cargar 12 al azar</span>
              </button>
              <button
                type="button"
                onClick={() => stepPrompt(-1)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-line bg-canvas text-ink-muted hover:text-ink"
                aria-label="Pregunta anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => stepPrompt(1)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-line bg-canvas text-ink-muted hover:text-ink"
                aria-label="Siguiente pregunta"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Prompt Card */}
          {activePrompt && (
            <div className="w-full max-w-full rounded-xl border border-line bg-canvas p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-accent uppercase">
                  Pregunta {currentIdx >= 0 ? currentIdx + 1 : 0} de {syncState.prompts.length} ·{' '}
                  {t.mentalSync.whoTag}
                </span>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                  +{MENTAL_SYNC_MATCH_POINTS} pts
                </span>
              </div>
              <p className="mt-1.5 break-words text-base font-bold text-ink">
                {resolvePromptText(activePrompt.text)}
              </p>
            </div>
          )}

          {/* Compact 1–12 Numbered Quick Jump Strip */}
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] font-bold tracking-wider text-ink-subtle uppercase">
              Mazo activo ({syncState.prompts.length} preguntas)
            </div>
            <div className="max-h-40 divide-y divide-line overflow-y-auto rounded-xl border border-line bg-canvas">
              {syncState.prompts.map((p, idx) => {
                const isSelected = p.id === syncState.selectedPromptId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPrompt(p.id)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? 'bg-accent-soft font-bold text-ink'
                        : 'text-ink-muted hover:bg-surface hover:text-ink'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
                        isSelected
                          ? 'bg-accent text-accent-fg'
                          : 'border border-line bg-surface text-ink-subtle'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 break-words leading-snug">
                      {resolvePromptText(p.text)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editable Timer Card */}
        <div className="flex w-full max-w-full min-w-0 flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4 sm:p-5 md:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              Reloj ({syncState.timerSeconds}s)
            </span>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-ink-muted">
              <input
                type="checkbox"
                checked={syncState.timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span>{t.mentalSync.showOnDisplay}</span>
            </label>
          </div>

          {/* Quick Duration Presets + Custom Seconds Input */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1">
              {TIMER_PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerDuration(sec)}
                  className={`min-h-[32px] rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition ${
                    syncState.timerSeconds === sec
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas px-2 py-1">
              <input
                type="number"
                inputMode="numeric"
                min={3}
                max={300}
                value={syncState.timerSeconds}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isFinite(val) && val >= 3) {
                    setTimerDuration(val);
                  }
                }}
                aria-label="Segundos personalizados"
                className="w-12 bg-transparent text-center font-mono text-sm font-bold text-ink outline-none sm:text-xs"
              />
              <span className="font-mono text-[10px] font-semibold text-ink-subtle">seg</span>
            </div>
          </div>

          <div
            className={`my-1 text-center font-mono text-6xl font-extrabold tabular-nums leading-none ${
              !syncState.timerEnabled
                ? 'text-ink-subtle opacity-40'
                : remainingMs === 0 || isUrgent
                  ? 'text-err'
                  : 'text-ink'
            }`}
          >
            {formatBroadcastTimer(remainingMs)}
            <span className="ml-1 text-lg font-semibold text-ink-subtle">s</span>
          </div>

          <div className="flex items-center gap-2">
            {syncState.timer.isRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-warn py-3 text-base font-extrabold text-warn-fg active:scale-[0.98] sm:min-h-[44px] sm:text-sm"
              >
                <Pause className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                {t.common.pause}
              </button>
            ) : (
              <button
                type="button"
                onClick={startTimer}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-base font-extrabold text-accent-fg active:scale-[0.98] sm:min-h-[44px] sm:text-sm"
              >
                <Play className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                Iniciar {syncState.timerSeconds}s
              </button>
            )}
            <button
              type="button"
              onClick={resetTimer}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-ink-muted hover:text-ink active:scale-95 sm:min-h-[44px]"
              aria-label="Reiniciar reloj"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Row 2: ALL TEAMS MULTI-TEAM RAPID SCORING LIST (directly under active question) */}
      <section className="w-full max-w-full rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-ink">
              Calificar todos los equipos · Pregunta #{currentIdx >= 0 ? currentIdx + 1 : 0}
            </h3>
            <p className="text-[11px] text-ink-muted">
              {checkedCount}/{state.teams.length} equipos calificados · toca de nuevo para deshacer
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {syncState.result !== 'pending' && (
              <button
                type="button"
                onClick={clearResultOverlay}
                className="min-h-[34px] rounded-lg border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Quitar aviso
              </button>
            )}
            <button
              type="button"
              onClick={() => stepPrompt(1)}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-ink px-3 py-1 text-xs font-bold text-canvas transition hover:opacity-90 active:scale-95"
            >
              <span>Siguiente pregunta</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {state.teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong py-6 text-center text-xs text-ink-muted">
            {t.common.noTeamsYet}
          </div>
        ) : (
          <div className="grid w-full max-w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {state.teams.map((teamItem) => {
              const teamRes = syncState.teamResults[teamItem.id] ?? 'pending';
              const accent = TEAM_ACCENTS[teamItem.accent];
              const isMatch = teamRes === 'match';
              const isMismatch = teamRes === 'mismatch';

              return (
                <div
                  key={teamItem.id}
                  className={`flex flex-col justify-between gap-2.5 rounded-xl border p-3 transition-colors ${
                    isMatch
                      ? 'border-ok bg-ok-soft'
                      : isMismatch
                        ? 'border-err/60 bg-err-soft'
                        : 'border-line bg-canvas'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent.hex }}
                        />
                        <span className="truncate text-sm font-extrabold text-ink uppercase">
                          {teamItem.name}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate pl-4 text-[11px] font-medium text-ink-muted">
                        {teamItem.playerA} y {teamItem.playerB}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {isMatch && (
                        <span className="rounded-full bg-ok px-2 py-0.5 font-mono text-[10px] font-extrabold text-ok-fg">
                          ✓ +{MENTAL_SYNC_MATCH_POINTS}
                        </span>
                      )}
                      {isMismatch && (
                        <span className="rounded-full bg-err px-2 py-0.5 font-mono text-[10px] font-extrabold text-err-fg">
                          ✕ 0
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-ink-subtle tabular-nums">
                        {teamItem.score}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => scoreTeamForPrompt(teamItem.id, 'match')}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 px-2.5 py-2 text-xs font-extrabold transition active:scale-95 ${
                        isMatch
                          ? 'border-ok bg-ok text-ok-fg'
                          : 'border-ok/40 bg-surface text-ok hover:bg-ok hover:text-ok-fg'
                      }`}
                    >
                      <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
                      <span>Coinciden ✓</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scoreTeamForPrompt(teamItem.id, 'mismatch')}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 px-2.5 py-2 text-xs font-extrabold transition active:scale-95 ${
                        isMismatch
                          ? 'border-err bg-err text-err-fg'
                          : 'border-err/40 bg-surface text-err hover:bg-err hover:text-err-fg'
                      }`}
                    >
                      <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
                      <span>Fallaron ✕</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Row 3: Optional Whiteboard Inputs */}
      <section className="w-full max-w-full rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-ink">{t.mentalSync.whiteboardsTitle}</span>
          <button
            type="button"
            onClick={() =>
              setWhiteboardAnswers({
                showWhiteboardsOnDisplay: !syncState.showWhiteboardsOnDisplay,
              })
            }
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              syncState.showWhiteboardsOnDisplay
                ? 'border-ink bg-ink text-canvas'
                : 'border-line bg-canvas text-ink hover:border-line-strong'
            }`}
          >
            {syncState.showWhiteboardsOnDisplay ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {syncState.showWhiteboardsOnDisplay
              ? t.mentalSync.whiteboardsVisible
              : t.mentalSync.showWhiteboards}
          </button>
        </div>

        <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={syncState.playerAAnswer}
            onChange={(e) => setWhiteboardAnswers({ playerAAnswer: e.target.value })}
            placeholder={t.mentalSync.playerWhiteboard(activeTeam?.playerA || 'A')}
            className="w-full max-w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-base font-semibold text-ink outline-none focus:border-accent sm:text-sm"
          />
          <input
            type="text"
            value={syncState.playerBAnswer}
            onChange={(e) => setWhiteboardAnswers({ playerBAnswer: e.target.value })}
            placeholder={t.mentalSync.playerWhiteboard(activeTeam?.playerB || 'B')}
            className="w-full max-w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-base font-semibold text-ink outline-none focus:border-accent sm:text-sm"
          />
        </div>
      </section>
    </div>
  );
}
