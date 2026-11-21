import React, { useState } from 'react';
import { Check, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { ACCENT_ORDER, TEAM_ACCENTS, type Team, type TeamAccent } from '../../types/show';

export function TeamsManagerPanel() {
  const { state, addTeam, updateTeam, deleteTeam, adjustTeamScore, resetAllScores, t } = useShow();

  const [name, setName] = useState('');
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [score, setScore] = useState('0');
  const [accent, setAccent] = useState<TeamAccent>(
    ACCENT_ORDER[state.teams.length % ACCENT_ORDER.length]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    playerA: string;
    playerB: string;
    score: string;
    accent: TeamAccent;
  } | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetScores, setConfirmResetScores] = useState(false);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !playerA.trim() && !playerB.trim()) return;

    addTeam({
      name: name.trim() || `${playerA.trim() || 'Jugador A'} y ${playerB.trim() || 'Jugador B'}`,
      playerA: playerA.trim() || 'Jugador A',
      playerB: playerB.trim() || 'Jugador B',
      score: Number(score) || 0,
      accent,
    });

    setName('');
    setPlayerA('');
    setPlayerB('');
    setScore('0');
    setAccent(ACCENT_ORDER[(state.teams.length + 1) % ACCENT_ORDER.length]);
  };

  const startEdit = (team: Team) => {
    setEditingId(team.id);
    setConfirmDeleteId(null);
    setEditDraft({
      name: team.name,
      playerA: team.playerA,
      playerB: team.playerB,
      score: String(team.score),
      accent: team.accent,
    });
  };

  const saveEdit = (id: string) => {
    if (!editDraft) return;
    updateTeam(id, {
      name: editDraft.name || 'EQUIPO',
      playerA: editDraft.playerA || 'Jugador A',
      playerB: editDraft.playerB || 'Jugador B',
      score: Number(editDraft.score) || 0,
      accent: editDraft.accent,
    });
    setEditingId(null);
    setEditDraft(null);
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Add Friend Pair */}
      <section className="w-full max-w-full overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-tight text-ink">{t.teams.addTitle}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t.teams.addDesc}</p>
        </div>

        <form onSubmit={handleAddTeam} className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.teams.teamName}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.teamNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.teams.playerA}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.playerAPlaceholder}
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.teams.playerB}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.playerBPlaceholder}
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.teams.startScore}
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 font-mono text-sm font-bold text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 md:col-span-12">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-ink-muted">{t.teams.stageColor}</span>
              <div className="flex items-center gap-2">
                {ACCENT_ORDER.map((colorKey) => {
                  const style = TEAM_ACCENTS[colorKey];
                  const selected = accent === colorKey;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setAccent(colorKey)}
                      title={style.label}
                      className={`h-6 w-6 rounded-full transition ${
                        selected ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: style.hex }}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {t.teams.addBtn}
            </button>
          </div>
        </form>
      </section>

      {/* Registered Teams List */}
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            {t.teams.registeredTitle(state.teams.length)}
          </h2>

          {state.teams.length > 0 && (
            <div className="flex items-center gap-2">
              {confirmResetScores ? (
                <>
                  <span className="text-xs font-medium text-warn">{t.teams.zeroAllConfirm}</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllScores();
                      setConfirmResetScores(false);
                    }}
                    className="rounded-lg bg-err px-3 py-1.5 text-xs font-semibold text-err-fg"
                  >
                    {t.teams.confirmReset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetScores(false)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    {t.common.cancel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmResetScores(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-line-strong hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.teams.resetAllScores}
                </button>
              )}
            </div>
          )}
        </div>

        {state.teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong py-10 text-center text-sm text-ink-muted">
            {t.teams.emptyState}
          </div>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
            {state.teams.map((team) => {
              const isEditing = editingId === team.id && editDraft !== null;
              const accentStyle = TEAM_ACCENTS[team.accent];

              if (isEditing && editDraft) {
                return (
                  <div key={team.id} className="space-y-3 bg-surface p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <label className="mb-1 block text-[11px] font-semibold text-ink-muted">
                          {t.teams.teamName}
                        </label>
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-semibold text-ink-muted">
                          {t.teams.playerA}
                        </label>
                        <input
                          type="text"
                          value={editDraft.playerA}
                          onChange={(e) => setEditDraft({ ...editDraft, playerA: e.target.value })}
                          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-semibold text-ink-muted">
                          {t.teams.playerB}
                        </label>
                        <input
                          type="text"
                          value={editDraft.playerB}
                          onChange={(e) => setEditDraft({ ...editDraft, playerB: e.target.value })}
                          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-[11px] font-semibold text-ink-muted">
                          {t.teams.totalScore}
                        </label>
                        <input
                          type="number"
                          value={editDraft.score}
                          onChange={(e) => setEditDraft({ ...editDraft, score: e.target.value })}
                          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-sm font-bold text-ink outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {ACCENT_ORDER.map((colorKey) => (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => setEditDraft({ ...editDraft, accent: colorKey })}
                            className={`h-5 w-5 rounded-full ${
                              editDraft.accent === colorKey
                                ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface'
                                : 'opacity-50 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: TEAM_ACCENTS[colorKey].hex }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t.common.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(team.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-fg"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t.teams.saveChanges}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={team.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accentStyle.hex }}
                      />
                      <span className="truncate text-base font-bold text-ink">{team.name}</span>
                    </div>
                    <div className="mt-0.5 pl-5 text-xs text-ink-muted">
                      {team.playerA} y {team.playerB}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-5 sm:pl-0">
                    <div className="flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-surface p-1">
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, -10)}
                        className="min-h-[34px] rounded-lg px-2 py-1 font-mono text-xs font-bold text-err hover:bg-err-soft active:scale-95"
                      >
                        −10
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, -5)}
                        className="min-h-[34px] rounded-lg px-2 py-1 font-mono text-xs font-bold text-err hover:bg-err-soft active:scale-95"
                      >
                        −5
                      </button>
                      <span className="min-w-[54px] text-center font-mono text-sm font-extrabold text-ink tabular-nums">
                        {team.score.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, 5)}
                        className="min-h-[34px] rounded-lg px-2 py-1 font-mono text-xs font-bold text-ok hover:bg-ok-soft active:scale-95"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, 10)}
                        className="min-h-[34px] rounded-lg px-2 py-1 font-mono text-xs font-bold text-ok hover:bg-ok-soft active:scale-95"
                      >
                        +10
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => startEdit(team)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted hover:border-line-strong hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t.common.edit}
                    </button>

                    {confirmDeleteId === team.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            deleteTeam(team.id);
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg bg-err px-2.5 py-1.5 text-xs font-bold text-err-fg"
                        >
                          {t.common.confirm}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-line px-2 py-1.5 text-xs text-ink-muted"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(team.id)}
                        className="rounded-lg border border-line p-1.5 text-ink-subtle hover:border-err/40 hover:bg-err-soft hover:text-err"
                        title="Eliminar pareja"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
