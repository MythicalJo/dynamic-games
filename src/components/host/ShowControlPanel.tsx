import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Crown,
  Minus,
  Music,
  Plus,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { getActiveGameModule } from '../../modules/registry';
import { TEAM_ACCENTS } from '../../types/show';
import type { HostTab } from './HostSidebar';

interface ShowControlPanelProps {
  onNavigate: (tab: HostTab) => void;
}

const QUICK_DELTAS = [-100, 100, 250, 500];

export function ShowControlPanel({ onNavigate }: ShowControlPanelProps) {
  const { state, adjustTeamScore, updateStageState, triggerCue, setDisplayMode, t } = useShow();
  const [customPoints, setCustomPoints] = useState<Record<string, string>>({});

  const sortedTeams = useMemo(
    () => [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [state.teams]
  );

  const leader = sortedTeams[0] ?? null;
  const activeModule = getActiveGameModule(state.activeModuleId);
  const localizedMod =
    t.modules.list[activeModule.id as keyof typeof t.modules.list] ?? activeModule;
  const activeQuestion =
    state.questions.find((q) => q.id === state.stageState.selectedQuestionId) ?? null;

  const handleApplyCustom = (teamId: string, sign: 1 | -1) => {
    const raw = customPoints[teamId];
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed === 0) return;
    adjustTeamScore(teamId, Math.abs(Math.round(parsed)) * sign);
    setCustomPoints((prev) => ({ ...prev, [teamId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/12 via-studio-900 to-studio-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-amber-300/90 uppercase">
            <span>{t.showControl.currentLeader}</span>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          {leader ? (
            <div className="mt-2">
              <div className="truncate font-display text-3xl font-black text-white uppercase">
                {leader.name}
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  {leader.playerA} &amp; {leader.playerB}
                </span>
                <span className="font-mono font-extrabold text-amber-300">
                  {leader.score.toLocaleString()} {t.common.pts.toLowerCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-400">{t.showControl.addTeamsToTrack}</div>
          )}
        </div>

        <div className="rounded-2xl border border-cyan-400/25 bg-studio-900/90 p-5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-cyan-300 uppercase">
            <span>{t.showControl.activeGameModule}</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="font-display text-2xl font-black tracking-wide text-white uppercase">
              {localizedMod.shortName}
            </div>
            {activeModule.id === 'rapid-stage' && activeQuestion ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                {activeQuestion.category}: {activeQuestion.prompt}
              </p>
            ) : (
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">{localizedMod.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('game')}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
          >
            {t.showControl.openModuleControls(localizedMod.shortName)}{' '}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-400 uppercase">
            <span>{t.showControl.broadcastSfx}</span>
            <Music className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{t.showControl.broadcastSfxDesc}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => triggerCue('fanfare')}
              className="rounded-xl border border-amber-400/40 bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-400/25"
            >
              {t.showControl.winnerFanfare}
            </button>
            <button
              type="button"
              onClick={() => triggerCue('reveal')}
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/25"
            >
              {t.showControl.revealSting}
            </button>
            <button
              type="button"
              onClick={() => triggerCue('scoreUp')}
              className="rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20"
            >
              {t.showControl.pointsDing}
            </button>
            <button
              type="button"
              onClick={() => triggerCue('miss')}
              className="rounded-xl border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-400/20"
            >
              {t.showControl.wrongBuzzer}
            </button>
          </div>
        </div>
      </div>

      {/* Live Quick-Scoring Deck */}
      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              <Trophy className="h-5 w-5 text-amber-400" />
              {t.showControl.liveScoringDeck}
            </h2>
            <p className="text-xs text-slate-400">{t.showControl.liveScoringDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDisplayMode('leaderboard')}
              className="rounded-xl border border-amber-400/40 bg-amber-400/15 px-3.5 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-400/25"
            >
              {t.showControl.showLeaderboardNow}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('teams')}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
            >
              <Users className="h-3.5 w-3.5" />
              {t.showControl.managePairs}
            </button>
          </div>
        </div>

        {sortedTeams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 py-10 text-center">
            <p className="text-sm font-semibold text-slate-300">{t.common.noTeamsYet}</p>
            <button
              type="button"
              onClick={() => onNavigate('teams')}
              className="mt-3 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-extrabold text-studio-950 transition hover:brightness-110"
            >
              {t.showControl.addFirstPair}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTeams.map((team, idx) => {
              const accent = TEAM_ACCENTS[team.accent];
              const isSpotlight = state.stageState.spotlightTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-4 transition lg:flex-row lg:items-center lg:justify-between ${
                    isSpotlight
                      ? `${accent.border} bg-studio-850/90`
                      : 'border-white/10 bg-studio-950/65 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accent.bar}`} />

                  <div className="flex min-w-0 items-center gap-4 pl-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-studio-850 font-display text-xl font-black text-slate-300">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                          {team.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateStageState({
                              spotlightTeamId: isSpotlight ? null : team.id,
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold transition ${
                            isSpotlight
                              ? 'border-amber-400/60 bg-amber-400/20 text-amber-200'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          {isSpotlight ? t.showControl.onStageBadge : t.showControl.spotlight}
                        </button>
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        {team.playerA} &amp; {team.playerB}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pl-2 lg:pl-0">
                    <div className="min-w-[96px] rounded-xl border border-white/10 bg-studio-900 px-3.5 py-2 text-right">
                      <div className="font-mono text-2xl font-extrabold text-amber-300 tabular-nums leading-none">
                        {team.score.toLocaleString()}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] font-bold tracking-widest text-slate-500">
                        {t.common.score}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {QUICK_DELTAS.map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => adjustTeamScore(team.id, delta)}
                          className={`rounded-xl border px-3 py-2 font-mono text-xs font-extrabold transition active:scale-95 ${
                            delta > 0
                              ? 'border-emerald-400/35 bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/25'
                              : 'border-rose-400/35 bg-rose-400/12 text-rose-200 hover:bg-rose-400/25'
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-studio-900">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={t.showControl.customPlaceholder}
                        value={customPoints[team.id] ?? ''}
                        onChange={(e) =>
                          setCustomPoints((prev) => ({ ...prev, [team.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleApplyCustom(team.id, 1);
                        }}
                        className="w-20 bg-transparent px-2.5 py-2 font-mono text-xs font-bold text-white outline-none placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCustom(team.id, -1)}
                        className="border-l border-white/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCustom(team.id, 1)}
                        className="border-l border-white/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
