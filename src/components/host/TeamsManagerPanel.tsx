import React, { useState } from 'react';
import {
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
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
      name: name.trim() || `${playerA.trim() || 'Player A'} & ${playerB.trim() || 'Player B'}`,
      playerA: playerA.trim() || 'Player A',
      playerB: playerB.trim() || 'Player B',
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
      playerA: editDraft.playerA || 'A',
      playerB: editDraft.playerB || 'B',
      score: Number(editDraft.score) || 0,
      accent: editDraft.accent,
    });
    setEditingId(null);
    setEditDraft(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Friend Pair Card */}
      <section className="rounded-2xl border border-cyan-400/25 bg-studio-900/90 p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              {t.teams.addTitle}
            </h2>
            <p className="text-xs text-slate-400">{t.teams.addDesc}</p>
          </div>
        </div>

        <form onSubmit={handleAddTeam} className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.teams.teamName}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.teamNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.teams.playerA}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.playerAPlaceholder}
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.teams.playerB}
            </label>
            <input
              type="text"
              required
              placeholder={t.teams.playerBPlaceholder}
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.teams.startScore}
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 font-mono text-sm font-bold text-amber-300 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-12">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t.teams.stageColor}
              </span>
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
                      className={`h-7 w-7 rounded-full border-2 transition ${style.dot} ${
                        selected
                          ? 'scale-110 border-white shadow-[0_0_12px_rgba(255,255,255,0.65)]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2.5 text-sm font-extrabold text-studio-950 shadow-[0_0_20px_rgba(255,201,51,0.28)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              {t.teams.addBtn}
            </button>
          </div>
        </form>
      </section>

      {/* Registered Teams List */}
      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              {t.teams.registeredTitle(state.teams.length)}
            </h2>
          </div>

          {state.teams.length > 0 && (
            <div className="flex items-center gap-2">
              {confirmResetScores ? (
                <>
                  <span className="text-xs font-semibold text-amber-300">
                    {t.teams.zeroAllConfirm}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllScores();
                      setConfirmResetScores(false);
                    }}
                    className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-400"
                  >
                    {t.teams.confirmReset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetScores(false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    {t.common.cancel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmResetScores(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-amber-400/40 hover:text-amber-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.teams.resetAllScores}
                </button>
              )}
            </div>
          )}
        </div>

        {state.teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 py-12 text-center text-sm text-slate-400">
            {t.teams.emptyState}
          </div>
        ) : (
          <div className="space-y-3">
            {state.teams.map((team) => {
              const isEditing = editingId === team.id && editDraft !== null;
              const accentStyle = TEAM_ACCENTS[team.accent];

              if (isEditing && editDraft) {
                return (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-cyan-400/50 bg-studio-850/90 p-4"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <label className="mb-1 block text-[11px] font-bold text-slate-400 uppercase">
                          {t.teams.teamName}
                        </label>
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-bold text-slate-400 uppercase">
                          {t.teams.playerA}
                        </label>
                        <input
                          type="text"
                          value={editDraft.playerA}
                          onChange={(e) => setEditDraft({ ...editDraft, playerA: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-bold text-slate-400 uppercase">
                          {t.teams.playerB}
                        </label>
                        <input
                          type="text"
                          value={editDraft.playerB}
                          onChange={(e) => setEditDraft({ ...editDraft, playerB: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-[11px] font-bold text-slate-400 uppercase">
                          {t.teams.totalScore}
                        </label>
                        <input
                          type="number"
                          value={editDraft.score}
                          onChange={(e) => setEditDraft({ ...editDraft, score: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 font-mono text-sm font-bold text-amber-300 outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {ACCENT_ORDER.map((colorKey) => (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => setEditDraft({ ...editDraft, accent: colorKey })}
                            className={`h-6 w-6 rounded-full border-2 ${TEAM_ACCENTS[colorKey].dot} ${
                              editDraft.accent === colorKey
                                ? 'scale-110 border-white'
                                : 'border-transparent opacity-55 hover:opacity-100'
                            }`}
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
                          className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t.common.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(team.id)}
                          className="flex items-center gap-1 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-studio-950 hover:brightness-110"
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
                  className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-studio-950/65 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accentStyle.bar}`} />

                  <div className="min-w-0 pl-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${accentStyle.dot}`} />
                      <span className="truncate font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                        {team.name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-slate-300">
                      <span className="font-semibold text-white">{team.playerA}</span>
                      <span className={`mx-2 font-black ${accentStyle.text}`}>&amp;</span>
                      <span className="font-semibold text-white">{team.playerB}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pl-2 sm:pl-0">
                    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-studio-900 p-1">
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, -50)}
                        className="rounded-lg px-2 py-1 font-mono text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                      >
                        -50
                      </button>
                      <span className="min-w-[68px] text-center font-mono text-base font-extrabold text-amber-300 tabular-nums">
                        {team.score.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustTeamScore(team.id, 50)}
                        className="rounded-lg px-2 py-1 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        +50
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => startEdit(team)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
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
                          className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white hover:bg-rose-400"
                        >
                          {t.common.confirm}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-xl border border-white/15 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(team.id)}
                        className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/25"
                      >
                        <Trash2 className="h-4 w-4" />
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
