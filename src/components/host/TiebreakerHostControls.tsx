import { useCallback, useMemo } from 'react';
import {
  Brain,
  Crown,
  Gavel,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Zap,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { AUCTION_CATEGORY_BANK, MENTAL_SYNC_PROMPT_BANK } from '../../lib/spanishBank';
import {
  computeRemainingMs,
  createTimerState,
  formatBroadcastTimer,
  useSyncedTimer,
} from '../../lib/timer';
import {
  CONFIDENCE_AUCTION_MODULE_ID,
  normalizeConfidenceAuctionState,
} from '../../types/confidenceAuction';
import {
  MENTAL_SYNC_MODULE_ID,
  normalizeMentalSyncState,
} from '../../types/mentalSync';
import { TEAM_ACCENTS, type TiebreakerSource } from '../../types/show';

const TIEBREAKER_BONUS = 10;
const TIMER_PRESETS = [10, 15, 30];

export function TiebreakerHostControls() {
  const {
    state,
    role,
    updateTiebreaker,
    adjustTeamScore,
    setPodiumRevealStep,
    setDisplayMode,
    triggerCue,
  } = useShow();

  const tb = state.tiebreaker;

  const handleExpire = useCallback(() => {
    updateTiebreaker((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        remainingMs: 0,
        isRunning: false,
        startedAt: null,
      },
    }));
  }, [updateTiebreaker]);

  const remainingMs = useSyncedTimer({
    timer: tb.timer,
    role,
    triggerCue,
    onExpire: handleExpire,
  });

  // Ordenar equipos y detectar si hay empates en el marcador
  const { sortedTeams, tiedScores } = useMemo(() => {
    const sorted = [...state.teams].sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name)
    );
    const counts = new Map<number, number>();
    for (const tItem of sorted) {
      counts.set(tItem.score, (counts.get(tItem.score) ?? 0) + 1);
    }
    const tied = new Set<number>();
    for (const [score, count] of counts.entries()) {
      if (count > 1) tied.add(score);
    }
    return { sortedTeams: sorted, tiedScores: tied };
  }, [state.teams]);

  const drawRandomUnused = (source: TiebreakerSource) => {
    const firstTeamId = state.teams[0]?.id ?? null;
    const tbUsed = new Set(tb.usedPrompts);

    if (source === 'mental-sync') {
      const ms = normalizeMentalSyncState(state.moduleData[MENTAL_SYNC_MODULE_ID], firstTeamId);
      const msUsed = new Set(ms.recentPromptTexts);
      let candidates = MENTAL_SYNC_PROMPT_BANK.filter(
        (p) => !msUsed.has(p.text) && !tbUsed.has(p.text) && p.text !== tb.promptText
      );
      if (candidates.length === 0) {
        candidates = MENTAL_SYNC_PROMPT_BANK.filter((p) => p.text !== tb.promptText);
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      if (!chosen) return;

      updateTiebreaker((prev) => ({
        ...prev,
        source: 'mental-sync',
        promptText: chosen.text,
        promptHint: 'A la cuenta de 3, ambos se apuntan al mismo tiempo.',
        timerSeconds: 15,
        timer: createTimerState(15),
        winnerTeamId: null,
        usedPrompts: prev.usedPrompts.includes(chosen.text)
          ? prev.usedPrompts
          : [...prev.usedPrompts, chosen.text],
      }));
      triggerCue('cardFlip');
      return;
    }

    const auction = normalizeConfidenceAuctionState(
      state.moduleData[CONFIDENCE_AUCTION_MODULE_ID],
      firstTeamId
    );
    const usedIds = new Set(auction.usedCategoryIds);
    let candidates = AUCTION_CATEGORY_BANK.filter(
      (c) => !usedIds.has(c.id) && !tbUsed.has(c.title) && c.title !== tb.promptText
    );
    if (candidates.length === 0) {
      candidates = AUCTION_CATEGORY_BANK.filter((c) => c.title !== tb.promptText);
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) return;

    updateTiebreaker((prev) => ({
      ...prev,
      source: 'confidence-auction',
      promptText: chosen.title,
      promptHint: chosen.hint,
      timerSeconds: 30,
      timer: createTimerState(30),
      winnerTeamId: null,
      usedPrompts: prev.usedPrompts.includes(chosen.title)
        ? prev.usedPrompts
        : [...prev.usedPrompts, chosen.title],
    }));
    triggerCue('cardFlip');
  };

  const setTimerDuration = (seconds: number) => {
    updateTiebreaker((prev) => ({
      ...prev,
      timerSeconds: seconds,
      timer: createTimerState(seconds),
    }));
  };

  const startTimer = () => {
    updateTiebreaker((prev) => {
      const left = computeRemainingMs(prev.timer);
      const nextMs = left <= 0 ? prev.timerSeconds * 1000 : left;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          totalSeconds: prev.timerSeconds,
          remainingMs: nextMs,
          isRunning: true,
          startedAt: Date.now(),
        },
      };
    });
  };

  const pauseTimer = () => {
    updateTiebreaker((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        remainingMs: computeRemainingMs(prev.timer),
        isRunning: false,
        startedAt: null,
      },
    }));
  };

  const resetTimer = () => {
    updateTiebreaker((prev) => ({
      ...prev,
      timer: createTimerState(prev.timerSeconds),
    }));
  };

  const awardWinnerAndGoToPodium = (teamId: string) => {
    updateTiebreaker((prev) => ({
      ...prev,
      winnerTeamId: teamId,
      timer: prev.timer.isRunning
        ? {
            ...prev.timer,
            remainingMs: computeRemainingMs(prev.timer),
            isRunning: false,
            startedAt: null,
          }
        : prev.timer,
    }));
    adjustTeamScore(teamId, TIEBREAKER_BONUS, { silent: true });
    triggerCue('exactMatch');
    setPodiumRevealStep(0);
    setDisplayMode('podium');
  };

  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;

  return (
    <section className="w-full max-w-full space-y-4 rounded-2xl border-2 border-accent bg-surface p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 fill-current text-accent" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-ink uppercase">
              ⚡ Muerte Súbita · Desempate
            </h2>
            <p className="text-xs text-ink-muted">
              Saca 1 reto al azar sin usar y premia al equipo ganador con +{TIEBREAKER_BONUS} pts directo al Podio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDisplayMode('podium')}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-ink hover:border-line-strong"
        >
          <Crown className="h-3.5 w-3.5 text-accent" />
          <span>Ir al Podio</span>
        </button>
      </div>

      {/* Draw 1 Random Unused Prompt Buttons */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => drawRandomUnused('mental-sync')}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-extrabold text-accent-fg transition hover:opacity-90 active:scale-[0.98]"
        >
          <Brain className="h-4 w-4 shrink-0" />
          <span>Sincronía Mental al azar</span>
          <Shuffle className="h-3.5 w-3.5 shrink-0 opacity-80" />
        </button>

        <button
          type="button"
          onClick={() => drawRandomUnused('confidence-auction')}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-extrabold text-canvas transition hover:opacity-90 active:scale-[0.98]"
        >
          <Gavel className="h-4 w-4 shrink-0" />
          <span>Subasta de Confianza al azar</span>
          <Shuffle className="h-3.5 w-3.5 shrink-0 opacity-80" />
        </button>
      </div>

      {/* Active Prompt + Quick Timer */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="flex flex-col justify-center rounded-xl border border-line bg-canvas p-4 md:col-span-7">
          <span className="font-mono text-[10px] font-bold tracking-wider text-accent uppercase">
            {tb.source === 'confidence-auction' ? 'Subasta de Confianza' : 'Sincronía Mental'}
          </span>
          <p className="mt-1 break-words text-base font-extrabold text-ink">
            {tb.promptText || 'Toca uno de los botones de arriba para sacar una pregunta de desempate.'}
          </p>
          {tb.promptHint && (
            <p className="mt-1 text-xs text-ink-muted">{tb.promptHint}</p>
          )}
        </div>

        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-line bg-canvas p-4 md:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold text-ink-muted uppercase">
              Reloj rápido
            </span>
            <div className="flex items-center gap-1">
              {TIMER_PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerDuration(sec)}
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${
                    tb.timerSeconds === sec
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div
            className={`text-center font-mono text-5xl font-extrabold tabular-nums leading-none ${
              remainingMs === 0 || isUrgent ? 'text-err' : 'text-ink'
            }`}
          >
            {formatBroadcastTimer(remainingMs)}
            <span className="ml-1 text-base text-ink-subtle">s</span>
          </div>

          <div className="flex items-center gap-2">
            {tb.timer.isRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-warn text-sm font-extrabold text-warn-fg"
              >
                <Pause className="h-4 w-4 fill-current" />
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={startTimer}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent text-sm font-extrabold text-accent-fg"
              >
                <Play className="h-4 w-4 fill-current" />
                Iniciar {tb.timerSeconds}s
              </button>
            )}
            <button
              type="button"
              onClick={resetTimer}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-line bg-surface text-ink-muted hover:text-ink"
              aria-label="Reiniciar reloj de desempate"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1-Tap Winner Buttons (+10 pts & Jump Straight to Podium) */}
      <div className="space-y-2 border-t border-line pt-3">
        <div className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
          Elegir ganador del desempate (+{TIEBREAKER_BONUS} pts y saltar al Podio):
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortedTeams.map((team) => {
            const accent = TEAM_ACCENTS[team.accent];
            const isTied = tiedScores.has(team.score);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => awardWinnerAndGoToPodium(team.id)}
                className="flex min-h-[52px] items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-left transition hover:border-ok hover:bg-ok-soft active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent.hex }}
                    />
                    <span className="truncate text-sm font-extrabold text-ink uppercase">
                      {team.name}
                    </span>
                    {isTied && (
                      <span className="shrink-0 rounded bg-warn-soft px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-warn uppercase">
                        EMPATE
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 pl-4 text-[11px] text-ink-muted">
                    {team.score} pts actuales
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-ok px-2.5 py-1.5 font-mono text-xs font-extrabold text-ok-fg">
                  +{TIEBREAKER_BONUS} → Podio
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
