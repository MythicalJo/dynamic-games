import { useMemo, useState } from 'react';
import { Minus, Plus, Trophy } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';

interface QuickScoresRailProps {
  onOpenTeams: () => void;
}

const STEP_DELTAS = [-10, 10, 20, 50];

export function QuickScoresRail({ onOpenTeams }: QuickScoresRailProps) {
  const { state, adjustTeamScore, setDisplayMode, t } = useShow();
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const sortedTeams = useMemo(
    () => [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [state.teams]
  );

  const applyCustom = (teamId: string, sign: 1 | -1) => {
    const val = Number(customInputs[teamId]);
    if (!Number.isFinite(val) || val === 0) return;
    adjustTeamScore(teamId, Math.abs(Math.round(val)) * sign);
    setCustomInputs((prev) => ({ ...prev, [teamId]: '' }));
  };

  return (
    <aside className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold tracking-tight text-ink">Marcador en vivo</h2>
        </div>
        <button
          type="button"
          onClick={() => setDisplayMode('leaderboard')}
          className="text-xs font-semibold text-accent hover:underline"
        >
          Proyectar tabla
        </button>
      </div>

      {sortedTeams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong py-8 text-center">
          <p className="text-xs text-ink-muted">{t.common.noTeamsYet}</p>
          <button
            type="button"
            onClick={onOpenTeams}
            className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg"
          >
            Agregar parejas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTeams.map((team, idx) => {
            const accent = TEAM_ACCENTS[team.accent];
            return (
              <div
                key={team.id}
                className="rounded-xl border border-line bg-canvas p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink-subtle">
                        #{idx + 1}
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: accent.hex }}
                      />
                      <span className="truncate text-sm font-bold text-ink">{team.name}</span>
                    </div>
                    <div className="mt-0.5 pl-6 text-xs text-ink-muted">
                      {team.playerA} y {team.playerB}
                    </div>
                  </div>

                  <span className="font-mono text-xl font-extrabold text-ink tabular-nums">
                    {team.score.toLocaleString()}
                  </span>
                </div>

                {/* Tactile Score Actions (thumb-friendly on phones) */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <div className="grid flex-1 grid-cols-4 gap-1.5">
                    {STEP_DELTAS.map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustTeamScore(team.id, delta)}
                        className={`min-h-[42px] rounded-xl border py-2 font-mono text-xs font-bold transition active:scale-95 sm:min-h-0 sm:rounded-lg sm:py-1.5 ${
                          delta > 0
                            ? 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2'
                            : 'border-line bg-canvas text-err hover:bg-err-soft'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  <div className="flex min-h-[42px] items-center overflow-hidden rounded-xl border border-line bg-canvas sm:min-h-0 sm:rounded-lg">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="±"
                      value={customInputs[team.id] ?? ''}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({ ...prev, [team.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') applyCustom(team.id, 1);
                      }}
                      className="w-12 bg-transparent px-1.5 py-1.5 text-center font-mono text-sm font-semibold text-ink outline-none placeholder:text-ink-subtle sm:w-11 sm:py-1 sm:text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => applyCustom(team.id, -1)}
                      className="border-l border-line px-2.5 py-2 text-err hover:bg-err-soft sm:p-1.5"
                      title="Restar puntos"
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustom(team.id, 1)}
                      className="border-l border-line px-2.5 py-2 text-ok hover:bg-ok-soft sm:p-1.5"
                      title="Sumar puntos"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
