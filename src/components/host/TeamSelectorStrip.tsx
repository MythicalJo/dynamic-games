import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';

interface TeamSelectorStripProps {
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  label?: string;
}

/**
 * Tira compacta de botones de 1 toque para cambiar de pareja/equipo al instante
 * sin tener que abrir menús desplegables en móvil.
 */
export function TeamSelectorStrip({
  selectedTeamId,
  onSelectTeam,
  label = 'Equipo activo:',
}: TeamSelectorStripProps) {
  const { state, t } = useShow();

  if (state.teams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-canvas px-3 py-2 text-xs text-ink-muted">
        {t.common.noTeamsRegistered}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-1.5">
      <div className="font-mono text-[10px] font-bold tracking-wider text-ink-subtle uppercase">
        {label}
      </div>
      <div className="flex w-full max-w-full flex-wrap items-center gap-1.5">
        {state.teams.map((team) => {
          const active = team.id === selectedTeamId;
          const accent = TEAM_ACCENTS[team.accent];
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelectTeam(team.id)}
              className={`inline-flex min-h-[40px] max-w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition active:scale-[0.97] sm:min-h-[36px] ${
                active
                  ? 'border-accent bg-accent text-accent-fg shadow-xs'
                  : 'border-line bg-canvas text-ink hover:border-line-strong hover:bg-surface-2'
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/15"
                style={{ backgroundColor: active ? 'currentColor' : accent.hex }}
              />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-xs font-extrabold uppercase">
                  {team.name}
                </span>
                <span
                  className={`block truncate text-[10px] font-medium ${
                    active ? 'opacity-85' : 'text-ink-muted'
                  }`}
                >
                  {team.playerA} y {team.playerB}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
