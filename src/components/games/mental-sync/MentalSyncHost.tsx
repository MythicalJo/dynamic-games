import React, { useState } from 'react';
import {
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  ListPlus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import {
  MENTAL_SYNC_MATCH_POINTS,
  type MentalSyncPromptType,
} from '../../../types/mentalSync';
import { useMentalSync } from './useMentalSync';

type SyncTab = 'live' | 'setup';

export function MentalSyncHost() {
  const { state, setDisplayMode, t } = useShow();
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

  const [tab, setTab] = useState<SyncTab>('live');
  const [newType, setNewType] = useState<MentalSyncPromptType>('who');
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<MentalSyncPromptType>('who');
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
    addPrompt(newType, newText);
    setNewText('');
  };

  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-500/12 via-studio-900 to-studio-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/50 bg-cyan-400/15 glow-cyan">
              <Brain className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-3xl font-black tracking-wide text-gradient-cyan uppercase leading-none">
                  {t.mentalSync.title}
                </h2>
                <span className="rounded-md border border-cyan-400/35 bg-cyan-400/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-cyan-200 uppercase">
                  {t.mentalSync.subtitle}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                {t.mentalSync.desc(MENTAL_SYNC_MATCH_POINTS)}
              </p>
            </div>
          </div>

          {state.displayMode !== 'game' && (
            <button
              type="button"
              onClick={() => setDisplayMode('game')}
              className="self-start rounded-xl bg-cyan-400 px-3.5 py-2 text-xs font-extrabold text-studio-950 transition hover:brightness-110 lg:self-center"
            >
              {t.common.pushToDisplay}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('live')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'live'
                ? 'border-cyan-400/80 bg-cyan-400/20 text-cyan-100 glow-cyan'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>{t.mentalSync.tabs.live}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('setup')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'setup'
                ? 'border-amber-400/75 bg-amber-400/20 text-amber-100 glow-gold'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <ListPlus className="h-4 w-4" />
            <span>{t.mentalSync.tabs.setup(syncState.prompts.length)}</span>
          </button>
        </div>
      </section>

      {tab === 'live' && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-studio-900/90 p-5 xl:col-span-7">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {t.mentalSync.activePair}
                </label>
                <select
                  value={activeTeam?.id ?? ''}
                  onChange={(e) => setActiveTeam(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
                >
                  {state.teams.length === 0 && (
                    <option value="">{t.common.noTeamsRegistered}</option>
                  )}
                  {state.teams.map((teamItem) => (
                    <option key={teamItem.id} value={teamItem.id}>
                      {teamItem.name} ({teamItem.playerA} &amp; {teamItem.playerB}) —{' '}
                      {teamItem.score} {t.common.pts.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                    {t.mentalSync.activePrompt(
                      currentIdx >= 0 ? currentIdx + 1 : 0,
                      syncState.prompts.length
                    )}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepPrompt(-1)}
                      className="rounded-lg border border-white/15 bg-white/5 p-1 text-slate-300 hover:bg-white/15"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepPrompt(1)}
                      className="rounded-lg border border-white/15 bg-white/5 p-1 text-slate-300 hover:bg-white/15"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <select
                  value={syncState.selectedPromptId ?? ''}
                  onChange={(e) => selectPrompt(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
                >
                  {syncState.prompts.map((p, idx) => (
                    <option key={p.id} value={p.id}>
                      #{idx + 1} {p.text}
                    </option>
                  ))}
                </select>

                {activePrompt && (
                  <div className="mt-3 rounded-xl border border-cyan-400/25 bg-studio-950/85 p-3.5">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                      {activePrompt.type === 'who' ? t.mentalSync.whoTag : t.mentalSync.fillTag}
                    </span>
                    <p className="mt-1 text-base font-bold text-white">{activePrompt.text}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-studio-900/90 p-5 xl:col-span-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  {t.mentalSync.optionalTimer}
                </span>

                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-300">
                  <span>{t.mentalSync.showOnDisplay}</span>
                  <input
                    type="checkbox"
                    checked={syncState.timerEnabled}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400"
                  />
                </label>
              </div>

              <div className="my-3 text-center">
                <div
                  className={`font-mono text-6xl font-black tabular-nums leading-none ${
                    !syncState.timerEnabled
                      ? 'text-slate-600'
                      : remainingMs === 0 || isUrgent
                        ? 'text-rose-400'
                        : 'text-cyan-300'
                  }`}
                >
                  {formatBroadcastTimer(remainingMs)}
                  <span className="ml-1 text-xl font-bold text-slate-500">s</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {syncState.timer.isRunning ? (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-studio-950"
                  >
                    <Pause className="h-4 w-4 fill-current" />
                    {t.common.pause}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-extrabold text-studio-950 hover:brightness-110"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {t.mentalSync.start15s}
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetTimer}
                  className="rounded-xl border border-white/15 bg-white/5 p-2.5 text-slate-200 hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-extrabold tracking-wide text-white uppercase">
                  {t.mentalSync.whiteboardsTitle}
                </h3>
                <p className="text-xs text-slate-400">{t.mentalSync.whiteboardsDesc}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWhiteboardAnswers({
                    showWhiteboardsOnDisplay: !syncState.showWhiteboardsOnDisplay,
                  })
                }
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                  syncState.showWhiteboardsOnDisplay
                    ? 'border-cyan-400 bg-cyan-400 text-studio-950'
                    : 'border-cyan-400/45 bg-cyan-400/12 text-cyan-200 hover:bg-cyan-400/25'
                }`}
              >
                {syncState.showWhiteboardsOnDisplay ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {syncState.showWhiteboardsOnDisplay
                  ? t.mentalSync.whiteboardsVisible
                  : t.mentalSync.showWhiteboards}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-xs font-bold text-cyan-300 uppercase">
                  {t.mentalSync.playerWhiteboard(activeTeam?.playerA || 'A')}
                </label>
                <input
                  type="text"
                  value={syncState.playerAAnswer}
                  onChange={(e) => setWhiteboardAnswers({ playerAAnswer: e.target.value })}
                  placeholder={t.mentalSync.typeAnswerPlaceholder(activeTeam?.playerA || 'A')}
                  className="w-full rounded-xl border border-cyan-400/25 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-bold text-amber-300 uppercase">
                  {t.mentalSync.playerWhiteboard(activeTeam?.playerB || 'B')}
                </label>
                <input
                  type="text"
                  value={syncState.playerBAnswer}
                  onChange={(e) => setWhiteboardAnswers({ playerBAnswer: e.target.value })}
                  placeholder={t.mentalSync.typeAnswerPlaceholder(activeTeam?.playerB || 'B')}
                  className="w-full rounded-xl border border-amber-400/25 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                {t.mentalSync.triggerHeading}
              </span>
              {syncState.result !== 'pending' && (
                <button
                  type="button"
                  onClick={() => triggerResult('pending')}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-white/15"
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
                className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-5 font-display text-3xl font-black tracking-wider uppercase transition active:scale-[0.98] disabled:opacity-40 ${
                  syncState.result === 'match'
                    ? 'border-amber-300 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-studio-950 shadow-[0_0_32px_rgba(52,211,153,0.45)]'
                    : 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                }`}
              >
                <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
                <span>{t.mentalSync.matchBtn(MENTAL_SYNC_MATCH_POINTS)}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerResult('mismatch')}
                className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-5 font-display text-3xl font-black tracking-wider uppercase transition active:scale-[0.98] ${
                  syncState.result === 'mismatch'
                    ? 'border-rose-400 bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.45)]'
                    : 'border-rose-400/50 bg-rose-500/12 text-rose-200 hover:bg-rose-500/25'
                }`}
              >
                <XCircle className="h-7 w-7 stroke-[2.5]" />
                <span>{t.mentalSync.mismatchBtn}</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === 'setup' && (
        <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {t.mentalSync.setupTitle}
              </h3>
              <p className="text-xs text-slate-400">{t.mentalSync.setupDesc}</p>
            </div>
            <button
              type="button"
              onClick={loadSamplePrompts}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/12 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.mentalSync.resetSamples}
            </button>
          </div>

          <form
            onSubmit={handleAddPrompt}
            className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-cyan-400/25 bg-studio-950/80 p-4 md:grid-cols-12"
          >
            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                {t.mentalSync.promptType}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as MentalSyncPromptType)}
                className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-xs font-bold text-cyan-200 outline-none focus:border-cyan-400"
              >
                <option value="who">{t.mentalSync.whoTag}</option>
                <option value="fill">{t.mentalSync.fillTag}</option>
              </select>
            </div>
            <div className="md:col-span-7">
              <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                {t.mentalSync.promptText}
              </label>
              <input
                type="text"
                required
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={t.mentalSync.promptPlaceholder}
                className="w-full rounded-xl border border-white/15 bg-studio-900 px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-extrabold text-studio-950 hover:brightness-110"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {t.common.add}
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {syncState.prompts.map((p, idx) => {
              const isSelected = p.id === syncState.selectedPromptId;
              const isEditing = editingId === p.id;

              if (isEditing) {
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 rounded-xl border border-cyan-400/50 bg-studio-850 p-3 sm:flex-row"
                  >
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as MentalSyncPromptType)}
                      className="rounded-lg border border-white/15 bg-studio-950 px-2.5 py-1.5 text-xs font-bold text-cyan-200"
                    >
                      <option value="who">{t.mentalSync.whoTag}</option>
                      <option value="fill">{t.mentalSync.fillTag}</option>
                    </select>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-studio-950 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (editText.trim()) updatePrompt(p.id, { type: editType, text: editText });
                          setEditingId(null);
                        }}
                        className="rounded-lg bg-cyan-400 p-2 text-studio-950"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-white/15 p-2 text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 ${
                    isSelected
                      ? 'border-cyan-400/60 bg-cyan-400/10'
                      : 'border-white/10 bg-studio-950/65'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          p.type === 'who'
                            ? 'bg-cyan-400/20 text-cyan-200'
                            : 'bg-fuchsia-400/20 text-fuchsia-200'
                        }`}
                      >
                        {p.type === 'who' ? t.mentalSync.whoTag : t.mentalSync.fillTag}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{p.text}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        selectPrompt(p.id);
                        setTab('live');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                        isSelected
                          ? 'bg-cyan-400 text-studio-950'
                          : 'bg-white/10 text-white hover:bg-cyan-400 hover:text-studio-950'
                      }`}
                    >
                      {isSelected ? t.common.onStage : t.common.loadLive}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(p.id);
                        setEditType(p.type);
                        setEditText(p.text);
                      }}
                      className="rounded-lg border border-white/12 p-1.5 text-slate-300 hover:text-cyan-300"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePrompt(p.id)}
                      className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
