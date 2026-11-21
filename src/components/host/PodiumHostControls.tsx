import { useMemo } from 'react';
import { Crown, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';

export function PodiumHostControls() {
  const { state, setPodiumRevealStep, triggerCue } = useShow();
  const step = state.podiumRevealStep;

  const topThree = useMemo(
    () => [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 3),
    [state.teams]
  );

  const steps: { target: 1 | 2 | 3; label: string; teamIdx: number }[] = [
    { target: 1, label: 'Revelar 3.º', teamIdx: 2 },
    { target: 2, label: 'Revelar 2.º', teamIdx: 1 },
    { target: 3, label: 'Revelar 1.º', teamIdx: 0 },
  ];

  return (
    <section className="w-full max-w-full space-y-4 rounded-2xl border-2 border-accent/40 bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-accent" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-ink">
              Gran Final · Control del Podio
            </h2>
            <p className="text-xs text-ink-muted">
              Revela los ganadores paso a paso (1.er lugar dispara fanfarria y confeti).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {step === 3 && (
            <button
              type="button"
              onClick={() => triggerCue('fanfare')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fanfarria</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setPodiumRevealStep(0)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Ocultar podio</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Reveal Buttons */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
        {steps.map(({ target, label, teamIdx }) => {
          const team = topThree[teamIdx];
          const revealed = step >= target;
          const isNext = step === target - 1;
          return (
            <button
              key={target}
              type="button"
              onClick={() => setPodiumRevealStep(target)}
              className={`flex min-h-[64px] flex-col items-start justify-between rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                revealed
                  ? target === 3
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-ok bg-ok-soft text-ink'
                  : isNext
                    ? 'border-accent bg-canvas text-ink hover:bg-accent-soft'
                    : 'border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-extrabold">
                  {target === 3 ? (
                    <Crown className="h-4 w-4 shrink-0" />
                  ) : (
                    <Trophy className="h-4 w-4 shrink-0" />
                  )}
                  {label}
                </span>
                {revealed && (
                  <span className="font-mono text-[10px] font-bold uppercase opacity-80">
                    Visible ✓
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex w-full items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 truncate font-semibold">
                  {team && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          revealed && target === 3
                            ? 'currentColor'
                            : TEAM_ACCENTS[team.accent].hex,
                      }}
                    />
                  )}
                  <span className="truncate">{team ? team.name : '—'}</span>
                </span>
                {team && (
                  <span className="shrink-0 font-mono font-bold">
                    {team.score} pts
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
