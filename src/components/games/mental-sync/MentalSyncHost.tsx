import React, { useState } from 'react';
import {
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
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import type { GameHostProps } from '../../../modules/registry';
import {
  MENTAL_SYNC_MATCH_POINTS,
} from '../../../types/mentalSync';
import { useMentalSync } from './useMentalSync';

export function MentalSyncHost({ mode }: GameHostProps) {
  const { state, t } = useShow();
  const {
    syncState,
    activeTeam,
    activePrompt,
    remainingMs,
    addPrompt,
    updatePrompt,
    deletePrompt,
    loadSamplePrompts,
    selectPrompt,
    setActiveTeam,
    setTimerEnabled,
    startTimer,
    pauseTimer,
    resetTimer,
    setWhiteboardAnswers,
    triggerResult,
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
  /* SETUP MODE: Prompts Bank                                              */
  /* ===================================================================== */
  if (mode === 'setup') {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">{t.mentalSync.setupTitle}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t.mentalSync.setupDesc}</p>
          </div>
          <button
            type="button"
            onClick={loadSamplePrompts}
            className="rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
          >
            {t.mentalSync.resetSamples}
          </button>
        </div>

        <form
          onSubmit={handleAddPrompt}
          className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-line bg-canvas p-4 md:grid-cols-12"
        >
          <div className="md:col-span-10">
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              {t.mentalSync.promptText}
            </label>
            <input
              type="text"
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={t.mentalSync.promptPlaceholder}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-fg"
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
                    className="flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
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
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-subtle">#{idx + 1}</span>
                    <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted uppercase">
                      {t.mentalSync.whoTag}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">{p.text}</p>
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
  /* LIVE MODE: Pair + Prompt + Optional 15s Timer + Match/Mismatch        */
  /* ===================================================================== */
  const resolvePromptText = (text: string) =>
    text.replace(/\[Nombre\]/gi, activeTeam?.playerA || 'tu pareja');
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Pair & Active Prompt */}
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 md:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">{t.mentalSync.title}</h2>
            <select
              value={activeTeam?.id ?? ''}
              onChange={(e) => setActiveTeam(e.target.value)}
              className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-accent"
            >
              {state.teams.length === 0 && (
                <option value="">{t.common.noTeamsRegistered}</option>
              )}
              {state.teams.map((teamItem) => (
                <option key={teamItem.id} value={teamItem.id}>
                  {teamItem.name} ({teamItem.playerA} y {teamItem.playerB})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-ink-muted uppercase">
                {t.mentalSync.activePrompt(
                  currentIdx >= 0 ? currentIdx + 1 : 0,
                  syncState.prompts.length
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepPrompt(-1)}
                  className="rounded-lg border border-line bg-canvas p-1 text-ink-muted hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => stepPrompt(1)}
                  className="rounded-lg border border-line bg-canvas p-1 text-ink-muted hover:text-ink"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <select
              value={syncState.selectedPromptId ?? ''}
              onChange={(e) => selectPrompt(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              {syncState.prompts.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  #{idx + 1} · {resolvePromptText(p.text)}
                </option>
              ))}
            </select>

            {activePrompt && (
              <div className="mt-3 rounded-xl border border-line bg-canvas p-4">
                <span className="font-mono text-[10px] font-bold tracking-wider text-accent uppercase">
                  {t.mentalSync.whoTag}
                </span>
                <p className="mt-1 text-base font-bold text-ink">
                  {resolvePromptText(activePrompt.text)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optional 15s Timer */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 md:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {t.mentalSync.optionalTimer}
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

          <div
            className={`my-3 text-center font-mono text-6xl font-extrabold tabular-nums leading-none ${
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
                {t.mentalSync.start15s}
              </button>
            )}
            <button
              type="button"
              onClick={resetTimer}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-ink-muted hover:text-ink active:scale-95 sm:min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Optional Whiteboard Inputs */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-ink">{t.mentalSync.whiteboardsTitle}</span>
          <button
            type="button"
            onClick={() =>
              setWhiteboardAnswers({
                showWhiteboardsOnDisplay: !syncState.showWhiteboardsOnDisplay,
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={syncState.playerAAnswer}
            onChange={(e) => setWhiteboardAnswers({ playerAAnswer: e.target.value })}
            placeholder={t.mentalSync.playerWhiteboard(activeTeam?.playerA || 'A')}
            className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
          />
          <input
            type="text"
            value={syncState.playerBAnswer}
            onChange={(e) => setWhiteboardAnswers({ playerBAnswer: e.target.value })}
            placeholder={t.mentalSync.playerWhiteboard(activeTeam?.playerB || 'B')}
            className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
          />
        </div>
      </section>

      {/* Big Result Triggers */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
            {t.mentalSync.triggerHeading}
          </span>
          {syncState.result !== 'pending' && (
            <button
              type="button"
              onClick={() => triggerResult('pending')}
              className="rounded-lg border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              {t.mentalSync.clearOverlay}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!activeTeam}
            onClick={() => triggerResult('match')}
            className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xl font-extrabold uppercase transition active:scale-[0.98] disabled:opacity-40 ${
              syncState.result === 'match'
                ? 'border-ok bg-ok text-ok-fg'
                : 'border-ok/45 bg-ok-soft text-ok hover:bg-ok hover:text-ok-fg'
            }`}
          >
            <Check className="h-6 w-6 stroke-[2.5]" />
            <span>{t.mentalSync.matchBtn(MENTAL_SYNC_MATCH_POINTS)}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerResult('mismatch')}
            className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xl font-extrabold uppercase transition active:scale-[0.98] ${
              syncState.result === 'mismatch'
                ? 'border-err bg-err text-err-fg'
                : 'border-err/45 bg-err-soft text-err hover:bg-err hover:text-err-fg'
            }`}
          >
            <X className="h-6 w-6 stroke-[2.5]" />
            <span>{t.mentalSync.mismatchBtn}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
