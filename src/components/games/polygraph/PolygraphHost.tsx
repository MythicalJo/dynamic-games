import React, { useState } from 'react';
import {
  Activity,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { POLYGRAPH_TEMPLATE_IDEAS } from '../../../lib/spanishBank';
import { formatBroadcastTimer } from '../../../lib/timer';
import type { GameHostProps } from '../../../modules/registry';
import {
  POLYGRAPH_MODULE_ID,
  type PolygraphPlayerSlot,
  type PolygraphStatement,
  type PolygraphVerdict,
} from '../../../types/polygraph';
import { RulesToggleButton } from '../../host/RulesToggleButton';
import { TeamSelectorStrip } from '../../host/TeamSelectorStrip';
import { usePolygraph } from './usePolygraph';

export function PolygraphHost({ mode }: GameHostProps) {
  const { state, t } = useShow();
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
    selectTeamForLive,
    setRewardPoints,
    startTimer,
    pauseTimer,
    resetTimer,
    addTenSeconds,
    lockGuess,
    revealVerdict,
    hideVerdict,
  } = usePolygraph();

  const [maskVerdicts, setMaskVerdicts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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
    if (!team) return stmt.speakerSlot === 'B' ? 'Jugador B' : 'Jugador A';
    const speaker = stmt.speakerSlot === 'B' ? team.playerB : team.playerA;
    return `${speaker} (${team.name})`;
  };

  const verdictLabel = (v: PolygraphVerdict) =>
    v === 'truth' ? t.polygraph.truth : t.polygraph.lie;

  /* ===================================================================== */
  /* SETUP MODE: Statements Bank                                           */
  /* ===================================================================== */
  if (mode === 'setup') {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
              <Activity className="h-5 w-5 shrink-0 text-accent" />
              <span>{t.polygraph.setupTitle}</span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t.polygraph.setupDesc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                showTemplates
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line bg-canvas text-ink hover:border-line-strong'
              }`}
            >
              Plantillas ({POLYGRAPH_TEMPLATE_IDEAS.length})
            </button>
            <button
              type="button"
              onClick={() => setMaskVerdicts((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              {maskVerdicts ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {maskVerdicts ? t.polygraph.showVerdicts : t.polygraph.hideVerdicts}
            </button>
            <button
              type="button"
              onClick={loadSampleStatements}
              className="rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
            >
              {t.polygraph.resetSamples}
            </button>
          </div>
        </div>

        {/* Quick Inspiration Templates */}
        {showTemplates && (
          <div className="mb-5 rounded-xl border border-line bg-canvas p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                {POLYGRAPH_TEMPLATE_IDEAS.length} ideas rápidas para inspirar a los jugadores (clic para copiar al campo)
              </span>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="text-xs text-ink-subtle hover:text-ink"
              >
                Cerrar
              </button>
            </div>
            <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1 md:grid-cols-2">
              {POLYGRAPH_TEMPLATE_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewText(idea)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-left text-xs text-ink transition hover:border-accent"
                >
                  <span className="mr-1.5 font-mono text-[10px] font-bold text-ink-subtle">
                    {idx + 1}.
                  </span>
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleAddStatement}
          className="mb-5 space-y-3 rounded-xl border border-line bg-canvas p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                {t.polygraph.teamPair}
              </label>
              <select
                value={newTeamId || state.teams[0]?.id || ''}
                onChange={(e) => setNewTeamId(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
              >
                {state.teams.map((teamItem) => (
                  <option key={teamItem.id} value={teamItem.id}>
                    {teamItem.name} ({teamItem.playerA} y {teamItem.playerB})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                {t.polygraph.assignedSpeaker}
              </label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value as PolygraphPlayerSlot)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
              >
                <option value="A">{selectedFormTeam ? selectedFormTeam.playerA : 'Jugador A'}</option>
                <option value="B">{selectedFormTeam ? selectedFormTeam.playerB : 'Jugador B'}</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                {t.polygraph.secretTag}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewVerdict('truth')}
                  className={`rounded-lg border py-2 font-mono text-xs font-bold ${
                    newVerdict === 'truth'
                      ? 'border-ok bg-ok text-ok-fg'
                      : 'border-line bg-surface text-ok'
                  }`}
                >
                  {t.polygraph.truth}
                </button>
                <button
                  type="button"
                  onClick={() => setNewVerdict('lie')}
                  className={`rounded-lg border py-2 font-mono text-xs font-bold ${
                    newVerdict === 'lie'
                      ? 'border-err bg-err text-err-fg'
                      : 'border-line bg-surface text-err'
                  }`}
                >
                  {t.polygraph.lie}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={t.polygraph.statementPlaceholder}
              className="flex-1 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-xs font-bold text-accent-fg"
            >
              <Plus className="h-4 w-4" />
              {t.polygraph.addStatementBtn}
            </button>
          </div>
        </form>

        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
          {polyState.statements.map((stmt, idx) => {
            const isSelected = stmt.id === polyState.activeStatementId;
            const isEditing = editingId === stmt.id && editDraft !== null;

            if (isEditing && editDraft) {
              const editTeam = state.teams.find((teamItem) => teamItem.id === editDraft.teamId);
              return (
                <div key={stmt.id} className="space-y-2.5 bg-surface p-3.5">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <select
                      value={editDraft.teamId}
                      onChange={(e) => setEditDraft({ ...editDraft, teamId: e.target.value })}
                      className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-semibold text-ink"
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
                      className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-semibold text-ink"
                    >
                      <option value="A">{editTeam?.playerA ?? 'Jugador A'}</option>
                      <option value="B">{editTeam?.playerB ?? 'Jugador B'}</option>
                    </select>
                    <select
                      value={editDraft.verdict}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          verdict: e.target.value as PolygraphVerdict,
                        })
                      }
                      className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 font-mono text-xs font-bold text-ink"
                    >
                      <option value="truth">{t.polygraph.truth}</option>
                      <option value="lie">{t.polygraph.lie}</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editDraft.statement}
                    onChange={(e) => setEditDraft({ ...editDraft, statement: e.target.value })}
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft(null);
                      }}
                      className="rounded-lg border border-line p-2 text-ink-muted"
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
                      className="rounded-lg bg-accent p-2 text-accent-fg"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={stmt.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink-subtle">#{idx + 1}</span>
                    <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink">
                      {getPlayerLabel(stmt)}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        maskVerdicts
                          ? 'bg-surface-2 text-ink-subtle'
                          : stmt.verdict === 'truth'
                            ? 'bg-ok-soft text-ok'
                            : 'bg-err-soft text-err'
                      }`}
                    >
                      {maskVerdicts ? '•••••' : verdictLabel(stmt.verdict)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">«{stmt.statement}»</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => pushStatementToScreen(stmt.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-ink text-canvas'
                        : 'border border-line bg-surface text-ink hover:border-line-strong'
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
                    className="rounded-lg border border-line p-1.5 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStatement(stmt.id)}
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
  /* LIVE MODE: Statement + 60s Interrogation Clock + Guess + Reveal Stamp */
  /* ===================================================================== */
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 10;
  const isGuessCorrect =
    activeStatement &&
    polyState.lockedGuess !== null &&
    polyState.lockedGuess === activeStatement.verdict;

  return (
    <div className="w-full max-w-full space-y-5">
      <section className="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-12">
        {/* Statement Selector + 1-Tap Team Strip */}
        <div className="w-full max-w-full min-w-0 space-y-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5 md:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
              <Activity className="h-5 w-5 shrink-0 text-accent" />
              <span>{t.polygraph.title}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <RulesToggleButton moduleId={POLYGRAPH_MODULE_ID} />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-ink-muted">{t.polygraph.correctGuessPts}</span>
                <input
                  type="number"
                  min={1}
                  value={polyState.rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  className="w-14 rounded-lg border border-line bg-canvas px-2 py-1 text-center font-mono text-xs font-bold text-ink outline-none focus:border-accent"
                />
              </div>
              <button
                type="button"
                onClick={handleNextStatement}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                {t.polygraph.nextStatement} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <TeamSelectorStrip
            selectedTeamId={activeTeam?.id ?? null}
            onSelectTeam={selectTeamForLive}
            label="Equipo en silla caliente:"
          />

          <select
            value={polyState.activeStatementId ?? ''}
            onChange={(e) => pushStatementToScreen(e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
          >
            {polyState.statements.length === 0 && (
              <option value="">{t.polygraph.noStatementsOption}</option>
            )}
            {polyState.statements.map((s, idx) => (
              <option key={s.id} value={s.id}>
                #{idx + 1} [{getPlayerLabel(s)}] {s.statement.slice(0, 68)}
                {s.statement.length > 68 ? '...' : ''}
              </option>
            ))}
          </select>

          {activeStatement ? (
            <div className="rounded-xl border border-line bg-canvas p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-ink-muted">
                  <strong className="text-ink">{speakerName}</strong> vs{' '}
                  <strong className="text-accent">{interrogatorName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setMaskVerdicts((v) => !v)}
                  className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${
                    maskVerdicts
                      ? 'bg-surface-2 text-ink-subtle'
                      : activeStatement.verdict === 'truth'
                        ? 'bg-ok-soft text-ok'
                        : 'bg-err-soft text-err'
                  }`}
                >
                  {maskVerdicts
                    ? `${t.polygraph.secretLabel}: •••••`
                    : `${t.polygraph.secretLabel}: ${verdictLabel(activeStatement.verdict)}`}
                </button>
              </div>
              <p className="text-base font-bold leading-snug text-ink">
                «{activeStatement.statement}»
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line-strong py-6 text-center text-xs text-ink-muted">
              {t.polygraph.emptyLive}
            </div>
          )}
        </div>

        {/* 60-Second Interrogation Timer */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-5 md:col-span-5 ${
            isUrgent || remainingMs === 0 ? 'border-err bg-err-soft' : 'border-line bg-surface'
          }`}
        >
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
            {t.polygraph.clockTitle}
          </span>

          <div
            className={`my-3 text-center font-mono text-6xl font-extrabold tabular-nums leading-none ${
              remainingMs === 0 || isUrgent ? 'text-err' : 'text-ink'
            }`}
          >
            {formatBroadcastTimer(remainingMs)}
            <span className="ml-1 text-lg font-semibold text-ink-subtle">s</span>
          </div>

          <div className="flex items-center gap-2">
            {polyState.timer.isRunning ? (
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
                {t.polygraph.start60s}
              </button>
            )}
            <button
              type="button"
              onClick={addTenSeconds}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3.5 py-2.5 font-mono text-xs font-bold text-ink active:scale-95 sm:min-h-[44px]"
            >
              +10s
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3 py-2.5 text-ink-muted hover:text-ink active:scale-95 sm:min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Lock Guess + Reveal Stamp */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="rounded-2xl border border-line bg-surface p-5 md:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {t.polygraph.lockGuessTitle(interrogatorName)}
            </span>
            {polyState.lockedGuess && (
              <button
                type="button"
                onClick={() => lockGuess(null)}
                className="text-xs font-semibold text-ink-muted hover:text-ink"
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
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xl font-extrabold uppercase transition active:scale-95 disabled:opacity-60 ${
                polyState.lockedGuess === 'truth'
                  ? 'border-ok bg-ok text-ok-fg'
                  : 'border-ok/40 bg-ok-soft text-ok hover:bg-ok hover:text-ok-fg'
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
              <span>{t.polygraph.truth}</span>
            </button>

            <button
              type="button"
              disabled={polyState.verdictRevealed}
              onClick={() => lockGuess('lie')}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xl font-extrabold uppercase transition active:scale-95 disabled:opacity-60 ${
                polyState.lockedGuess === 'lie'
                  ? 'border-err bg-err text-err-fg'
                  : 'border-err/40 bg-err-soft text-err hover:bg-err hover:text-err-fg'
              }`}
            >
              <ShieldAlert className="h-5 w-5" />
              <span>{t.polygraph.lie}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 md:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {t.polygraph.stampHeading}
            </span>
            {polyState.verdictRevealed && (
              <span className="font-mono text-[11px] font-bold text-accent">
                {isGuessCorrect
                  ? t.polygraph.correctCallToast(polyState.awardedPoints, activeTeam?.name ?? '')
                  : polyState.lockedGuess
                    ? t.polygraph.wrongGuessToast
                    : t.polygraph.revealedToast}
              </span>
            )}
          </div>

          {polyState.verdictRevealed ? (
            <div className="flex items-center gap-2.5">
              <div
                className={`flex flex-1 items-center justify-center rounded-2xl border-2 py-4 text-xl font-extrabold uppercase ${
                  activeStatement?.verdict === 'truth'
                    ? 'border-ok bg-ok-soft text-ok'
                    : 'border-err bg-err-soft text-err'
                }`}
              >
                {t.polygraph.verdictPrefix}{' '}
                {activeStatement ? verdictLabel(activeStatement.verdict) : ''}
              </div>
              <button
                type="button"
                onClick={hideVerdict}
                className="rounded-2xl border border-line bg-canvas px-4 py-4 text-xs font-bold text-ink-muted hover:text-ink"
              >
                {t.polygraph.undoStamp}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!activeStatement}
              onClick={revealVerdict}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink py-4 text-xl font-extrabold text-canvas uppercase transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              <Stamp className="h-5 w-5" />
              <span>{t.polygraph.revealVerdictBtn}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
