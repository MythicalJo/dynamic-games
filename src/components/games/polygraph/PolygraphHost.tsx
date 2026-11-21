import React, { useState } from 'react';
import {
  Activity,
  Check,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  ListPlus,
  Lock,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stamp,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import type {
  PolygraphPlayerSlot,
  PolygraphStatement,
  PolygraphVerdict,
} from '../../../types/polygraph';
import { usePolygraph } from './usePolygraph';

type PolyTab = 'live' | 'setup';

export function PolygraphHost() {
  const { state, setDisplayMode, t } = useShow();
  const {
    polyState,
    activeStatement,
    activeTeam,
    speakerName,
    interrogatorName,
    remainingMs,
    addStatement,
    updateStatement,
    deleteStatement,
    loadSampleStatements,
    pushStatementToScreen,
    setRewardPoints,
    startTimer,
    pauseTimer,
    resetTimer,
    addTenSeconds,
    lockGuess,
    revealVerdict,
    hideVerdict,
  } = usePolygraph();

  const [tab, setTab] = useState<PolyTab>('live');
  const [maskVerdicts, setMaskVerdicts] = useState(false);

  const [newText, setNewText] = useState('');
  const [newVerdict, setNewVerdict] = useState<PolygraphVerdict>('truth');
  const [newTeamId, setNewTeamId] = useState<string>(state.teams[0]?.id ?? '');
  const [newSlot, setNewSlot] = useState<PolygraphPlayerSlot>('A');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    statement: string;
    verdict: PolygraphVerdict;
    teamId: string;
    speakerSlot: PolygraphPlayerSlot;
  } | null>(null);

  const selectedFormTeam =
    state.teams.find((teamItem) => teamItem.id === (newTeamId || state.teams[0]?.id)) ?? null;
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 10;

  const handleAddStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addStatement({
      statement: newText,
      verdict: newVerdict,
      teamId: newTeamId || state.teams[0]?.id || null,
      speakerSlot: newSlot,
    });
    setNewText('');
  };

  const handleNextStatement = () => {
    if (polyState.statements.length === 0) return;
    const idx = polyState.statements.findIndex((s) => s.id === polyState.activeStatementId);
    const next = polyState.statements[(idx + 1) % polyState.statements.length];
    if (next) pushStatementToScreen(next.id);
  };

  const getPlayerLabel = (stmt: PolygraphStatement) => {
    const team = state.teams.find((teamItem) => teamItem.id === stmt.teamId);
    if (!team) return stmt.speakerSlot === 'B' ? 'B' : 'A';
    const speaker = stmt.speakerSlot === 'B' ? team.playerB : team.playerA;
    return `${speaker} (${team.name})`;
  };

  const verdictLabel = (v: PolygraphVerdict) =>
    v === 'truth' ? t.polygraph.truth : t.polygraph.lie;

  const isGuessCorrect =
    activeStatement &&
    polyState.lockedGuess !== null &&
    polyState.lockedGuess === activeStatement.verdict;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-rose-500/35 bg-gradient-to-br from-rose-500/12 via-studio-900 to-studio-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-400/50 bg-rose-500/15 glow-live">
              <Activity className="h-6 w-6 text-rose-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-3xl font-black tracking-wide text-white uppercase leading-none">
                  {t.polygraph.title}
                </h2>
                <span className="rounded-md border border-rose-400/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-rose-200 uppercase">
                  {t.polygraph.subtitle}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{t.polygraph.desc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMaskVerdicts((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              {maskVerdicts ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {maskVerdicts ? t.polygraph.showVerdicts : t.polygraph.hideVerdicts}
            </button>

            {state.displayMode !== 'game' && (
              <button
                type="button"
                onClick={() => setDisplayMode('game')}
                className="rounded-xl bg-cyan-400 px-3.5 py-2 text-xs font-extrabold text-studio-950 transition hover:brightness-110"
              >
                {t.common.pushToDisplay}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('live')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'live'
                ? 'border-rose-400/80 bg-rose-500/20 text-rose-100 glow-live'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Stamp className="h-4 w-4" />
            <span>{t.polygraph.tabs.live}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('setup')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'setup'
                ? 'border-cyan-400/75 bg-cyan-400/20 text-cyan-100 glow-cyan'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <ListPlus className="h-4 w-4" />
            <span>{t.polygraph.tabs.setup(polyState.statements.length)}</span>
          </button>
        </div>
      </section>

      {tab === 'live' && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-studio-900/90 p-5 xl:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  {t.polygraph.pushStatementLabel}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-mono text-slate-400">{t.polygraph.correctGuessPts}</span>
                    <input
                      type="number"
                      min={1}
                      value={polyState.rewardPoints}
                      onChange={(e) => setRewardPoints(Number(e.target.value))}
                      className="w-16 rounded-lg border border-white/15 bg-studio-950 px-2 py-1 text-center font-mono text-xs font-bold text-amber-300 outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStatement}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200"
                  >
                    {t.polygraph.nextStatement} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <select
                value={polyState.activeStatementId ?? ''}
                onChange={(e) => pushStatementToScreen(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
              >
                {polyState.statements.length === 0 && (
                  <option value="">{t.polygraph.noStatementsOption}</option>
                )}
                {polyState.statements.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    #{idx + 1} [{getPlayerLabel(s)}] {s.statement.slice(0, 72)}
                    {s.statement.length > 72 ? '...' : ''}
                  </option>
                ))}
              </select>

              {activeStatement ? (
                <div className="rounded-2xl border border-white/12 bg-studio-950/85 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                      <span className="rounded-md bg-amber-400/20 px-2.5 py-0.5 text-amber-200">
                        {t.polygraph.hotSeat}: {speakerName}
                      </span>
                      <span className="rounded-md bg-cyan-400/20 px-2.5 py-0.5 text-cyan-200">
                        {t.polygraph.interrogator}: {interrogatorName}
                      </span>
                    </div>

                    <span
                      className={`rounded-md px-2.5 py-0.5 font-mono text-xs font-extrabold uppercase ${
                        maskVerdicts
                          ? 'bg-white/10 text-slate-400'
                          : activeStatement.verdict === 'truth'
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {maskVerdicts
                        ? `${t.polygraph.secretLabel}: •••••`
                        : `${t.polygraph.secretLabel}: ${verdictLabel(activeStatement.verdict)}`}
                    </span>
                  </div>

                  <p className="text-base font-bold leading-snug text-white">
                    &ldquo;{activeStatement.statement}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 py-6 text-center text-sm text-slate-400">
                  {t.polygraph.emptyLive}
                </div>
              )}
            </div>

            <div
              className={`flex flex-col justify-between rounded-2xl border p-5 xl:col-span-5 ${
                isUrgent || remainingMs === 0
                  ? 'border-rose-500/80 bg-rose-500/15 glow-live'
                  : 'border-cyan-400/35 bg-studio-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                  <Clock className="h-4 w-4 text-rose-400" />
                  {t.polygraph.clockTitle}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  {polyState.timer.isRunning
                    ? t.polygraph.interrogating
                    : remainingMs === 0
                      ? t.common.timesUp
                      : t.common.ready}
                </span>
              </div>

              <div className="my-3 flex items-baseline justify-center gap-2">
                <span
                  className={`font-mono text-6xl font-black tabular-nums leading-none ${
                    remainingMs === 0 || isUrgent ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {formatBroadcastTimer(remainingMs)}
                </span>
                <span className="font-mono text-xl font-bold text-slate-400">{t.common.sec}</span>
              </div>

              <div className="flex items-center gap-2">
                {polyState.timer.isRunning ? (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-studio-950"
                  >
                    <Pause className="h-4 w-4 fill-current" />
                    {t.common.pause}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(255,51,88,0.3)] hover:brightness-110"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {t.polygraph.start60s}
                  </button>
                )}

                <button
                  type="button"
                  onClick={addTenSeconds}
                  className="rounded-xl border border-cyan-400/45 bg-cyan-400/12 px-3 py-3 font-mono text-xs font-extrabold text-cyan-200 hover:bg-cyan-400/25"
                >
                  +10s
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="rounded-xl border border-white/15 bg-white/5 p-3 text-slate-200 hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-2xl border border-white/10 bg-studio-900/90 p-5 lg:col-span-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  <Lock className="h-3.5 w-3.5" />
                  {t.polygraph.lockGuessTitle(interrogatorName)}
                </span>
                {polyState.lockedGuess && (
                  <button
                    type="button"
                    onClick={() => lockGuess(null)}
                    className="text-xs font-bold text-slate-400 hover:text-white"
                  >
                    {t.polygraph.clearGuess}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={polyState.verdictRevealed}
                  onClick={() => lockGuess('truth')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 font-display text-3xl font-black tracking-wider uppercase transition active:scale-95 disabled:opacity-60 ${
                    polyState.lockedGuess === 'truth'
                      ? 'border-emerald-300 bg-emerald-400 text-studio-950 shadow-[0_0_24px_rgba(52,211,153,0.45)]'
                      : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'
                  }`}
                >
                  <ShieldCheck className="h-6 w-6" />
                  <span>{t.polygraph.truth}</span>
                </button>

                <button
                  type="button"
                  disabled={polyState.verdictRevealed}
                  onClick={() => lockGuess('lie')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 font-display text-3xl font-black tracking-wider uppercase transition active:scale-95 disabled:opacity-60 ${
                    polyState.lockedGuess === 'lie'
                      ? 'border-rose-300 bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.45)]'
                      : 'border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                  }`}
                >
                  <ShieldAlert className="h-6 w-6" />
                  <span>{t.polygraph.lie}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-amber-400/35 bg-studio-900/90 p-5 lg:col-span-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                  <Stamp className="h-3.5 w-3.5" />
                  {t.polygraph.stampHeading}
                </span>
                {polyState.verdictRevealed && (
                  <span className="font-mono text-xs font-extrabold text-amber-300">
                    {isGuessCorrect
                      ? t.polygraph.correctCallToast(polyState.awardedPoints, activeTeam?.name ?? '')
                      : polyState.lockedGuess
                        ? t.polygraph.wrongGuessToast
                        : t.polygraph.revealedToast}
                  </span>
                )}
              </div>

              {polyState.verdictRevealed ? (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-4 font-display text-3xl font-black tracking-wider uppercase ${
                      activeStatement?.verdict === 'truth'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-rose-500 bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    <span>
                      {t.polygraph.verdictPrefix}{' '}
                      {activeStatement ? verdictLabel(activeStatement.verdict) : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={hideVerdict}
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-xs font-extrabold text-slate-200 hover:bg-white/10"
                  >
                    {t.polygraph.undoStamp}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!activeStatement}
                  onClick={revealVerdict}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-4 font-display text-3xl font-black tracking-wider text-studio-950 uppercase shadow-[0_0_30px_rgba(255,201,51,0.38)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                >
                  <Stamp className="h-7 w-7 stroke-[2.5]" />
                  <span>{t.polygraph.revealVerdictBtn}</span>
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'setup' && (
        <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {t.polygraph.setupTitle}
              </h3>
              <p className="text-xs text-slate-400">{t.polygraph.setupDesc}</p>
            </div>
            <button
              type="button"
              onClick={loadSampleStatements}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/12 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.polygraph.resetSamples}
            </button>
          </div>

          <form
            onSubmit={handleAddStatement}
            className="mb-5 space-y-3 rounded-2xl border border-rose-400/25 bg-studio-950/80 p-4"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.polygraph.teamPair}
                </label>
                <select
                  value={newTeamId || state.teams[0]?.id || ''}
                  onChange={(e) => setNewTeamId(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                >
                  {state.teams.map((teamItem) => (
                    <option key={teamItem.id} value={teamItem.id}>
                      {teamItem.name} ({teamItem.playerA} &amp; {teamItem.playerB})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.polygraph.assignedSpeaker}
                </label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value as PolygraphPlayerSlot)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-xs font-bold text-amber-200 outline-none focus:border-amber-400"
                >
                  <option value="A">
                    {selectedFormTeam ? `${selectedFormTeam.playerA} (A)` : 'A'}
                  </option>
                  <option value="B">
                    {selectedFormTeam ? `${selectedFormTeam.playerB} (B)` : 'B'}
                  </option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.polygraph.secretTag}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewVerdict('truth')}
                    className={`rounded-xl border py-2 font-mono text-xs font-extrabold ${
                      newVerdict === 'truth'
                        ? 'border-emerald-300 bg-emerald-400 text-studio-950'
                        : 'border-white/15 bg-studio-900 text-emerald-300'
                    }`}
                  >
                    {t.polygraph.truth}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVerdict('lie')}
                    className={`rounded-xl border py-2 font-mono text-xs font-extrabold ${
                      newVerdict === 'lie'
                        ? 'border-rose-300 bg-rose-500 text-white'
                        : 'border-white/15 bg-studio-900 text-rose-300'
                    }`}
                  >
                    {t.polygraph.lie}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                required
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={t.polygraph.statementPlaceholder}
                className="flex-1 rounded-xl border border-white/15 bg-studio-900 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-studio-950 hover:brightness-110"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {t.polygraph.addStatementBtn}
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {polyState.statements.map((stmt, idx) => {
              const isSelected = stmt.id === polyState.activeStatementId;
              const isEditing = editingId === stmt.id && editDraft !== null;

              if (isEditing && editDraft) {
                const editTeam = state.teams.find((teamItem) => teamItem.id === editDraft.teamId);
                return (
                  <div
                    key={stmt.id}
                    className="space-y-2.5 rounded-xl border border-cyan-400/50 bg-studio-850 p-3.5"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <select
                        value={editDraft.teamId}
                        onChange={(e) => setEditDraft({ ...editDraft, teamId: e.target.value })}
                        className="rounded-lg border border-white/15 bg-studio-950 px-2.5 py-1.5 text-xs font-bold text-white"
                      >
                        {state.teams.map((teamItem) => (
                          <option key={teamItem.id} value={teamItem.id}>
                            {teamItem.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editDraft.speakerSlot}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            speakerSlot: e.target.value as PolygraphPlayerSlot,
                          })
                        }
                        className="rounded-lg border border-white/15 bg-studio-950 px-2.5 py-1.5 text-xs font-bold text-amber-200"
                      >
                        <option value="A">{editTeam?.playerA ?? 'A'}</option>
                        <option value="B">{editTeam?.playerB ?? 'B'}</option>
                      </select>
                      <select
                        value={editDraft.verdict}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            verdict: e.target.value as PolygraphVerdict,
                          })
                        }
                        className="rounded-lg border border-white/15 bg-studio-950 px-2.5 py-1.5 font-mono text-xs font-bold text-white"
                      >
                        <option value="truth">{t.polygraph.truth}</option>
                        <option value="lie">{t.polygraph.lie}</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editDraft.statement}
                      onChange={(e) => setEditDraft({ ...editDraft, statement: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (editDraft.statement.trim()) {
                            updateStatement(stmt.id, {
                              statement: editDraft.statement,
                              verdict: editDraft.verdict,
                              teamId: editDraft.teamId || null,
                              speakerSlot: editDraft.speakerSlot,
                            });
                          }
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                        className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-extrabold text-studio-950"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={stmt.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 ${
                    isSelected
                      ? 'border-rose-400/60 bg-rose-500/10'
                      : 'border-white/10 bg-studio-950/65'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-200">
                        {getPlayerLabel(stmt)}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase ${
                          maskVerdicts
                            ? 'bg-white/5 text-slate-500'
                            : stmt.verdict === 'truth'
                              ? 'bg-emerald-400/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {maskVerdicts ? '•••••' : verdictLabel(stmt.verdict)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">
                      &ldquo;{stmt.statement}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        pushStatementToScreen(stmt.id);
                        setTab('live');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                        isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/10 text-white hover:bg-rose-500'
                      }`}
                    >
                      {isSelected ? t.polygraph.onScreen : t.polygraph.pushToScreen}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(stmt.id);
                        setEditDraft({
                          statement: stmt.statement,
                          verdict: stmt.verdict,
                          teamId: stmt.teamId ?? state.teams[0]?.id ?? '',
                          speakerSlot: stmt.speakerSlot,
                        });
                      }}
                      className="rounded-lg border border-white/12 p-1.5 text-slate-300 hover:text-cyan-300"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStatement(stmt.id)}
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
